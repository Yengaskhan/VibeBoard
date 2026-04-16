import Link from 'next/link'
import Image from 'next/image'
import type { AppWithUser } from '@/lib/types'
import { VoteButton } from './VoteButton'

export const AppCard = ({
  app,
  userVote,
}: {
  app: AppWithUser
  userVote: number
}) => {
  const tags = app.app_tags?.map((at) => at.tag) ?? []

  return (
    <Link
      href={`/app/${app.slug}`}
      className="card-glow group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0f] transition-all duration-500 hover:-translate-y-1 hover:border-white/[0.1] hover:shadow-2xl hover:shadow-purple-500/[0.08]"
    >
      {/* Screenshot — visual-first, takes up most of the card */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#111118]">
        {app.screenshot_urls?.[0] ? (
          <Image
            src={app.screenshot_urls[0]}
            alt={app.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20">
              <span className="text-xl font-bold text-white/20">{app.title.charAt(0)}</span>
            </div>
          </div>
        )}
        {/* Gradient overlay at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
        {/* Vote button overlay - bottom left of image */}
        <div className="absolute bottom-3 left-3 z-10" onClick={(e) => e.preventDefault()}>
          <div className="flex items-center gap-0.5 rounded-full border border-white/[0.08] bg-black/60 px-1 py-0.5 backdrop-blur-md">
            <VoteButton
              appId={app.id}
              initialVoteCount={app.vote_count}
              userVote={userVote}
              layout="horizontal"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4 pt-3">
        <div>
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight text-white/90 transition-colors group-hover:text-white">
            {app.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-white/30">
            {app.short_description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            {app.user?.avatar_url ? (
              <Image
                src={app.user.avatar_url}
                alt={app.user.display_name}
                width={16}
                height={16}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] text-[8px] font-bold text-white">
                {app.user?.display_name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-[11px] font-medium text-white/25">{app.user?.display_name}</span>
          </div>
          {tags.length > 0 && (
            <div className="flex gap-1">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.slug}
                  className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/25"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
