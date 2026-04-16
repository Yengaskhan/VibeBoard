'use client'

import { createClient } from '@/lib/supabase/client'
import { generateUniqueSlug } from '@/lib/utils'
import { CharCounter } from '@/components/submit/CharCounter'
import { TagSelect } from '@/components/submit/TagSelect'
import { ScreenshotUpload } from '@/components/submit/ScreenshotUpload'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SubmitPage() {
  const supabase = createClient()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [url, setUrl] = useState('')
  const [embedCode, setEmbedCode] = useState('')
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<{ name: string, slug: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isValidUrl = (str: string) => {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!title.trim()) errors.title = 'Title is required'
    if (!shortDescription.trim()) errors.shortDescription = 'Short description is required'
    if (shortDescription.length > 280) errors.shortDescription = 'Must be 280 characters or less'
    if (!url.trim()) errors.url = 'App URL is required'
    else if (!isValidUrl(url)) errors.url = 'Must be a valid URL (include https://)'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated. Please sign in and try again.'); setSubmitting(false); return }

      // Upload screenshots
      const screenshotUrls: string[] = []
      for (let i = 0; i < screenshots.length; i++) {
        const path = `${user.id}/${Date.now()}-${i}.webp`
        const { error: uploadError } = await supabase.storage
          .from('screenshots')
          .upload(path, screenshots[i], { contentType: 'image/webp' })

        if (uploadError) throw new Error(`Screenshot upload failed: ${uploadError.message}`)

        const { data: { publicUrl } } = supabase.storage
          .from('screenshots')
          .getPublicUrl(path)
        screenshotUrls.push(publicUrl)
      }

      const slug = await generateUniqueSlug(title, supabase)

      const { data: app, error: insertError } = await supabase
        .from('apps')
        .insert({
          title: title.trim(),
          slug,
          short_description: shortDescription.trim(),
          long_description: longDescription.trim() || null,
          url: url.trim(),
          embed_code: embedCode.trim() || null,
          screenshot_urls: screenshotUrls,
          user_id: user.id,
        })
        .select('id')
        .single()

      if (insertError) throw new Error(insertError.message)

      if (customTags.length > 0) {
        for (const ct of customTags) {
          await supabase
            .from('tags')
            .upsert({ name: ct.name, slug: ct.slug }, { onConflict: 'slug' })
        }
      }

      if (selectedTags.length > 0 && app) {
        const { data: tags } = await supabase
          .from('tags')
          .select('id, slug')
          .in('slug', selectedTags)

        if (tags && tags.length > 0) {
          await supabase.from('app_tags').insert(
            tags.map((tag) => ({ app_id: app.id, tag_id: tag.id }))
          )
        }
      }

      router.push(`/app/${slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const inputClass = (field?: string) =>
    `mt-1.5 w-full rounded-xl border bg-white/[0.02] px-3.5 py-2.5 text-[14px] text-white placeholder-white/20 outline-none transition-all ${
      field && fieldErrors[field]
        ? 'border-rose-500/50 focus:border-rose-500/70 focus:ring-1 focus:ring-rose-500/30'
        : 'border-white/[0.06] focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/20'
    }`

  return (
    <div className="relative z-10 flex flex-1 justify-center px-5 py-10 sm:px-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-[28px] font-bold tracking-tight text-white">Submit an App</h1>
        <p className="mt-1.5 text-[15px] text-white/30">Share what you&apos;ve built with the community.</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label htmlFor="title" className="block text-[13px] font-medium text-white/50">
              Title <span className="text-[#7c3aed]">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setFieldErrors((p) => ({ ...p, title: '' })) }}
              className={inputClass('title')}
              placeholder="My Cool App"
            />
            {fieldErrors.title && <p className="mt-1 text-[12px] text-rose-400">{fieldErrors.title}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="shortDesc" className="block text-[13px] font-medium text-white/50">
                Short Description <span className="text-[#7c3aed]">*</span>
              </label>
              <CharCounter current={shortDescription.length} max={280} />
            </div>
            <input
              id="shortDesc"
              type="text"
              value={shortDescription}
              onChange={(e) => { setShortDescription(e.target.value); setFieldErrors((p) => ({ ...p, shortDescription: '' })) }}
              className={inputClass('shortDescription')}
              placeholder="A brief description of what your app does"
            />
            {fieldErrors.shortDescription && <p className="mt-1 text-[12px] text-rose-400">{fieldErrors.shortDescription}</p>}
          </div>

          <div>
            <label htmlFor="longDesc" className="block text-[13px] font-medium text-white/50">
              Long Description
            </label>
            <textarea
              id="longDesc"
              rows={4}
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              className={`${inputClass()} resize-none`}
              placeholder="Tell the story behind your app, how it works, what makes it special..."
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-[13px] font-medium text-white/50">
              App URL <span className="text-[#7c3aed]">*</span>
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setFieldErrors((p) => ({ ...p, url: '' })) }}
              className={inputClass('url')}
              placeholder="https://myapp.vercel.app"
            />
            {fieldErrors.url && <p className="mt-1 text-[12px] text-rose-400">{fieldErrors.url}</p>}
          </div>

          <div>
            <label htmlFor="embed" className="block text-[13px] font-medium text-white/50">
              Embed URL
            </label>
            <p className="mt-0.5 text-[11px] text-white/15">
              If your app runs in an iframe, paste the URL. Shown in a sandboxed &quot;Try It&quot; section.
            </p>
            <input
              id="embed"
              type="text"
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              className={inputClass()}
              placeholder="https://myapp.vercel.app/embed"
            />
          </div>

          <ScreenshotUpload screenshots={screenshots} setScreenshots={setScreenshots} />

          <TagSelect
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            customTags={customTags}
            setCustomTags={setCustomTags}
          />

          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] px-4 py-3">
              <p className="text-[13px] text-rose-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-4 py-3 text-[14px] font-semibold text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : 'Submit App'}
          </button>
        </form>
      </div>
    </div>
  )
}
