'use client'

import { createClient } from '@/lib/supabase/client'
import { AuthModal } from '@/components/auth/AuthModal'
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
  const [burst, setBurst] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [modalVote, setModalVote] = useState<1 | -1 | null>(null)

  const triggerBurst = () => {
    setBurst(false)
    // Force reflow then trigger
    requestAnimationFrame(() => {
      setBurst(true)
      setTimeout(() => setBurst(false), 700)
    })
  }

  const triggerPulse = () => {
    setPulse(false)
    requestAnimationFrame(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 500)
    })
  }

  const vote = async (value: 1 | -1) => {
    if (voting) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Open inline auth modal instead of redirecting immediately.
      // The user's intended vote is captured here and replayed after OAuth.
      setModalVote(value)
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
      if (value === 1) triggerBurst()
      triggerPulse()
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
  const iconSize = isHorizontal ? 'h-[14px] w-[14px]' : 'h-[18px] w-[18px]'

  return (
    <>
    <div className={`flex items-center ${isHorizontal ? 'flex-row gap-0.5' : 'flex-col gap-0'}`}>
      <div className={`relative ${burst ? 'burst-active' : ''}`}>
        {/* Particles */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`particle particle-${i}`}
            style={{
              top: isHorizontal ? '50%' : '10px',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); vote(1) }}
          className={`relative rounded-md p-1 transition-all ${
            currentVote === 1
              ? 'text-[#bfff3c] drop-shadow-[0_0_6px_rgba(191,255,60,0.6)]'
              : 'text-white/30 hover:text-white/70'
          }`}
          aria-label="Boost"
        >
          <svg
            className={`${iconSize} transition-transform`}
            fill={currentVote === 1 ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={currentVote === 1 ? 0 : 2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      <span
        className={`${
          isHorizontal
            ? 'min-w-[22px] text-center text-[11px]'
            : 'text-[13px]'
        } font-display italic tabular-nums ${
          pulse ? 'vote-pulse' : ''
        } ${
          currentVote === 1
            ? 'text-[#bfff3c]'
            : currentVote === -1
              ? 'text-[#ff6b3c]'
              : 'text-white/60'
        }`}
      >
        {voteCount}
      </span>

      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); vote(-1) }}
        className={`rounded-md p-1 transition-all ${
          currentVote === -1
            ? 'text-[#ff6b3c]'
            : 'text-white/20 hover:text-white/50'
        }`}
        aria-label="Downvote"
      >
        <svg
          className={iconSize}
          fill={currentVote === -1 ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={currentVote === -1 ? 0 : 2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>

    {modalVote !== null && (
      <AuthModal
        open={true}
        onClose={() => setModalVote(null)}
        purpose="vote"
        pendingAction={{ type: 'vote', appId, value: modalVote }}
      />
    )}
    </>
  )
}
