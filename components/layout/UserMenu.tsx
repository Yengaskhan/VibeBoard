'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export const UserMenu = ({
  displayName,
  username,
  avatarUrl,
}: {
  displayName: string
  username: string
  avatarUrl: string | null
}) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.refresh()
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] p-[3px] pr-3 transition-all hover:border-[#bfff3c]/40 hover:bg-white/[0.04]"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={26}
            height={26}
            className="rounded-full ring-1 ring-white/[0.08]"
          />
        ) : (
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#bfff3c] font-display italic text-xs text-[#08080a]">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <svg
          className={`h-3 w-3 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-56 origin-top-right overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101014]/95 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-[fade-rise_200ms_ease-out]">
          <div className="border-b border-white/[0.06] px-4 py-3">
            <p className="font-display text-[16px] italic leading-tight text-white">{displayName}</p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-[#bfff3c]/70">@{username}</p>
          </div>
          <div className="py-1.5">
            <Link
              href={`/user/${username}`}
              onClick={() => setOpen(false)}
              className="group flex items-center gap-3 px-4 py-2 text-[13px] text-white/60 transition-colors hover:bg-[#bfff3c]/[0.06] hover:text-white"
            >
              <svg className="h-4 w-4 text-white/30 group-hover:text-[#bfff3c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Profile
            </Link>
            <Link
              href="/submit"
              onClick={() => setOpen(false)}
              className="group flex items-center gap-3 px-4 py-2 text-[13px] text-white/60 transition-colors hover:bg-[#bfff3c]/[0.06] hover:text-white"
            >
              <svg className="h-4 w-4 text-white/30 group-hover:text-[#bfff3c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Submit App
            </Link>
            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className="group flex items-center gap-3 px-4 py-2 text-[13px] text-white/60 transition-colors hover:bg-[#bfff3c]/[0.06] hover:text-white"
            >
              <svg className="h-4 w-4 text-white/30 group-hover:text-[#bfff3c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Favorites
            </Link>
          </div>
          <div className="border-t border-white/[0.06] py-1.5">
            <button
              onClick={handleSignOut}
              className="group flex w-full items-center gap-3 px-4 py-2 text-left text-[13px] text-white/40 transition-colors hover:bg-white/[0.03] hover:text-white/70"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
