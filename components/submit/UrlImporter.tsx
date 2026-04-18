'use client'

import { useState } from 'react'

type Meta = {
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
}

export const UrlImporter = ({
  onImported,
}: {
  onImported: (meta: {
    url: string
    title: string | null
    description: string | null
    image: string | null
  }) => void
}) => {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<(Meta & { url: string }) | null>(null)

  const canonicalize = (s: string) => {
    const trimmed = s.trim()
    if (!trimmed) return ''
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    return `https://${trimmed}`
  }

  const handleFetch = async () => {
    const candidate = canonicalize(input)
    if (!candidate) {
      setError('Paste a URL first')
      return
    }
    try {
      new URL(candidate)
    } catch {
      setError('That doesn\'t look like a valid URL')
      return
    }

    setError('')
    setLoading(true)
    setPreview(null)

    try {
      const res = await fetch(`/api/og-preview?url=${encodeURIComponent(candidate)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not fetch that page')
        return
      }
      const meta: Meta = {
        title: data.title,
        description: data.description,
        image: data.image,
        siteName: data.siteName,
      }
      setPreview({ ...meta, url: candidate })
    } catch {
      setError('Network error while fetching the page')
    } finally {
      setLoading(false)
    }
  }

  const handleUse = () => {
    if (!preview) return
    onImported({
      url: preview.url,
      title: preview.title,
      description: preview.description,
      image: preview.image,
    })
    // Reset the importer after use so it's ready for another
    setInput('')
    setPreview(null)
  }

  return (
    <div className="rounded-2xl border border-[#bfff3c]/20 bg-[#bfff3c]/[0.02] p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 text-[#bfff3c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#bfff3c]">
          Autofill from URL
        </h2>
      </div>

      <p className="mt-1 text-[12px] text-white/40">
        Paste your app&apos;s URL. We&apos;ll pull the title, description, and preview image from its metadata.
      </p>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError('') }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleFetch() } }}
          placeholder="myapp.vercel.app"
          className="min-w-0 flex-1 rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2 text-[13px] text-white placeholder-white/20 outline-none transition-colors focus:border-[#bfff3c]/50 focus:ring-1 focus:ring-[#bfff3c]/20"
        />
        <button
          type="button"
          onClick={handleFetch}
          disabled={loading}
          className="shrink-0 rounded-lg bg-[#bfff3c] px-4 py-2 text-[13px] font-semibold text-[#08080a] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Fetching
            </span>
          ) : 'Import'}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-[12px] text-rose-400">{error}</p>
      )}

      {preview && (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06] bg-black/30">
          {preview.image && (
            // External OG images — use <img> so we don't need to configure next/image domains
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.image}
              alt={preview.title ?? 'Preview'}
              className="aspect-[16/9] w-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-white/30">
              {preview.siteName ?? new URL(preview.url).hostname}
            </p>
            <h3 className="mt-1 font-display text-[20px] italic leading-tight text-white">
              {preview.title ?? '(untitled)'}
            </h3>
            {preview.description && (
              <p className="mt-1.5 line-clamp-3 text-[13px] text-white/50">{preview.description}</p>
            )}

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleUse}
                className="rounded-full bg-[#bfff3c] px-4 py-1.5 text-[12px] font-semibold text-[#08080a] transition-all hover:brightness-110"
              >
                Use this
              </button>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-full border border-white/[0.08] px-4 py-1.5 text-[12px] font-medium text-white/50 transition-all hover:border-white/20 hover:text-white/80"
              >
                Discard
              </button>
              {!preview.image && (
                <p className="ml-auto font-mono text-[10px] uppercase tracking-wider text-white/30">
                  No preview image found
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
