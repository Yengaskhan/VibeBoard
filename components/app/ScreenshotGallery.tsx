'use client'

import Image from 'next/image'
import { useState } from 'react'

export const ScreenshotGallery = ({ urls }: { urls: string[] }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  if (urls.length === 0) return null

  return (
    <div>
      <div className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
        <Image
          src={urls[activeIndex]}
          alt={`Screenshot ${activeIndex + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
        />
        {/* Index chip */}
        {urls.length > 1 && (
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/70 backdrop-blur-md">
            <span className="text-[#bfff3c]">{String(activeIndex + 1).padStart(2, '0')}</span>
            <span className="text-white/30">/</span>
            <span>{String(urls.length).padStart(2, '0')}</span>
          </div>
        )}
      </div>

      {urls.length > 1 && (
        <div className="mt-4 flex gap-2.5 overflow-x-auto pb-2">
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border transition-all ${
                i === activeIndex
                  ? 'border-[#bfff3c] shadow-[0_0_16px_-4px_rgba(191,255,60,0.6)]'
                  : 'border-white/[0.08] opacity-50 hover:border-white/30 hover:opacity-100'
              }`}
              aria-label={`View screenshot ${i + 1}`}
            >
              <Image src={url} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
