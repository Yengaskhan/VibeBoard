#!/usr/bin/env node
/**
 * Upload a local screenshot file and attach it to an app.
 *
 * Useful when the automated renderer (Microlink / thum.io) can't capture
 * an app properly — e.g., WebGL games, SPAs with long splash screens,
 * or apps that require interaction to show meaningful content.
 *
 * Usage:
 *   node scripts/upload-screenshot.mjs --slug carbscan --file ~/Desktop/carbscan.png
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = new URL('..', import.meta.url).pathname

await loadDotenv(`${ROOT}.env.local`)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const args = parseArgs(process.argv.slice(2))
if (!args.slug || !args.file) {
  console.error('Usage: node scripts/upload-screenshot.mjs --slug <slug> --file <path>')
  console.error('Example: node scripts/upload-screenshot.mjs --slug carbscan --file ~/Desktop/carbscan.png')
  process.exit(1)
}

const filePath = args.file.replace(/^~/, process.env.HOME ?? '')
const ext = path.extname(filePath).toLowerCase().replace('.', '') || 'png'
const contentType =
  ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
  ext === 'webp' ? 'image/webp' :
  ext === 'gif' ? 'image/gif' :
  'image/png'

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// 1. Check the app exists
const { data: app, error: appErr } = await sb
  .from('apps')
  .select('id, slug, title')
  .eq('slug', args.slug)
  .single()

if (appErr || !app) {
  console.error(`App with slug "${args.slug}" not found`)
  process.exit(1)
}

// 2. Read the file
let buf
try {
  buf = await readFile(filePath)
} catch (e) {
  console.error(`Could not read file ${filePath}:`, e.message)
  process.exit(1)
}

if (buf.length < 2000) {
  console.error(`File is suspiciously small (${buf.length} bytes). Aborting.`)
  process.exit(1)
}

console.log(`Uploading ${filePath} (${(buf.length / 1024).toFixed(1)} KB) for app "${app.title}"...`)

// 3. Upload to storage
const storagePath = `manual/${args.slug}-0.${ext === 'jpeg' ? 'jpg' : ext}`
const { error: uploadErr } = await sb.storage.from('screenshots').upload(storagePath, buf, {
  contentType,
  upsert: true,
})

if (uploadErr) {
  console.error('Upload failed:', uploadErr.message)
  process.exit(1)
}

const { data: urlData } = sb.storage.from('screenshots').getPublicUrl(storagePath)
const publicUrl = urlData.publicUrl

// 4. Update the app row
const { error: updateErr } = await sb
  .from('apps')
  .update({ screenshot_urls: [publicUrl] })
  .eq('id', app.id)

if (updateErr) {
  console.error('DB update failed:', updateErr.message)
  process.exit(1)
}

console.log(`✓ Uploaded to ${publicUrl}`)
console.log(`✓ Attached to app "${app.title}" (${args.slug})`)
console.log(`\nRefresh your feed — the new screenshot should appear.`)

// ---------- helpers ----------

async function loadDotenv(p) {
  try {
    const text = await readFile(p, 'utf8')
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
      if (!m) continue
      let v = m[2].trim()
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1)
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = v
    }
  } catch { /* fine */ }
}

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        out[key] = next
        i++
      } else {
        out[key] = true
      }
    }
  }
  return out
}
