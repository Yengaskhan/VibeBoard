#!/usr/bin/env node
/**
 * Enrich existing apps that are missing screenshots by rendering them via
 * the Microlink screenshot API, uploading to Supabase Storage, and
 * writing the URL back to the row.
 *
 * Only touches rows where screenshot_urls is null or empty.
 * Never creates new rows. Safe to re-run.
 *
 * Usage:
 *   node scripts/enrich-screenshots.mjs --dry-run      # preview
 *   node scripts/enrich-screenshots.mjs                # execute
 *   node scripts/enrich-screenshots.mjs --limit 5      # process only 5
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (required — we're UPDATEing apps table)
 *
 * Microlink free tier: ~50 requests/day.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

// ---------- env ----------
const ROOT = new URL('..', import.meta.url).pathname
await loadDotenv(`${ROOT}.env.local`)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const DRY_RUN = process.argv.includes('--dry-run')
const LIMIT = (() => {
  const i = process.argv.indexOf('--limit')
  if (i === -1) return Infinity
  const n = parseInt(process.argv[i + 1], 10)
  return Number.isFinite(n) ? n : Infinity
})()

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---------- pipeline ----------
const { data: rows, error } = await sb
  .from('apps')
  .select('id, slug, title, url, screenshot_urls')
  .order('created_at', { ascending: true })

if (error) {
  console.error('Could not read apps:', error.message)
  process.exit(1)
}

const missing = (rows ?? []).filter(
  (r) => !r.screenshot_urls || r.screenshot_urls.length === 0,
)
console.log(`${rows.length} apps total, ${missing.length} missing screenshots`)

if (missing.length === 0) {
  console.log('Nothing to enrich. Exiting.')
  process.exit(0)
}

if (DRY_RUN) console.log('[DRY RUN] — no changes will be made\n')

const audit = []
let processed = 0
for (const app of missing) {
  if (processed >= LIMIT) break
  processed++
  const header = `${app.title.padEnd(32)} → ${app.slug}`

  if (DRY_RUN) {
    console.log(`  PLAN   ${header}  url=${app.url}`)
    audit.push({ slug: app.slug, status: 'planned' })
    continue
  }

  console.log(`  SHOT   ${header}  rendering...`)
  let imgUrl = await fetchScreenshot(app.url)
  let renderer = 'microlink'
  if (!imgUrl) {
    console.log(`         ${' '.repeat(32)}    microlink failed, trying thum.io...`)
    imgUrl = await fetchScreenshotThumIo(app.url)
    renderer = 'thum.io'
  }
  if (!imgUrl) {
    console.log(`         ${' '.repeat(32)}    all renderers failed, skipping`)
    audit.push({ slug: app.slug, status: 'render-failed' })
    continue
  }

  const uploaded = await uploadImage(imgUrl, app.slug)
  if (!uploaded) {
    console.log(`         ${' '.repeat(32)}    upload failed, skipping`)
    audit.push({ slug: app.slug, status: 'upload-failed', imgUrl })
    continue
  }

  const { error: updErr } = await sb
    .from('apps')
    .update({ screenshot_urls: [uploaded] })
    .eq('id', app.id)

  if (updErr) {
    console.log(`         ${' '.repeat(32)}    DB update failed: ${updErr.message}`)
    audit.push({ slug: app.slug, status: 'db-failed', error: updErr.message })
    continue
  }

  console.log(`  OK     ${header}  via ${renderer}`)
  audit.push({ slug: app.slug, status: 'enriched', renderer, screenshot: uploaded })

  // Gentle pacing — Microlink free tier is rate-limited
  await new Promise((r) => setTimeout(r, 500))
}

const logPath = `${ROOT}scripts/enrich-audit-${Date.now()}.json`
await writeFile(logPath, JSON.stringify(audit, null, 2))
console.log(`\nAudit log: ${logPath}`)

const counts = audit.reduce((acc, a) => {
  acc[a.status] = (acc[a.status] ?? 0) + 1
  return acc
}, {})
console.log('Summary:', counts)

// =====================================================================
// helpers
// =====================================================================

async function loadDotenv(path) {
  try {
    const text = await readFile(path, 'utf8')
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
      if (!m) continue
      let v = m[2].trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = v
    }
  } catch {
    /* fine */
  }
}

/**
 * Use Microlink API to generate a screenshot.
 * Free tier: 50 req/day.
 * Docs: https://microlink.io/docs/api/parameters/screenshot
 */
async function fetchScreenshot(targetUrl) {
  try {
    const api = new URL('https://api.microlink.io/')
    api.searchParams.set('url', targetUrl)
    api.searchParams.set('screenshot', 'true')
    api.searchParams.set('viewport.width', '1440')
    api.searchParams.set('viewport.height', '900')

    const ac = new AbortController()
    const timeout = setTimeout(() => ac.abort(), 45_000)
    const res = await fetch(api.toString(), { signal: ac.signal })
    clearTimeout(timeout)

    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 'success') return null
    return data.data?.screenshot?.url ?? null
  } catch {
    return null
  }
}

/**
 * Fallback: thum.io — also free, different headless renderer config.
 * Sometimes catches sites that Microlink couldn't (different UA, different wait strategy).
 * URL format: https://image.thum.io/get/width/1440/crop/900/<raw-url>
 */
async function fetchScreenshotThumIo(targetUrl) {
  try {
    // thum.io returns an image directly. We upload its response bytes.
    // But we need to return a URL that our uploadImage() will fetch.
    // So just return the thum.io URL itself — uploadImage will download it.
    const url = `https://image.thum.io/get/width/1440/crop/900/${targetUrl}`

    // Quick health check: HEAD the URL. If it's a real image, we're good.
    const ac = new AbortController()
    const timeout = setTimeout(() => ac.abort(), 30_000)
    const head = await fetch(url, { method: 'HEAD', signal: ac.signal })
    clearTimeout(timeout)

    if (!head.ok) return null
    const ct = head.headers.get('content-type') ?? ''
    if (!ct.startsWith('image/')) return null
    return url
  } catch {
    return null
  }
}

async function uploadImage(imgUrl, slug) {
  try {
    const ac = new AbortController()
    const timeout = setTimeout(() => ac.abort(), 15_000)
    const res = await fetch(imgUrl, { signal: ac.signal, redirect: 'follow' })
    clearTimeout(timeout)
    if (!res.ok) return null

    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 2000) return null // almost certainly a placeholder / error image

    const ct = res.headers.get('content-type') ?? 'image/png'
    const ext = ct.includes('jpeg') ? 'jpg' : ct.includes('webp') ? 'webp' : 'png'
    const path = `enrich/${slug}-0.${ext}`

    const { error } = await sb.storage.from('screenshots').upload(path, buf, {
      contentType: ct,
      upsert: true,
    })
    if (error) return null

    const { data } = sb.storage.from('screenshots').getPublicUrl(path)
    return data.publicUrl
  } catch {
    return null
  }
}
