'use client'

import Image from 'next/image'
import { useState } from 'react'

export const ScreenshotGallery = ({ urls }: { urls: string[] }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  if (urls.length === 0) return null

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10">
        <Image
          src={urls[activeIndex]}
          alt={`Screenshot ${activeIndex + 1}`}
          fill
          className="object-cover"
          priority
        />
      </div>
      {urls.length > 1 && (
        <div className="mt-3 flex gap-2">
          {urls.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-16 overflow-hidden rounded-lg border transition-colors ${
                i === activeIndex ? 'border-white' : 'border-white/10 hover:border-white/30'
              }`}
            >
              <Image
                src={url}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
