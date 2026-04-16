import { createClient } from '@/lib/supabase/server'
import type { AppWithUser, UserVote } from '@/lib/types'
import { AppFeed } from '@/components/feed/AppFeed'

export default async function Home() {
  let apps: AppWithUser[] = []
  let userVotes: UserVote[] = []

  try {
    const supabase = await createClient()

    const { data: appsData } = await supabase
      .from('apps')
      .select(`
        *,
        user:users(display_name, username, avatar_url),
        app_tags(tag:tags(id, name, slug))
      `)
      .order('created_at', { ascending: false })

    apps = (appsData as AppWithUser[]) ?? []

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: votes } = await supabase
        .from('votes')
        .select('app_id, value')
        .eq('user_id', user.id)

      userVotes = (votes as UserVote[]) ?? []
    }
  } catch {
    // Supabase not configured
  }

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-10">
        <h1 className="text-[28px] font-bold tracking-tight text-white sm:text-4xl">
          The best AI-built apps,{' '}
          <span className="bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent">
            curated.
          </span>
        </h1>
        <p className="mt-2 text-[15px] text-white/30">
          Discover, vote, and showcase what the community is building.
        </p>
      </div>
      <AppFeed initialApps={apps} userVotes={userVotes} />
    </div>
  )
}
