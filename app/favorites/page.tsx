import { createClient } from '@/lib/supabase/server'
import type { AppWithUser } from '@/lib/types'
import { AppCard } from '@/components/feed/AppCard'
import Link from 'next/link'

export const metadata = {
  title: 'Favorites | VibeBoard',
}

export default async function FavoritesPage() {
  let apps: AppWithUser[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: favs } = await supabase
        .from('favorites')
        .select('app_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (favs && favs.length > 0) {
        const appIds = favs.map((f) => f.app_id)

        const { data: appsData } = await supabase
          .from('apps')
          .select(`
            *,
            user:users(display_name, username, avatar_url),
            app_tags(tag:tags(id, name, slug))
          `)
          .in('id', appIds)

        apps = (appsData as AppWithUser[]) ?? []

        // Preserve favorites order
        apps.sort((a, b) => appIds.indexOf(a.id) - appIds.indexOf(b.id))
      }
    }
  } catch {
    // Supabase not configured
  }

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-10">
        <h1 className="text-[28px] font-bold tracking-tight text-white">Favorites</h1>
        <p className="mt-1.5 text-[15px] text-white/30">Apps you&apos;ve saved for later.</p>
      </div>

      {apps.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            <svg className="h-7 w-7 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <p className="mt-4 text-[15px] font-medium text-white/30">No favorites yet</p>
          <p className="mt-1 text-[13px] text-white/15">Explore the feed and save apps you love.</p>
          <Link
            href="/"
            className="mt-6 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-5 py-2 text-[13px] font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30 hover:brightness-110"
          >
            Explore Apps
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} userVote={0} isFavorited={true} />
          ))}
        </div>
      )}
    </div>
  )
}
