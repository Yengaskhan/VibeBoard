'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export const VoteButton = ({
  appId,
  initialVoteCount,
  userVote: initialUserVote,
  layout = 'vertical',
}: {
  appId: string
  initialVoteCount: number
  userVote: number
  layout?: 'vertical' | 'horizontal'
}) => {
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [currentVote, setCurrentVote] = useState(initialUserVote)
  const [voting, setVoting] = useState(false)

  const vote = async (value: 1 | -1) => {
    if (voting) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      return
    }

    setVoting(true)

    const prevVote = currentVote
    const prevCount = voteCount

    if (currentVote === value) {
      setCurrentVote(0)
      setVoteCount(voteCount - value)
    } else {
      setCurrentVote(value)
      setVoteCount(voteCount - prevVote + value)
    }

    try {
      if (prevVote === value) {
        await supabase.from('votes').delete().eq('user_id', user.id).eq('app_id', appId)
      } else {
        if (prevVote !== 0) {
          await supabase.from('votes').delete().eq('user_id', user.id).eq('app_id', appId)
        }
        await supabase.from('votes').insert({ user_id: user.id, app_id: appId, value })
      }
    } catch {
      setCurrentVote(prevVote)
      setVoteCount(prevCount)
    } finally {
      setVoting(false)
    }
  }

  const isHorizontal = layout === 'horizontal'

  return (
    <div className={`flex items-center ${isHorizontal ? 'flex-row gap-1' : 'flex-col gap-0'}`}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); vote(1) }}
        className={`group/vote rounded-md p-1 transition-all ${
          currentVote === 1
            ? 'text-[#7c3aed]'
            : 'text-white/20 hover:text-white/50'
        }`}
        aria-label="Upvote"
      >
        <svg className={`${isHorizontal ? 'h-4 w-4' : 'h-[18px] w-[18px]'} transition-transform group-hover/vote:scale-110`} fill={currentVote === 1 ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={currentVote === 1 ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <span className={`${isHorizontal ? 'text-xs min-w-[20px] text-center' : 'text-[13px]'} font-bold tabular-nums ${
        currentVote === 1 ? 'text-[#7c3aed]' : currentVote === -1 ? 'text-rose-400' : 'text-white/40'
      }`}>
        {voteCount}
      </span>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); vote(-1) }}
        className={`group/vote rounded-md p-1 transition-all ${
          currentVote === -1
            ? 'text-rose-400'
            : 'text-white/20 hover:text-white/50'
        }`}
        aria-label="Downvote"
      >
        <svg className={`${isHorizontal ? 'h-4 w-4' : 'h-[18px] w-[18px]'} transition-transform group-hover/vote:scale-110`} fill={currentVote === -1 ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={currentVote === -1 ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}
