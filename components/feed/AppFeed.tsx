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

  return (
    <div>
      <SortTabs
        sort={sort}
        setSort={setSort}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
      />
      {sortedApps.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <svg className="h-7 w-7 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <p className="mt-4 text-[15px] font-medium text-white/30">No apps yet</p>
          <p className="mt-1 text-[13px] text-white/15">Be the first to showcase something amazing.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortedApps.map((app, i) => (
            <div
              key={app.id}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-[fadeInUp_0.5s_ease-out_both]"
            >
              <AppCard
                app={app}
                userVote={voteMap[app.id] ?? 0}
                isFavorited={favoriteIds.includes(app.id)}
              />
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
