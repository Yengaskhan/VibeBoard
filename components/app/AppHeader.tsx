import Link from 'next/link'
import Image from 'next/image'

export const AppHeader = ({
  title,
  shortDescription,
  user,
  url,
}: {
  title: string
  shortDescription: string
  user: { display_name: string, username: string, avatar_url: string | null }
  url: string
}) => {
  return (
    <div>
      {/* Eyebrow */}
      <div className="flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-[#bfff3c]" />
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#bfff3c]/80">
          / app spotlight
        </p>
      </div>

      {/* Title */}
      <h1 className="mt-3 font-display text-[44px] italic leading-[1.02] tracking-tight text-white sm:text-[64px]">
        {title}
      </h1>

      {/* Tagline */}
      <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/50 sm:text-[19px]">
        {shortDescription}
      </p>

      {/* Author + visit CTA */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href={`/user/${user.username}`}
          className="group flex items-center gap-2.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 transition-all hover:border-[#bfff3c]/30 hover:bg-[#bfff3c]/[0.04]"
        >
          {user.avatar_url ? (
            <Image
              src={user.avatar_url}
              alt={user.display_name}
              width={20}
              height={20}
              className="rounded-full ring-1 ring-white/[0.08]"
            />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#bfff3c] font-display italic text-[10px] text-[#08080a]">
              {user.display_name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-[13px] font-medium text-white/70 transition-colors group-hover:text-white">
            {user.display_name}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/30 group-hover:text-[#bfff3c]/70">
            @{user.username}
          </span>
        </Link>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-accent group flex items-center gap-2 rounded-full px-4 py-2 text-[13px]"
        >
          Visit app
          <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </div>
  )
}
