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
    <nav className="relative z-10 border-b border-white/[0.04] bg-[#050507]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#7c3aed] to-[#06b6d4]">
            <span className="text-xs font-black text-white">V</span>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white/90 transition-colors group-hover:text-white">
            VibeBoard
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SearchBar />
          {user && profile ? (
            <>
              <Link
                href="/submit"
                className="hidden rounded-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-4 py-1.5 text-[13px] font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30 hover:brightness-110 sm:block"
              >
                Submit App
              </Link>
              <UserMenu
                displayName={profile.display_name}
                username={profile.username}
                avatarUrl={profile.avatar_url ?? user?.user_metadata?.avatar_url ?? null}
              />
            </>
          ) : user ? (
            <span className="text-sm text-[#6b6b80]">Setting up...</span>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </nav>
  )
}
