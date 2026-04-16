'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function OnboardingPage() {
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [githubHandle, setGithubHandle] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const prefill = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user?.user_metadata?.full_name) {
          setDisplayName(user.user_metadata.full_name)
        }
        if (user?.user_metadata?.user_name) {
          setUsername(user.user_metadata.user_name.toLowerCase())
        }
        if (user?.app_metadata?.provider === 'github' && user?.user_metadata?.user_name) {
          setGithubHandle(user.user_metadata.user_name)
        }
      } catch {
        // Supabase not configured
      }
    }
    prefill()
  }, [])

  const validateUsername = (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setUsername(cleaned)
    setUsernameError('')

    if (cleaned.length < 3) {
      setUsernameError('Username must be at least 3 characters')
    }
  }

  const checkUsernameAvailability = async () => {
    if (username.length < 3) return

    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

      if (data) {
        setUsernameError('Username is already taken')
      }
    } catch {
      // Supabase not configured
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameError || username.length < 3 || !displayName.trim()) return

    setSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        setSubmitting(false)
        return
      }

      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        display_name: displayName.trim(),
        username,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        twitter_handle: twitterHandle.trim() || null,
        github_handle: githubHandle.trim() || null,
      })

      if (insertError) {
        if (insertError.code === '23505') {
          setUsernameError('Username is already taken')
        } else {
          setError(insertError.message)
        }
        setSubmitting(false)
        return
      }

      router.push('/')
    } catch {
      setError('Something went wrong')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white">Welcome to VibeBoard</h1>
        <p className="mt-2 text-zinc-400">Set up your profile to get started.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-zinc-300">
              Display Name *
            </label>
            <input
              id="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/25"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-zinc-300">
              Username *
              <span className="ml-1 font-normal text-zinc-500">(lowercase only)</span>
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => validateUsername(e.target.value)}
              onBlur={checkUsernameAvailability}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 outline-none focus:border-white/25 focus:ring-1 focus:ring-white/25"
              placeholder="your-username"
            />
            {usernameError && (
              <p className="mt-1 text-sm text-red-400">{usernameError}</p>
            )}
          </div>

          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-zinc-300">
              Twitter / X Handle
            </label>
            <div className="mt-1.5 flex items-center rounded-lg border border-white/10 bg-zinc-900 focus-within:border-white/25 focus-within:ring-1 focus-within:ring-white/25">
              <span className="pl-3 text-zinc-500">@</span>
              <input
                id="twitter"
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value.replace(/^@/, ''))}
                className="w-full bg-transparent px-2 py-2 text-white placeholder-zinc-500 outline-none"
                placeholder="handle"
              />
            </div>
          </div>

          <div>
            <label htmlFor="github" className="block text-sm font-medium text-zinc-300">
              GitHub Handle
            </label>
            <div className="mt-1.5 flex items-center rounded-lg border border-white/10 bg-zinc-900 focus-within:border-white/25 focus-within:ring-1 focus-within:ring-white/25">
              <span className="pl-3 text-zinc-500">@</span>
              <input
                id="github"
                type="text"
                value={githubHandle}
                onChange={(e) => setGithubHandle(e.target.value.replace(/^@/, ''))}
                className="w-full bg-transparent px-2 py-2 text-white placeholder-zinc-500 outline-none"
                placeholder="handle"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !!usernameError || username.length < 3 || !displayName.trim()}
            className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Creating profile...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  )
}
