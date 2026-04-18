import Link from 'next/link'
import Image from 'next/image'
import type { AppWithUser } from '@/lib/types'
import { VoteButton } from './VoteButton'
import { FavoriteButton } from './FavoriteButton'

type Variant = 'default' | 'wide' | 'featured'

export const AppCard = ({
  app,
  userVote,
  isFavorited = false,
  variant = 'default',
  rank,
}: {
  app: AppWithUser
  userVote: number
  isFavorited?: boolean
  variant?: Variant
  rank?: number
}) => {
  const tags = app.app_tags?.map((at) => at.tag) ?? []
  const isFeatured = variant === 'featured'
  const isWide = variant === 'wide'

  const aspect = isFeatured ? 'aspect-[16/9]' : isWide ? 'aspect-[16/10]' : 'aspect-[4/3]'
  const titleSize = isFeatured
    ? 'text-[28px] sm:text-[36px] leading-[1.05]'
    : isWide
      ? 'text-[20px] leading-tight'
      : 'text-[16px] leading-snug'
  const padding = isFeatured ? 'p-6 sm:p-8' : 'p-4 pt-3.5'

  // Whole card = launch the app in a new tab (primary action)
  // Small "Details" link in the corner = go to the editorial detail page (secondary)
  return (
    <div className="tilt-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101014]">
      {/* Primary click target — transparent anchor covering the whole card */}
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${app.title}`}
        className="absolute inset-0 z-10"
      />

      {/* Featured badge */}
      {isFeatured && (
        <div className="pointer-events-none absolute left-5 top-5 z-20 flex items-center gap-1.5 rounded-full border border-[#bfff3c]/30 bg-[#bfff3c]/10 px-2.5 py-1 backdrop-blur-md">
          <span className="blink-dot h-1.5 w-1.5 rounded-full bg-[#bfff3c]" />
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#bfff3c]">Featured</span>
        </div>
      )}

      {/* Rank for top list */}
      {rank && !isFeatured && (
        <div className="pointer-events-none absolute right-3 top-3 z-20 font-display text-[28px] italic leading-none text-white/10 sm:text-[36px]">
          {String(rank).padStart(2, '0')}
        </div>
      )}

      {/* Screenshot area */}
      <div className={`relative ${aspect} w-full overflow-hidden bg-[#0d0d10]`}>
        {app.screenshot_urls?.[0] ? (
          <>
            <Image
              src={app.screenshot_urls[0]}
              alt={app.title}
              fill
              className="object-cover transition-all duration-[800ms] ease-out group-hover:scale-[1.04]"
              sizes={
                isFeatured
                  ? '(max-width: 1024px) 100vw, 1120px'
                  : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
              }
              priority={isFeatured}
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#101014] via-[#101014]/60 to-transparent" />
          </>
        ) : (
          <div className="relative flex h-full items-center justify-center">
            <div className="h-20 w-20 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#bfff3c]/10 via-transparent to-[#ff6b3c]/10" />
            <span className="absolute font-display text-5xl italic text-white/15">
              {app.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Hover "Visit" chip — appears on hover to make the launch CTA obvious */}
        <div className="pointer-events-none absolute inset-0 z-[11] flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-[#bfff3c] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#08080a] shadow-[0_12px_40px_-8px_rgba(191,255,60,0.45)]">
            Visit app
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>

        {/* Vote pill — bottom-left, above the overlay */}
        <div className="absolute bottom-3 left-3 z-20">
          <div className="flex items-center gap-0.5 rounded-full border border-white/[0.1] bg-black/70 px-1.5 py-1 backdrop-blur-md">
            <VoteButton
              appId={app.id}
              initialVoteCount={app.vote_count}
              userVote={userVote}
              layout="horizontal"
            />
          </div>
        </div>

        {/* Favorite — bottom-right, above the overlay */}
        <div className="absolute bottom-3 right-3 z-20">
          <div className="rounded-full border border-white/[0.1] bg-black/70 p-1 backdrop-blur-md">
            <FavoriteButton appId={app.id} isFavorited={isFavorited} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col gap-3 ${padding}`}>
        <div>
          <h3 className={`font-display italic tracking-tight text-white transition-colors ${titleSize} group-hover:text-[#e8ffc0]`}>
            {app.title}
          </h3>
          <p
            className={`mt-1.5 text-white/40 ${
              isFeatured ? 'text-[15px] leading-relaxed line-clamp-3' : 'text-[13px] leading-relaxed line-clamp-2'
            }`}
          >
            {app.short_description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <div className="flex min-w-0 items-center gap-2">
            {app.user?.avatar_url ? (
              <Image
                src={app.user.avatar_url}
                alt={app.user.display_name}
                width={18}
                height={18}
                className="shrink-0 rounded-full ring-1 ring-white/[0.08]"
              />
            ) : (
              <div className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#bfff3c] font-display italic text-[9px] text-[#08080a]">
                {app.user?.display_name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="truncate font-mono text-[10px] uppercase tracking-wider text-white/35">
              {app.user?.display_name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {tags.length > 0 && (
              <div className="flex gap-1">
                {tags.slice(0, isFeatured ? 3 : 1).map((tag) => (
                  <span
                    key={tag.slug}
                    className="rounded-full border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 text-[10px] font-medium text-white/50 transition-colors group-hover:border-[#bfff3c]/20 group-hover:text-[#bfff3c]/70"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            {/* Secondary CTA — details page (z-20 so it sits above the overlay anchor) */}
            <Link
              href={`/app/${app.slug}`}
              className="relative z-20 font-mono text-[9px] uppercase tracking-wider text-white/25 underline-offset-2 hover:text-[#bfff3c] hover:underline"
              aria-label={`See details for ${app.title}`}
            >
              Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
