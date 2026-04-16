import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserProfile, AppWithUser } from '@/lib/types'
import Image from 'next/image'
import { AppCard } from '@/components/feed/AppCard'

type Props = {
  params: Promise<{ username: string }>
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { username } = await params

  try {
    const supabase = await createClient()
    const { data: user } = await supabase
      .from('users')
      .select('display_name, bio')
      .eq('username', username)
      .single()

    if (!user) return { title: 'User Not Found | VibeBoard' }

    return {
      title: `${user.display_name} | VibeBoard`,
      description: user.bio ?? `${user.display_name} on VibeBoard`,
    }
  } catch {
    return { title: 'VibeBoard' }
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params

  let profile: UserProfile | null = null
  let apps: AppWithUser[] = []

  try {
    const supabase = await createClient()

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    profile = userData as UserProfile | null

    if (profile) {
      const { data: appsData } = await supabase
        .from('apps')
        .select(`
          *,
          user:users(display_name, username, avatar_url),
          app_tags(tag:tags(id, name, slug))
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })

      apps = (appsData as AppWithUser[]) ?? []
    }
  } catch {
    // Supabase not configured
  }

  if (!profile) notFound()

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <div className="flex items-start gap-5">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name}
            width={72}
            height={72}
            className="rounded-full ring-2 ring-white/[0.08]"
          />
        ) : (
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] text-2xl font-bold text-white">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold tracking-tight text-white">{profile.display_name}</h1>
          <p className="text-[14px] text-white/30">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-[14px] leading-relaxed text-white/50">{profile.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-white/25">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Joined {joinDate}
            </span>
            {profile.twitter_handle && (
              <a
                href={`https://x.com/${profile.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-colors hover:text-white/60"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                @{profile.twitter_handle}
              </a>
            )}
            {profile.github_handle && (
              <a
                href={`https://github.com/${profile.github_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-colors hover:text-white/60"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                {profile.github_handle}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-[15px] font-semibold text-white/60">
          {apps.length > 0 ? `Apps (${apps.length})` : 'No apps submitted yet'}
        </h2>
        {apps.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} userVote={0} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
