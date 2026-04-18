import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SignInButton } from './SignInButton'
import { UserMenu } from './UserMenu'
import { SearchBar } from './SearchBar'

export const Navbar = async () => {
  let profile: { display_name: string, avatar_url: string | null, username: string } | null = null
  let user = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user

    if (user) {
      const { data: profileData } = await supabase
        .from('users')
        .select('display_name, avatar_url, username')
        .eq('id', user.id)
        .single()

      profile = profileData
    }
  } catch {
    // Supabase not configured yet
  }

  return (
    <>
      {/* Spacer so content doesn't sit under the floating nav */}
      <div aria-hidden className="h-20" />
      <nav className="fixed left-1/2 top-4 z-40 w-[calc(100%-1.5rem)] max-w-[1120px] -translate-x-1/2">
        <div className="relative flex items-center justify-between rounded-full border border-white/[0.08] bg-[#0d0d10]/70 px-3 py-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.02)_inset] backdrop-blur-2xl sm:px-4">
          {/* Left: mark */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5 pl-1">
            <div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-md bg-[#bfff3c] shadow-[0_0_20px_-2px_rgba(191,255,60,0.45)] transition-transform group-hover:rotate-[-6deg]">
              <span className="font-display text-[15px] italic leading-none text-[#08080a]">V</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
            </div>
            <span className="hidden font-display text-[18px] italic leading-none tracking-tight text-white/95 sm:inline">
              VibeBoard
            </span>
          </Link>

          {/* Center: search */}
          <div className="flex min-w-0 flex-1 justify-center px-2 sm:px-4">
            <SearchBar />
          </div>

          {/* Right: actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            {user && profile ? (
              <>
                <Link
                  href="/submit"
                  className="btn-accent hidden rounded-full px-4 py-1.5 text-[13px] sm:inline-flex"
                >
                  Submit
                </Link>
                <UserMenu
                  displayName={profile.display_name}
                  username={profile.username}
                  avatarUrl={profile.avatar_url ?? user?.user_metadata?.avatar_url ?? null}
                />
              </>
            ) : user ? (
              <span className="pr-2 text-[12px] text-white/40">Setting up…</span>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
