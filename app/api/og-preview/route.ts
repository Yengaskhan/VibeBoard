/**
 * GET /api/og-preview?url=<url>
 *
 * Fetches OpenGraph/Twitter Card metadata from any URL and returns
 * { title, description, image } so the submit form can auto-fill.
 *
 * Notes:
 *   - 5 second timeout
 *   - Reads only the first ~300KB of HTML (SPAs can be huge)
 *   - Returns the image URL directly (no proxying or upload — client-side
 *     user still re-uploads the real screenshot on submit if desired)
 */
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const TIMEOUT_MS = 5000
const MAX_HTML_BYTES = 300_000

type Meta = {
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
}

const extract = (pattern: RegExp, html: string): string | null => {
  const m = html.match(pattern)
  return m ? decodeHtmlEntities(m[1]) : null
}

const decodeHtmlEntities = (s: string): string =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const target = searchParams.get('url')

  if (!target) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(target)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return NextResponse.json({ error: 'Only http(s) URLs allowed' }, { status: 400 })
  }

  // Basic SSRF guards — reject internal hostnames
  const host = parsed.hostname.toLowerCase()
  const isPrivate =
    host === 'localhost' ||
    host.startsWith('127.') ||
    host.startsWith('10.') ||
    host.startsWith('192.168.') ||
    host.match(/^172\.(1[6-9]|2\d|3[0-1])\./) ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  if (isPrivate) {
    return NextResponse.json({ error: 'Private host not allowed' }, { status: 400 })
  }

  try {
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), TIMEOUT_MS)

    const res = await fetch(parsed.toString(), {
      signal: ac.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'VibeBoard/1.0 (+https://vibe-board-sand.vercel.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
    })
    clearTimeout(t)

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: 502 })
    }
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('text/html') && !ct.includes('application/xhtml')) {
      return NextResponse.json({ error: 'Not an HTML document' }, { status: 415 })
    }

    // Read up to MAX_HTML_BYTES then bail out
    const reader = res.body?.getReader()
    if (!reader) {
      return NextResponse.json({ error: 'No response body' }, { status: 502 })
    }
    let received = 0
    let chunks: Uint8Array[] = []
    while (received < MAX_HTML_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      received += value.byteLength
    }
    try {
      await reader.cancel()
    } catch {}
    const html = new TextDecoder('utf-8', { fatal: false }).decode(
      Buffer.concat(chunks.map((c) => Buffer.from(c))),
    )

    const meta = extractMeta(html, parsed)

    // 5-minute edge cache
    return NextResponse.json(meta, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Fetch failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}

const extractMeta = (html: string, baseUrl: URL): Meta => {
  const slice = html.slice(0, MAX_HTML_BYTES)

  const title =
    extract(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i, slice) ??
    extract(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i, slice) ??
    extract(/<title[^>]*>([^<]+)<\/title>/i, slice)

  const description =
    extract(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i, slice) ??
    extract(/<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i, slice) ??
    extract(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i, slice)

  const imageRaw =
    extract(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i, slice) ??
    extract(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i, slice) ??
    extract(/<meta\s+name=["']twitter:image:src["']\s+content=["']([^"']+)["']/i, slice)

  const image = imageRaw ? safeResolveUrl(imageRaw, baseUrl) : null

  const siteName =
    extract(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i, slice)

  return {
    title: title ? title.trim().slice(0, 200) : null,
    description: description ? description.trim().slice(0, 500) : null,
    image,
    siteName,
  }
}

const safeResolveUrl = (u: string, base: URL): string | null => {
  try {
    const resolved = new URL(u, base)
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return null
    return resolved.toString()
  } catch {
    return null
  }
}
