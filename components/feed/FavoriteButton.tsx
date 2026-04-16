'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export const FavoriteButton = ({
  appId,
  isFavorited: initialFavorited,
}: {
  appId: string
  isFavorited: boolean
}) => {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [busy, setBusy] = useState(false)

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      return
    }

    setBusy(true)
    const prev = favorited
    setFavorited(!prev)

    try {
      if (prev) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('app_id', appId)
      } else {
        await supabase.from('favorites').insert({ user_id: user.id, app_id: appId })
      }
    } catch {
      setFavorited(prev)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      className={`group/fav rounded-md p-1 transition-all ${
        favorited ? 'text-amber-400' : 'text-white/20 hover:text-white/50'
      }`}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="h-4 w-4 transition-transform group-hover/fav:scale-110"
        fill={favorited ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={favorited ? 0 : 1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    </button>
  )
}
