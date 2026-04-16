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
}: {
  initialApps: AppWithUser[]
  userVotes: UserVote[]
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
        <div className="mt-16 text-center">
          <p className="text-lg text-zinc-500">No apps yet. Be the first to submit one!</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedApps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              userVote={voteMap[app.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
