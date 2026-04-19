'use client'

import { createClient } from '@/lib/supabase/client'
import { getPendingAction, executePendingAction } from '@/lib/pending-action'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Runs once on mount. If there's a pending vote/favorite stashed from
 * before an OAuth redirect, completes it and refreshes the page so
 * server-rendered feed state reflects the new vote/favorite.
 *
 * Rendered as a null-returning sentinel in the root layout.
 */
export const PendingActionRunner = () => {
  const router = useRouter()

  useEffect(() => {
    if (!getPendingAction()) return

    let cancelled = false

    const run = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      // Not signed in → user cancelled OAuth. Leave pending action in place
      // so the next successful auth still resolves it (up to the TTL).
      if (!user) return

      try {
        await executePendingAction(supabase, user.id)
      } catch (err) {
        console.error('Pending action failed:', err)
      } finally {
        if (!cancelled) {
          router.refresh()
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [router])

  return null
}
