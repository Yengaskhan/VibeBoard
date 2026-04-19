/**
 * Stores the action a user was trying to perform when they got bounced to OAuth.
 * After the OAuth callback returns them to the site, PendingActionRunner replays it.
 *
 * Uses localStorage (not sessionStorage) so it survives the full
 * OAuth redirect chain even in browsers that are strict about cross-origin
 * session boundaries. TTL guards against stale actions lingering forever.
 */

const KEY = 'vb_pending_action'
const TTL_MS = 10 * 60 * 1000 // 10 minutes

export type PendingAction =
  | { type: 'vote', appId: string, value: 1 | -1 }
  | { type: 'favorite', appId: string }

type Stored = PendingAction & { ts: number }

export const setPendingAction = (action: PendingAction) => {
  if (typeof window === 'undefined') return
  try {
    const stored: Stored = { ...action, ts: Date.now() }
    localStorage.setItem(KEY, JSON.stringify(stored))
  } catch {
    // localStorage disabled — fail quietly
  }
}

export const getPendingAction = (): PendingAction | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Stored
    if (Date.now() - parsed.ts > TTL_MS) {
      localStorage.removeItem(KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const clearPendingAction = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}

/**
 * Runs a stashed vote/favorite against Supabase, then clears the pending action.
 * Called by PendingActionRunner after OAuth returns, and by AuthModal after a
 * successful email sign-in (which has no redirect to trigger the mount hook).
 *
 * The `supabase` param is typed as unknown + narrowed at call sites because the
 * exact PostgrestFilterBuilder return types from @supabase/supabase-js are
 * verbose and don't compose cleanly here; the helper only uses the common
 * `.from(table).delete().eq().eq()` and `.from(table).insert()` shapes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const executePendingAction = async (supabase: any, userId: string) => {
  const action = getPendingAction()
  if (!action) return

  try {
    if (action.type === 'vote') {
      // Delete any existing vote first so switching +1 ↔ -1 works cleanly.
      await supabase
        .from('votes')
        .delete()
        .eq('user_id', userId)
        .eq('app_id', action.appId)
      await supabase
        .from('votes')
        .insert({ user_id: userId, app_id: action.appId, value: action.value })
    } else if (action.type === 'favorite') {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, app_id: action.appId })
    }
  } finally {
    clearPendingAction()
  }
}
