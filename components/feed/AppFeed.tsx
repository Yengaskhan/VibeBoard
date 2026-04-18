'use client'

import { useState, useMemo } from 'react'
import type { AppWithUser, UserVote } from '@/lib/types'
import { SortTabs, type SortMode, type TimeFilter } from './SortTabs'
import { AppCard } from './AppCard'

const getHoursSince = (dateStr: string) => {
  const ms = Date.now() - new Date(dateStr).getTime()
  return Math.max(ms / (1000 * 60 * 60), 0.1)
}

const getTimeFilterDate = (filter: TimeFilter): Date | null => {
  const now = new Date()
  switch (filter) {
    case 'today': return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    case 'week': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case 'month': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case 'all': return null
  }
}

export const AppFeed = ({
  initialApps,
  userVotes,
  favoriteIds = [],
}: {
  initialApps: AppWithUser[]
  userVotes: UserVote[]
  favoriteIds?: string[]
}) => {
  const [sort, setSort] = useState<SortMode>('trending')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week')

  const voteMap = useMemo(() => {
    const map: Record<string, number> = {}
    userVotes.forEach((v) => { map[v.app_id] = v.value })
    return map
  }, [userVotes])

  const sortedApps = useMemo(() => {
    let apps = [...initialApps]

    if (sort === 'trending') {
      apps.sort((a, b) => {
        const scoreA = a.vote_count / Math.pow(getHoursSince(a.created_at), 1.8)
        const scoreB = b.vote_count / Math.pow(getHoursSince(b.created_at), 1.8)
        return scoreB - scoreA
      })
    } else if (sort === 'new') {
      apps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sort === 'top') {
      const cutoff = getTimeFilterDate(timeFilter)
      if (cutoff) {
        apps = apps.filter((a) => new Date(a.created_at) >= cutoff)
      }
      apps.sort((a, b) => b.vote_count - a.vote_count)
    }

    return apps
  }, [initialApps, sort, timeFilter])

  // Break the apps into: featured (only on trending, first spot), then the rest.
  // The "rest" flows through a bento pattern where every 5th card is wide.
  const featured = sort === 'trending' && sortedApps.length > 0 ? sortedApps[0] : null
  const rest = featured ? sortedApps.slice(1) : sortedApps

  return (
    <div>
      <SortTabs
        sort={sort}
        setSort={setSort}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
      />

      {sortedApps.length === 0 ? (
        <div className="mt-24 flex flex-col items-center text-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#bfff3c]/10 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <svg className="h-8 w-8 text-[#bfff3c]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
          </div>
          <p className="mt-6 font-display text-[24px] italic text-white/80">Nothing here yet.</p>
          <p className="mt-1 text-[13px] text-white/30">Be the first to ship something worth sharing.</p>
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          {/* Featured hero card */}
          {featured && (
            <div className="fade-rise" style={{ animationDelay: '0ms' }}>
              <AppCard
                app={featured}
                userVote={voteMap[featured.id] ?? 0}
                isFavorited={favoriteIds.includes(featured.id)}
                variant="featured"
              />
            </div>
          )}

          {/* Asymmetric bento grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {rest.map((app, i) => {
              // Bento pattern: every 5th slot becomes a wide (2-col) card on large screens.
              // This creates an irregular rhythm instead of a uniform grid.
              const isWide = i % 5 === 0
              const colSpan = isWide ? 'lg:col-span-4' : 'lg:col-span-2'
              return (
                <div
                  key={app.id}
                  style={{ animationDelay: `${Math.min(i * 60, 600)}ms` }}
                  className={`fade-rise ${colSpan}`}
                >
                  <AppCard
                    app={app}
                    userVote={voteMap[app.id] ?? 0}
                    isFavorited={favoriteIds.includes(app.id)}
                    variant={isWide ? 'wide' : 'default'}
                    rank={sort === 'top' ? i + (featured ? 2 : 1) : undefined}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
