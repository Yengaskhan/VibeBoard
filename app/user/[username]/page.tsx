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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-start gap-6">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name}
            width={80}
            height={80}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-700 text-2xl font-bold text-white">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">{profile.display_name}</h1>
          <p className="text-sm text-zinc-500">@{profile.username}</p>
          {profile.bio && (
            <p className="mt-2 text-zinc-400">{profile.bio}</p>
          )}
          <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
            <span>Joined {joinDate}</span>
            {profile.twitter_handle && (
              <a
                href={`https://x.com/${profile.twitter_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                @{profile.twitter_handle}
              </a>
            )}
            {profile.github_handle && (
              <a
                href={`https://github.com/${profile.github_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-colors hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                {profile.github_handle}
              </a>
            )}
          </div>
        </div>
      </div>

      {apps.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-white">
            Apps ({apps.length})
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} userVote={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
