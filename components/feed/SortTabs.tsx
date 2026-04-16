'use client'

export type SortMode = 'trending' | 'new' | 'top'
export type TimeFilter = 'today' | 'week' | 'month' | 'all'

const TABS: { label: string, value: SortMode, icon: string }[] = [
  { label: 'Trending', value: 'trending', icon: '~' },
  { label: 'New', value: 'new', icon: '+' },
  { label: 'Top', value: 'top', icon: '#' },
]

const TIME_OPTIONS: { label: string, value: TimeFilter }[] = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
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
  return (
    <div className="flex items-center gap-3">
      <div className="flex rounded-full border border-white/[0.06] bg-white/[0.02] p-[3px]">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSort(tab.value)}
            className={`relative rounded-full px-4 py-[6px] text-[13px] font-medium transition-all duration-300 ${
              sort === tab.value
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white shadow-lg shadow-purple-500/25'
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {sort === 'top' && (
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
          className="appearance-none rounded-full border border-white/[0.06] bg-white/[0.02] px-3.5 py-[6px] text-[13px] font-medium text-white/50 outline-none transition-all hover:border-white/[0.12] hover:text-white/70 focus:border-[#7c3aed]/50"
        >
          {TIME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#111118] text-white">
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
