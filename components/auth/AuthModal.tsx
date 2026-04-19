'use client'

import { createClient } from '@/lib/supabase/client'
import {
  setPendingAction,
  clearPendingAction,
  executePendingAction,
  type PendingAction,
} from '@/lib/pending-action'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Purpose = 'vote' | 'favorite'
type View = 'providers' | 'email-form' | 'email-sent' | 'reset-sent'
type Mode = 'signup' | 'signin'

const TITLES: Record<Purpose, string> = {
  vote: 'Sign in to vote',
  favorite: 'Sign in to save',
}

const SUBTITLES: Record<Purpose, string> = {
  vote: 'Takes 2 seconds. Your vote registers as soon as you\u2019re back.',
  favorite: 'Takes 2 seconds. Save apps you love.',
}

export const AuthModal = ({
  open,
  onClose,
  purpose,
  pendingAction,
}: {
  open: boolean
  onClose: () => void
  purpose: Purpose
  pendingAction: PendingAction
}) => {
  const router = useRouter()

  const [view, setView] = useState<View>('providers')
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('')

  // Reset internal state every time the modal re-opens
  useEffect(() => {
    if (open) {
      setView('providers')
      setMode('signup')
      setEmail('')
      setPassword('')
      setShowPassword(false)
      setLoading(false)
      setError('')
      setSentTo('')
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null
  if (typeof document === 'undefined') return null

  // ─── OAuth providers ─────────────────────────────────────────────────
  const handleOAuth = async (provider: 'github' | 'google') => {
    setPendingAction(pendingAction)
    try {
      const supabase = createClient()
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
    } catch (err) {
      clearPendingAction()
      console.error('Sign in error:', err)
      setError('Sign in failed. Try again.')
    }
  }

  // ─── Email sign up ───────────────────────────────────────────────────
  const handleSignUp = async () => {
    setError('')
    if (!email.includes('@')) return setError('Enter a valid email.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')

    setLoading(true)
    setPendingAction(pendingAction)

    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })

      if (err) {
        clearPendingAction()
        if (err.message.toLowerCase().includes('already registered')) {
          setError('Email already registered. Try signing in instead.')
          setMode('signin')
        } else {
          setError(err.message)
        }
        return
      }

      // If email confirmations are ON in Supabase: session is null, user awaits email link.
      // If email confirmations are OFF: session is present, user is signed in now.
      if (data.session) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) await executePendingAction(supabase, user.id)
        onClose()
        router.refresh()
      } else {
        setSentTo(email)
        setView('email-sent')
      }
    } catch (err) {
      clearPendingAction()
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ─── Email sign in ───────────────────────────────────────────────────
  const handleSignIn = async () => {
    setError('')
    if (!email.includes('@')) return setError('Enter a valid email.')
    if (!password) return setError('Enter your password.')

    setLoading(true)
    setPendingAction(pendingAction)

    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })

      if (err) {
        clearPendingAction()
        setError(err.message.toLowerCase().includes('invalid')
          ? 'Wrong email or password.'
          : err.message)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) await executePendingAction(supabase, user.id)

      onClose()
      router.refresh()
    } catch (err) {
      clearPendingAction()
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ─── Forgot password ─────────────────────────────────────────────────
  const handleForgot = async () => {
    setError('')
    if (!email.includes('@')) {
      setError('Enter your email first, then hit forgot password.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })
      if (err) {
        setError(err.message)
        return
      }
      setSentTo(email)
      setView('reset-sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ─── Resend email ────────────────────────────────────────────────────
  const handleResend = async () => {
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.resend({ type: 'signup', email: sentTo })
      if (err) setError(err.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ─── Rendering ───────────────────────────────────────────────────────
  const inputClass =
    'w-full rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-[14px] text-white placeholder-white/25 outline-none transition-all focus:border-[#bfff3c]/40 focus:ring-1 focus:ring-[#bfff3c]/20'

  const primaryBtn =
    'w-full rounded-full bg-[#bfff3c] px-4 py-3 text-[14px] font-semibold text-[#08080a] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50'

  const secondaryBtn =
    'flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-[14px] font-medium text-white transition-all hover:border-[#bfff3c]/40 hover:bg-[#bfff3c]/[0.06]'

  const linkBtn =
    'text-[12px] font-medium text-white/40 underline-offset-2 hover:text-[#bfff3c] hover:underline'

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Card */}
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d10] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/2 h-40 w-[140%] -translate-x-1/2 rounded-full bg-[#bfff3c]/15 blur-3xl"
        />

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/80"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative px-6 pb-6 pt-10 sm:px-8 sm:pt-12">
          {/* ─── Providers view ─────────────────────────────────────── */}
          {view === 'providers' && (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#bfff3c]/80">
                {'\u2022'} one tap in
              </p>
              <h2
                id="auth-modal-title"
                className="mt-3 font-display text-[32px] italic leading-[1] tracking-tight text-white"
              >
                {TITLES[purpose]}
              </h2>
              <p className="mt-3 text-[13px] leading-relaxed text-white/40">
                {SUBTITLES[purpose]}
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <button type="button" onClick={() => handleOAuth('github')} className={secondaryBtn}>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </button>
                <button type="button" onClick={() => handleOAuth('google')} className={secondaryBtn}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/[0.08]" />
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">or</span>
                <div className="h-px flex-1 bg-white/[0.08]" />
              </div>

              <button
                type="button"
                onClick={() => setView('email-form')}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.01] px-4 py-2.5 text-[13px] font-medium text-white/60 transition-all hover:border-white/[0.12] hover:bg-white/[0.04] hover:text-white"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Continue with email
              </button>

              <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-wider text-white/20">
                No password required for OAuth. Just your profile.
              </p>
            </>
          )}

          {/* ─── Email form view ────────────────────────────────────── */}
          {view === 'email-form' && (
            <>
              <button
                type="button"
                onClick={() => { setView('providers'); setError('') }}
                className="mb-4 flex items-center gap-1.5 text-[12px] font-medium text-white/40 transition-colors hover:text-[#bfff3c]"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                back
              </button>

              <h2
                id="auth-modal-title"
                className="font-display text-[28px] italic leading-[1] tracking-tight text-white"
              >
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h2>

              {/* Mode toggle */}
              <div className="mt-4 inline-flex rounded-full border border-white/[0.08] bg-white/[0.02] p-[3px]">
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError('') }}
                  className={`rounded-full px-3.5 py-1 text-[12px] font-medium transition-all ${
                    mode === 'signup' ? 'bg-[#bfff3c] text-[#08080a]' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Sign up
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError('') }}
                  className={`rounded-full px-3.5 py-1 text-[12px] font-medium transition-all ${
                    mode === 'signin' ? 'bg-[#bfff3c] text-[#08080a]' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  Sign in
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (mode === 'signup') handleSignUp()
                  else handleSignIn()
                }}
                className="mt-5 space-y-3"
              >
                <div>
                  <label htmlFor="auth-email" className="sr-only">Email</label>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
                <div className="relative">
                  <label htmlFor="auth-password" className="sr-only">Password</label>
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'Pick a password (6+ chars)' : 'Your password'}
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

                {error && (
                  <p className="text-[12px] text-[#ff6b3c]">{error}</p>
                )}

                <button type="submit" disabled={loading} className={primaryBtn}>
                  {loading ? 'One sec\u2026' : mode === 'signup' ? 'Create account' : 'Sign in'}
                </button>
              </form>

              {mode === 'signin' && (
                <div className="mt-3 flex justify-center">
                  <button type="button" onClick={handleForgot} disabled={loading} className={linkBtn}>
                    Forgot password?
                  </button>
                </div>
              )}
            </>
          )}

          {/* ─── Email-sent view (after signup) ─────────────────────── */}
          {view === 'email-sent' && (
            <>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#bfff3c]/30 bg-[#bfff3c]/10">
                <svg className="h-5 w-5 text-[#bfff3c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
                </svg>
              </div>

              <h2 id="auth-modal-title" className="font-display text-[24px] italic leading-tight tracking-tight text-white">
                Check your inbox
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-white/40">
                We sent a confirmation link to <span className="text-white/70">{sentTo}</span>. Click it to activate your account, then come back here.
              </p>

              {error && <p className="mt-3 text-[12px] text-[#ff6b3c]">{error}</p>}

              <div className="mt-5 flex flex-col gap-2">
                <button type="button" onClick={handleResend} disabled={loading} className={secondaryBtn}>
                  {loading ? 'Sending\u2026' : 'Resend email'}
                </button>
                <button type="button" onClick={onClose} className={linkBtn + ' mt-1 text-center'}>
                  Close
                </button>
              </div>
            </>
          )}

          {/* ─── Reset-sent view (after forgot password) ────────────── */}
          {view === 'reset-sent' && (
            <>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#bfff3c]/30 bg-[#bfff3c]/10">
                <svg className="h-5 w-5 text-[#bfff3c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>

              <h2 id="auth-modal-title" className="font-display text-[24px] italic leading-tight tracking-tight text-white">
                Reset link sent
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-white/40">
                Check <span className="text-white/70">{sentTo}</span> for a password reset link. Click it to set a new password.
              </p>

              <div className="mt-5">
                <button type="button" onClick={onClose} className={primaryBtn}>
                  Got it
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
