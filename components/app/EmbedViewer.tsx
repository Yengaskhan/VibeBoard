'use client'

import { useState } from 'react'

export const EmbedViewer = ({ embedCode }: { embedCode: string }) => {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Try It</h2>
        <button
          onClick={() => setVisible(!visible)}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white hover:bg-white/5"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {visible && (
        <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
          <iframe
            src={embedCode}
            sandbox="allow-scripts allow-same-origin allow-popups"
            className="h-[600px] w-full bg-white"
            title="App embed"
          />
        </div>
      )}
    </div>
  )
}
