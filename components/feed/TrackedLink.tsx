'use client'

import { createClient } from '@/lib/supabase/client'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick' | 'onAuxClick'> & {
  href: string
  appId: string
  children?: ReactNode
}

/**
 * External link that fires an "increment visits" RPC to Supabase
 * when the user opens the linked app (click, middle-click, cmd-click).
 *
 * The RPC call is fire-and-forget — it never blocks navigation.
 */
export const TrackedLink = ({ href, appId, children, ...rest }: Props) => {
  const track = () => {
    try {
      const supabase = createClient()
      // Fire-and-forget: ignore rejection so a network blip never breaks the click.
      void supabase.rpc('increment_app_visits', { p_app_id: appId }).then(() => {})
    } catch {
      // Supabase not configured — skip silently
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={track}
      onAuxClick={track}
      {...rest}
    >
      {children}
    </a>
  )
}
