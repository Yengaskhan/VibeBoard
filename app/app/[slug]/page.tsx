import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { AppWithUser } from '@/lib/types'
import { AppHeader } from '@/components/app/AppHeader'
import { ScreenshotGallery } from '@/components/app/ScreenshotGallery'
import { TagList } from '@/components/app/TagList'
import { EmbedViewer } from '@/components/app/EmbedViewer'
import { VoteButton } from '@/components/feed/VoteButton'
import { FavoriteButton } from '@/components/feed/FavoriteButton'

type Props = {
  params: Promise<{ slug: string }>
}

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { slug } = await params

  try {
    const supabase = await createClient()
    const { data: app } = await supabase
      .from('apps')
      .select('title, short_description, screenshot_urls')
      .eq('slug', slug)
      .single()

    if (!app) return { title: 'App Not Found | VibeBoard' }

    const ogImage = app.screenshot_urls?.[0] ?? undefined

    return {
      title: `${app.title} | VibeBoard`,
      description: app.short_description,
      openGraph: {
        title: app.title,
        description: app.short_description,
        images: ogImage ? [ogImage] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: app.title,
        description: app.short_description,
        images: ogImage ? [ogImage] : [],
      },
    }
  } catch {
    return { title: 'VibeBoard' }
  }
}

export default async function AppDetailPage({ params }: Props) {
  const { slug } = await params

  let app: AppWithUser | null = null
  let userVote = 0
  let isFavorited = false

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('apps')
      .select(`
        *,
        user:users(display_name, username, avatar_url),
        app_tags(tag:tags(id, name, slug))
      `)
      .eq('slug', slug)
      .single()

    app = data as AppWithUser | null

    const { data: { user } } = await supabase.auth.getUser()
    if (user && app) {
      const [voteRes, favRes] = await Promise.all([
        supabase.from('votes').select('value').eq('user_id', user.id).eq('app_id', app.id).single(),
        supabase.from('favorites').select('id').eq('user_id', user.id).eq('app_id', app.id).single(),
      ])

      userVote = voteRes.data?.value ?? 0
      isFavorited = !!favRes.data
    }
  } catch {
    // Supabase not configured
  }

  if (!app) notFound()

  const tags = app.app_tags?.map((at) => at.tag) ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <VoteButton
              appId={app.id}
              initialVoteCount={app.vote_count}
              userVote={userVote}
            />
            <FavoriteButton appId={app.id} isFavorited={isFavorited} />
          </div>
          <div className="flex-1">
            <AppHeader
              title={app.title}
              shortDescription={app.short_description}
              user={app.user}
              url={app.url}
            />
          </div>
        </div>

        <ScreenshotGallery urls={app.screenshot_urls ?? []} />

        <TagList tags={tags} />

        {app.long_description && (
          <section>
            <h2 className="text-lg font-semibold text-white">About</h2>
            <p className="mt-2 whitespace-pre-wrap text-zinc-400">{app.long_description}</p>
          </section>
        )}

        {app.embed_code && <EmbedViewer embedCode={app.embed_code} />}
      </div>
    </div>
  )
}
