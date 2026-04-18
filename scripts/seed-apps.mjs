#!/usr/bin/env node
/**
 * Seed VibeBoard with apps from seed-submissions.md
 *
 * Features:
 *   - Parses the research markdown
 *   - Fetches OG image for each URL (5s timeout)
 *   - Uploads screenshots to Supabase Storage
 *   - Creates "ghost" users for each unique Twitter handle so apps are attributed to the real creator
 *   - Idempotent: re-running skips already-seeded slugs
 *   - Dry-run mode: --dry-run prints a plan and exits
 *
 * Usage:
 *   node scripts/seed-apps.mjs --dry-run          # preview
 *   node scripts/seed-apps.mjs                    # execute
 *   node scripts/seed-apps.mjs --skip-screenshots # faster, no OG fetch
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (get from Supabase dashboard → project settings → API)
 */

import { readFile, writeFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

// ---------- env loader (doesn't depend on Next.js) ----------
const ROOT = new URL('..', import.meta.url).pathname
await loadDotenv(`${ROOT}.env.local`)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ---------- args ----------
const DRY_RUN = process.argv.includes('--dry-run')
const SKIP_SHOTS = process.argv.includes('--skip-screenshots')

if (!SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}

if (!SERVICE_KEY && !DRY_RUN) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local')
  console.error('Get it from: Supabase dashboard → Project settings → API → service_role secret')
  console.error('(Dry-run mode can proceed with just the anon key — re-run with --dry-run to preview)')
  process.exit(1)
}

if (!SERVICE_KEY && DRY_RUN && !ANON_KEY) {
  console.error('Missing both SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// ---------- supabase (service-role for real runs, anon for dry-run) ----------
const usingServiceKey = !!SERVICE_KEY
const sb = createClient(SUPABASE_URL, SERVICE_KEY ?? ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
if (!usingServiceKey) {
  console.log('(Running dry-run with anon key — ghost-user creation will be simulated only)\n')
}

const ghostCache = {}

// ---------- pipeline ----------
const mdPath = `${ROOT}seed-submissions.md`
const md = await readFile(mdPath, 'utf8')
const entries = parseSeedMarkdown(md)

console.log(`Parsed ${entries.length} entries from seed-submissions.md`)
if (DRY_RUN) console.log('[DRY RUN] — no changes will be made\n')

const existingSlugs = await getExistingSlugs()
const tagBySlug = await loadTags()
const audit = []

const NATIVE_ONLY_HOSTS = ['apps.apple.com', 'play.google.com']

for (const entry of entries) {
  const slug = slugify(entry.name)
  const header = `${entry.name.padEnd(32)} → ${slug}`

  // Skip native (App Store / Play Store) links — VibeBoard is for web-accessible apps
  try {
    const host = new URL(entry.url).hostname
    if (NATIVE_ONLY_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
      console.log(`  SKIP   ${header}  (native app store link, not web-accessible)`)
      audit.push({ name: entry.name, slug, status: 'skipped-native' })
      continue
    }
  } catch {
    console.log(`  SKIP   ${header}  (invalid URL: ${entry.url})`)
    audit.push({ name: entry.name, slug, status: 'skipped-bad-url' })
    continue
  }

  if (existingSlugs.has(slug)) {
    console.log(`  SKIP   ${header}  (slug exists)`)
    audit.push({ name: entry.name, slug, status: 'skipped-exists' })
    continue
  }

  // Resolve tags
  const tagIds = []
  const badTags = []
  for (const t of entry.tags) {
    if (tagBySlug[t]) tagIds.push(tagBySlug[t])
    else badTags.push(t)
  }
  if (badTags.length) {
    console.log(`  WARN   ${header}  unknown tags: ${badTags.join(', ')}`)
  }

  // Fetch OG image
  let screenshotUrls = []
  if (!SKIP_SHOTS && entry.url) {
    const og = await fetchOgImage(entry.url)
    if (og) {
      if (DRY_RUN) {
        screenshotUrls = [`[would upload: ${og.slice(0, 80)}${og.length > 80 ? '…' : ''}]`]
      } else {
        const uploaded = await uploadImage(og, slug)
        if (uploaded) screenshotUrls = [uploaded]
      }
    }
  }

  // Creator ghost user
  const userId = await ensureGhostUser(entry.creator)

  // Build long_description with attribution
  const long = buildLongDescription(entry)

  if (DRY_RUN) {
    console.log(`  PLAN   ${header}  tags=[${entry.tags.join(',')}] creator=${entry.creator.handle ?? 'community'} shot=${screenshotUrls.length ? 'yes' : 'no'}`)
    audit.push({ name: entry.name, slug, status: 'planned', userId, screenshotUrls, tagIds })
    continue
  }

  // Insert app
  const { data: app, error } = await sb
    .from('apps')
    .insert({
      title: entry.name,
      slug,
      short_description: entry.description.slice(0, 280),
      long_description: long,
      url: entry.url,
      embed_code: null,
      screenshot_urls: screenshotUrls,
      user_id: userId,
    })
    .select('id')
    .single()

  if (error) {
    console.log(`  FAIL   ${header}  ${error.message}`)
    audit.push({ name: entry.name, slug, status: 'failed', error: error.message })
    continue
  }

  // Link tags
  if (tagIds.length) {
    const { error: tagErr } = await sb
      .from('app_tags')
      .insert(tagIds.map((tag_id) => ({ app_id: app.id, tag_id })))
    if (tagErr) console.log(`  WARN   ${header}  tag link failed: ${tagErr.message}`)
  }

  console.log(`  OK     ${header}  id=${app.id.slice(0, 8)}`)
  audit.push({ name: entry.name, slug, status: 'created', id: app.id, userId, tagIds, screenshotUrls })
}

// Audit log
const logPath = `${ROOT}scripts/seed-audit-${Date.now()}.json`
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
    /* missing .env.local is fine — maybe user set env directly */
  }
}

function parseSeedMarkdown(md) {
  const entries = []
  const blocks = md.split(/^### /gm).slice(1) // first chunk is the preamble

  for (const block of blocks) {
    const lines = block.split('\n')
    const name = stripParenthetical(lines[0].trim())
    const fields = {}
    for (const line of lines.slice(1)) {
      const m = line.match(/^\s*-\s+\*\*(.+?):\*\*\s*(.+?)\s*$/)
      if (m) fields[m[1].toLowerCase()] = m[2]
    }
    if (!fields.url) continue

    const url = extractFirstUrl(fields.url)
    if (!url) continue

    // Tags — in backticks, comma separated
    const tagMatches = [...(fields.tags ?? '').matchAll(/`([a-z0-9-]+)`/g)]
    const tags = tagMatches.map((m) => m[1])

    // Creator — "Name (@handle)" or "handle not found"
    const creator = parseCreator(fields.creator ?? '')

    entries.push({
      name,
      description: fields.description ?? '',
      url,
      tags,
      creator,
      sourceUrl: extractFirstUrl(fields.source ?? ''),
      screenshotHint: extractFirstUrl(fields.screenshot ?? ''),
    })
  }
  return entries
}

function stripParenthetical(s) {
  // "Fly (fly.pieter.com)" → "Fly"
  return s.replace(/\s*\([^)]*\)\s*$/, '').trim()
}

function extractFirstUrl(s) {
  if (!s) return null
  const m = s.match(/https?:\/\/[^\s)]+/)
  return m ? m[0].replace(/[),.;]+$/, '') : null
}

function parseCreator(raw) {
  if (/handle not found/i.test(raw) || !raw.trim()) {
    return { displayName: 'Community', handle: null }
  }
  // match @handle and everything before the first " ("
  const handleMatch = raw.match(/@([A-Za-z0-9_]+)/)
  const nameMatch = raw.match(/^([^(@]+?)(?:\s*\(|$)/)
  return {
    displayName: nameMatch ? nameMatch[1].trim() : 'Community',
    handle: handleMatch ? handleMatch[1] : null,
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

async function getExistingSlugs() {
  const { data } = await sb.from('apps').select('slug')
  return new Set((data ?? []).map((r) => r.slug))
}

async function loadTags() {
  const { data, error } = await sb.from('tags').select('id, slug')
  if (error) {
    console.error('Could not read tags table:', error.message)
    process.exit(1)
  }
  const map = {}
  for (const t of data) map[t.slug] = t.id
  return map
}

async function fetchOgImage(pageUrl) {
  try {
    const ac = new AbortController()
    const timeout = setTimeout(() => ac.abort(), 5000)
    const res = await fetch(pageUrl, {
      signal: ac.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'VibeBoard-Seed/1.0 (+https://vibe-board-sand.vercel.app)' },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('text/html')) return null
    const html = await res.text()
    // Look at the first ~300KB only (Twitter/full-SPA pages can be huge)
    const head = html.slice(0, 300_000)
    const patterns = [
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
    ]
    for (const p of patterns) {
      const m = head.match(p)
      if (m) return new URL(m[1], pageUrl).toString()
    }
    return null
  } catch {
    return null
  }
}

async function uploadImage(imgUrl, slug) {
  try {
    const ac = new AbortController()
    const timeout = setTimeout(() => ac.abort(), 8000)
    const res = await fetch(imgUrl, { signal: ac.signal, redirect: 'follow' })
    clearTimeout(timeout)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const ct = res.headers.get('content-type') ?? 'image/png'
    const ext = ct.includes('jpeg') ? 'jpg' : ct.includes('webp') ? 'webp' : ct.includes('gif') ? 'gif' : 'png'
    const path = `seed/${slug}-0.${ext}`
    const { error } = await sb.storage.from('screenshots').upload(path, buf, {
      contentType: ct,
      upsert: true,
    })
    if (error) {
      console.log(`       upload failed: ${error.message}`)
      return null
    }
    const { data } = sb.storage.from('screenshots').getPublicUrl(path)
    return data.publicUrl
  } catch {
    return null
  }
}

async function ensureGhostUser({ displayName, handle }) {
  const username = handle ? handle.toLowerCase() : 'vibeboard-community'
  if (ghostCache[username]) return ghostCache[username]

  // Check if a profile with this username exists
  const { data: existing } = await sb.from('users').select('id').eq('username', username).single()
  if (existing) {
    ghostCache[username] = existing.id
    return existing.id
  }

  if (DRY_RUN) {
    // fake id for dry run reporting
    ghostCache[username] = `would-create:${username}`
    return ghostCache[username]
  }

  // Create auth user, then profile row
  const email = `${username}@vibeboard-seed.invalid`
  const { data: authData, error: authErr } = await sb.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { seeded: true, source: 'seed-apps.mjs' },
  })
  if (authErr && !authErr.message.includes('already')) {
    console.log(`       ghost auth create failed: ${authErr.message}`)
    return null
  }

  // If that auth user already exists (from a prior run), look it up
  let userId = authData?.user?.id
  if (!userId) {
    const { data: list } = await sb.auth.admin.listUsers()
    userId = list?.users.find((u) => u.email === email)?.id
  }
  if (!userId) {
    console.log(`       ghost create: no user id`)
    return null
  }

  await sb.from('users').upsert(
    {
      id: userId,
      display_name: displayName,
      username,
      bio: `Seeded from community research. ${handle ? `Verified creator on X: @${handle}.` : 'Creator handle not found at seed time.'}`,
      avatar_url: null,
      twitter_handle: handle,
      github_handle: null,
    },
    { onConflict: 'id' },
  )

  ghostCache[username] = userId
  return userId
}

function buildLongDescription({ description, creator, sourceUrl }) {
  const lines = [description]
  lines.push('', '—', '')
  if (creator.handle) {
    lines.push(
      `Originally built by ${creator.displayName} ([@${creator.handle}](https://twitter.com/${creator.handle})).`,
    )
  } else {
    lines.push(`Original creator handle not found at seed time.`)
  }
  if (sourceUrl) lines.push(`Source: ${sourceUrl}`)
  lines.push('', '_Submitted as seed content by the VibeBoard community._')
  return lines.join('\n')
}
