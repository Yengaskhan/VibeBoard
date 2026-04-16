'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react'

type AppResult = { title: string, slug: string, short_description: string }
type UserResult = { display_name: string, username: string, avatar_url: string | null }

export const SearchBar = () => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [apps, setApps] = useState<AppResult[]>([])
  const [users, setUsers] = useState<UserResult[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setExpanded(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setExpanded(false) }
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setApps([]); setUsers([]); setOpen(false); return }

    setLoading(true)
    const supabase = createClient()

    const [appRes, userRes] = await Promise.all([
      supabase
        .from('apps')
        .select('title, slug, short_description')
        .or(`title.ilike.%${q}%,short_description.ilike.%${q}%`)
        .limit(5),
      supabase
        .from('users')
        .select('display_name, username, avatar_url')
        .or(`display_name.ilike.%${q}%,username.ilike.%${q}%`)
        .limit(5),
    ])

    setApps((appRes.data as AppResult[]) ?? [])
    setUsers((userRes.data as UserResult[]) ?? [])
    setOpen(true)
    setLoading(false)
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => search(value), 300)
  }

  const navigate = (path: string) => {
    setOpen(false)
    setExpanded(false)
    setQuery('')
    router.push(path)
  }

  const hasResults = apps.length > 0 || users.length > 0

  return (
    <div ref={ref} className="relative">
      {/* Desktop search */}
      <div className="hidden sm:block">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => { if (query.length >= 2) setOpen(true) }}
            placeholder="Search apps & users..."
            className="w-48 rounded-full border border-white/[0.06] bg-white/[0.02] py-1.5 pl-9 pr-3 text-[13px] text-white placeholder-white/20 outline-none transition-all focus:w-64 focus:border-white/[0.12] focus:bg-white/[0.04] lg:w-56 lg:focus:w-72"
          />
        </div>
      </div>

      {/* Mobile search icon */}
      <button
        onClick={() => { setExpanded(true); setTimeout(() => inputRef.current?.focus(), 100) }}
        className={`sm:hidden rounded-full border border-white/[0.06] bg-white/[0.02] p-2 text-white/40 transition-all hover:text-white/60 ${expanded ? 'hidden' : ''}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>

      {/* Mobile expanded search */}
      {expanded && (
        <div className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-2 border-b border-white/[0.04] bg-[#050507] px-4 sm:hidden">
          <svg className="h-4 w-4 shrink-0 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search apps & users..."
            className="flex-1 bg-transparent text-[14px] text-white placeholder-white/20 outline-none"
            autoFocus
          />
          <button onClick={() => { setExpanded(false); setOpen(false); setQuery('') }} className="text-[13px] text-white/40">
            Cancel
          </button>
        </div>
      )}

      {/* Results dropdown */}
      {open && query.length >= 2 && (
        <div className={`absolute z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111118] shadow-2xl shadow-black/50 ${expanded ? 'left-4 right-4 top-14 w-auto fixed' : 'right-0 sm:right-auto sm:left-0'}`}>
          {loading ? (
            <div className="px-4 py-6 text-center text-[13px] text-white/30">Searching...</div>
          ) : !hasResults ? (
            <div className="px-4 py-6 text-center text-[13px] text-white/30">No results found</div>
          ) : (
            <>
              {apps.length > 0 && (
                <div>
                  <div className="px-3.5 pt-2.5 pb-1 text-[11px] font-medium uppercase tracking-wider text-white/20">Apps</div>
                  {apps.map((app) => (
                    <button
                      key={app.slug}
                      onClick={() => navigate(`/app/${app.slug}`)}
                      className="flex w-full items-start gap-3 px-3.5 py-2 text-left transition-colors hover:bg-white/[0.04]"
                    >
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-white/70">{app.title}</p>
                        <p className="truncate text-[11px] text-white/25">{app.short_description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {users.length > 0 && (
                <div className={apps.length > 0 ? 'border-t border-white/[0.06]' : ''}>
                  <div className="px-3.5 pt-2.5 pb-1 text-[11px] font-medium uppercase tracking-wider text-white/20">Users</div>
                  {users.map((user) => (
                    <button
                      key={user.username}
                      onClick={() => navigate(`/user/${user.username}`)}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition-colors hover:bg-white/[0.04]"
                    >
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt={user.display_name} width={20} height={20} className="rounded-full" />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] text-[9px] font-bold text-white">
                          {user.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-white/70">{user.display_name}</p>
                        <p className="truncate text-[11px] text-white/25">@{user.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
