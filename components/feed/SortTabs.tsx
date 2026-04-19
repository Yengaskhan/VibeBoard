'use client'

import { useEffect, useRef, useState } from 'react'

export type SortMode = 'trending' | 'new' | 'top' | 'loved'
export type TimeFilter = 'today' | 'week' | 'month' | 'all'

const TABS: { label: string, value: SortMode }[] = [
  { label: 'Trending', value: 'trending' },
  { label: 'New', value: 'new' },
  { label: 'Top', value: 'top' },
  { label: 'Loved', value: 'loved' },
]

const TIME_OPTIONS: { label: string, value: TimeFilter }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'All time', value: 'all' },
]

export const SortTabs = ({
  sort,
  setSort,
  timeFilter,
  setTimeFilter,
}: {
  sort: SortMode
  setSort: (s: SortMode) => void
  timeFilter: TimeFilter
  setTimeFilter: (t: TimeFilter) => void
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const activeBtn = container.querySelector<HTMLButtonElement>(`button[data-value="${sort}"]`)
    if (!activeBtn) return
    setIndicator({
      left: activeBtn.offsetLeft,
      width: activeBtn.offsetWidth,
    })
  }, [sort])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        ref={containerRef}
        className="relative flex rounded-full border border-white/[0.06] bg-white/[0.02] p-1"
      >
        {/* Sliding indicator */}
        <div
          className="tab-indicator absolute top-1 h-[calc(100%-8px)] rounded-full bg-[#bfff3c] shadow-[0_0_24px_-4px_rgba(191,255,60,0.6)]"
          style={{ left: `${indicator.left}px`, width: `${indicator.width}px` }}
        />
        {TABS.map((tab) => (
          <button
            key={tab.value}
            data-value={tab.value}
            onClick={() => setSort(tab.value)}
            className={`relative z-10 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-300 ${
              sort === tab.value
                ? 'text-[#08080a]'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Time filter — pills, not a select */}
      {sort === 'top' && (
        <div className="flex items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] p-1">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeFilter(opt.value)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                timeFilter === opt.value
                  ? 'bg-white/[0.06] text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Section label */}
      <div className="ml-auto hidden items-baseline gap-2 sm:flex">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
          {sort === 'trending'
            ? '/ live ranking'
            : sort === 'new'
              ? '/ latest drops'
              : sort === 'loved'
                ? '/ cult favorites'
                : '/ leaderboard'}
        </span>
      </div>
    </div>
  )
}
