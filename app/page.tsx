import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { AppWithUser, UserVote, Favorite } from '@/lib/types'
import { AppFeed } from '@/components/feed/AppFeed'

export const metadata: Metadata = {
  // Root layout `title.template` applies automatically, producing:
  // "Discover AI-built apps · VibeBoard"
  title: 'Discover AI-built apps',
  description:
    'The best AI-built apps, curated. Explore what indie builders are shipping — vote, save favorites, and submit your own.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'VibeBoard — AI-built apps, curated',
    description:
      'The best AI-built apps, curated. Explore what indie builders are shipping — vote, save favorites, and submit your own.',
    images: ['/api/og?title=AI-built%20apps%2C%20curated.&description=Discover%20the%20best%20vibe-coded%20projects%20from%20indie%20builders.'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VibeBoard — AI-built apps, curated',
    description:
      'The best AI-built apps, curated. Explore what indie builders are shipping.',
    images: ['/api/og?title=AI-built%20apps%2C%20curated.&description=Discover%20the%20best%20vibe-coded%20projects%20from%20indie%20builders.'],
  },
}

export default async function Home() {
  let apps: AppWithUser[] = []
  let userVotes: UserVote[] = []
  let favoriteIds: string[] = []

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
      const [votesRes, favsRes] = await Promise.all([
        supabase.from('votes').select('app_id, value').eq('user_id', user.id),
        supabase.from('favorites').select('app_id').eq('user_id', user.id),
      ])

      userVotes = (votesRes.data as UserVote[]) ?? []
      favoriteIds = ((favsRes.data as Favorite[]) ?? []).map((f) => f.app_id)
    }
  } catch {
    // Supabase not configured
  }

  const totalApps = apps.length

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
      {/* Hero */}
      <header className="mb-12 sm:mb-16">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#bfff3c] blink-dot" />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfff3c]/80">
            Issue 001 · Live &amp; shipping
          </p>
        </div>

        <h1 className="mt-6 font-display text-[48px] italic leading-[0.95] tracking-tight text-white sm:text-[88px]">
          The best apps,{' '}
          <span className="relative inline-block">
            <span className="relative z-10">built with</span>
          </span>
          <br />
          <span className="text-[#bfff3c]">vibes</span> <span className="text-white/20">&amp;</span> taste.
        </h1>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-xl text-[15px] leading-relaxed text-white/45 sm:text-[17px]">
            A curated showcase of apps built fast, built weird, built well. One honest feed for
            the builders actually shipping.
          </p>

          {/* Stats strip */}
          <div className="flex items-baseline gap-5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/30">
            <span className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-display not-italic leading-none tracking-tight text-white">
                {totalApps}
              </span>
              apps
            </span>
            <span className="h-6 w-px bg-white/10" />
            <span className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-display not-italic leading-none tracking-tight text-[#bfff3c]">
                24/7
              </span>
              live
            </span>
          </div>
        </div>
      </header>

      {/* Feed */}
      <AppFeed initialApps={apps} userVotes={userVotes} favoriteIds={favoriteIds} />
    </div>
  )
}
