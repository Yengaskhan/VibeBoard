'use client'

import { useState } from 'react'

export const EmbedViewer = ({ embedCode }: { embedCode: string }) => {
  const [visible, setVisible] = useState(false)

  return (
    <section>
      <div className="flex items-end justify-between gap-4 border-b border-white/[0.06] pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#bfff3c]/70">
            / try it
          </p>
          <h2 className="mt-1 font-display text-[24px] italic leading-tight text-white">
            Interactive preview
          </h2>
        </div>
        <button
          onClick={() => setVisible(!visible)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-[12px] font-medium transition-all ${
            visible
              ? 'border border-white/[0.1] bg-white/[0.04] text-white/60 hover:text-white'
              : 'btn-accent'
          }`}
        >
          {visible ? 'Hide' : 'Launch'}
        </button>
      </div>

      {visible && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] fade-rise">
          <iframe
            src={embedCode}
            sandbox="allow-scripts allow-same-origin allow-popups"
            className="h-[640px] w-full bg-white"
            title="App embed"
          />
        </div>
      )}
    </section>
  )
}
