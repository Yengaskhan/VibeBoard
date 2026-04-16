'use client'

import { useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'

export const ScreenshotUpload = ({
  screenshots,
  setScreenshots,
}: {
  screenshots: File[]
  setScreenshots: (files: File[]) => void
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [compressing, setCompressing] = useState(false)

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return
    const remaining = 3 - screenshots.length
    const files = Array.from(fileList).slice(0, remaining)
    if (files.length === 0) return

    setCompressing(true)
    try {
      const compressed = await Promise.all(
        files.map((file) =>
          imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            fileType: 'image/webp',
          })
        )
      )
      setScreenshots([...screenshots, ...compressed])
    } catch (err) {
      console.error('Image compression failed:', err)
    } finally {
      setCompressing(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const remove = (index: number) => {
    setScreenshots(screenshots.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300">
        Screenshots (up to 3)
      </label>
      <div className="mt-2 flex gap-3">
        {screenshots.map((file, i) => (
          <div key={i} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-white/10">
            <img
              src={URL.createObjectURL(file)}
              alt={`Screenshot ${i + 1}`}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        {screenshots.length < 3 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={compressing}
            className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-white/20 text-zinc-500 transition-colors hover:border-white/40 hover:text-zinc-300 disabled:opacity-50"
          >
            {compressing ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
