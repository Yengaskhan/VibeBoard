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
  const dateStr = new Date(app.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article className="relative z-10 mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
      {/* Metadata strip */}
      <div className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.06] pb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
        <span>Shipped · {dateStr}</span>
        <span className="text-white/15">—</span>
        <span>
          <span className="text-[#bfff3c]">{app.vote_count}</span> boost{app.vote_count === 1 ? '' : 's'}
        </span>
        {tags[0] && (
          <>
            <span className="text-white/15">—</span>
            <span>File: {tags[0].name}</span>
          </>
        )}
      </div>

      {/* Two-column hero: content left, floating actions right */}
      <div className="grid gap-10 lg:grid-cols-[1fr_auto]">
        <div>
          <AppHeader
            title={app.title}
            shortDescription={app.short_description}
            user={app.user!}
            url={app.url}
          />
        </div>

        {/* Floating vote/fav panel */}
        <aside className="flex flex-row items-center gap-2 self-start rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2 backdrop-blur-sm lg:flex-col lg:gap-3 lg:p-3">
          <div className="flex flex-row items-center gap-1 rounded-xl bg-black/40 px-2 py-1 lg:flex-col lg:px-1 lg:py-2">
            <VoteButton
              appId={app.id}
              initialVoteCount={app.vote_count}
              userVote={userVote}
            />
          </div>
          <div className="rounded-xl bg-black/40 p-1.5">
            <FavoriteButton appId={app.id} isFavorited={isFavorited} />
          </div>
        </aside>
      </div>

      {/* Featured screenshot — hero image */}
      <div className="mt-12">
        <ScreenshotGallery urls={app.screenshot_urls ?? []} />
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-8">
          <TagList tags={tags} />
        </div>
      )}

      {/* About - editorial column */}
      {app.long_description && (
        <section className="mt-14 grid gap-10 lg:grid-cols-[200px_1fr]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#bfff3c]/70">
              / the story
            </p>
            <h2 className="mt-3 font-display text-[28px] italic leading-tight text-white">
              About this build
            </h2>
          </div>
          <div className="max-w-2xl">
            <p className="whitespace-pre-wrap text-[16px] leading-[1.75] text-white/70">
              {app.long_description}
            </p>
          </div>
        </section>
      )}

      {/* Embed / Try It */}
      {app.embed_code && (
        <div className="mt-14">
          <EmbedViewer embedCode={app.embed_code} />
        </div>
      )}

      {/* Footer signature */}
      <div className="mt-20 flex items-center justify-between border-t border-white/[0.06] pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-white/25">
        <span>VibeBoard · /app/{app.slug}</span>
        <span className="text-[#bfff3c]/50">— end of drop —</span>
      </div>
    </article>
  )
}
