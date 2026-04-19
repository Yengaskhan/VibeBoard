'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  // The /auth/callback route has already exchanged the recovery code and set a
  // session cookie before redirecting here. We verify we're actually signed in
  // before showing the form — otherwise we tell the user the link is stale.
  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setAuthed(!!user)
      setChecking(false)
    }
    check()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords don\u2019t match.')

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password })

      if (err) {
        setError(err.message)
        return
      }

      setDone(true)
      setTimeout(() => router.push('/'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-[14px] text-white placeholder-white/25 outline-none transition-all focus:border-[#bfff3c]/40 focus:ring-1 focus:ring-[#bfff3c]/20'

  return (
    <div className="relative z-10 mx-auto flex max-w-md flex-col px-5 py-16 sm:px-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#bfff3c]/80">
        {'\u2022'} password reset
      </p>
      <h1 className="mt-3 font-display text-[36px] italic leading-[1] tracking-tight text-white">
        Pick a new password
      </h1>

      {checking ? (
        <div className="mt-8 text-[14px] text-white/40">Checking your reset link\u2026</div>
      ) : !authed ? (
        <div className="mt-6 rounded-xl border border-[#ff6b3c]/20 bg-[#ff6b3c]/[0.05] p-4">
          <p className="text-[13px] text-[#ff6b3c]">
            This reset link is stale or invalid. Go back to the homepage and use &ldquo;Forgot
            password?&rdquo; to request a new one.
          </p>
        </div>
      ) : done ? (
        <div className="mt-6 rounded-xl border border-[#bfff3c]/20 bg-[#bfff3c]/[0.05] p-4">
          <p className="text-[13px] text-[#bfff3c]">
            Password updated. Redirecting you home\u2026
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
          <div className="relative">
            <label htmlFor="new-password" className="sr-only">New password</label>
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (6+ chars)"
              className={inputClass + ' pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-white/30 transition-colors hover:text-white/70"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>

          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className={inputClass}
          />

          {error && <p className="text-[12px] text-[#ff6b3c]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#bfff3c] px-4 py-3 text-[14px] font-semibold text-[#08080a] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Saving\u2026' : 'Update password'}
          </button>
        </form>
      )}
    </div>
  )
}
