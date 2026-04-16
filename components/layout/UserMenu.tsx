'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export const UserMenu = ({ displayName, avatarUrl }: { displayName: string, avatarUrl: string | null }) => {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSignOut}
        className="rounded-full border border-white/[0.06] px-3 py-1.5 text-[13px] text-white/40 transition-all hover:border-white/[0.12] hover:text-white/70"
      >
        Sign Out
      </button>
      <div className="flex items-center gap-2">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={28}
            height={28}
            className="rounded-full ring-1 ring-white/[0.08]"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] text-xs font-semibold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  )
}
