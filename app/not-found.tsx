import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-20 text-center">
      {/* Giant serif 404, rotated slightly */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="select-none font-display text-[260px] italic leading-none text-white/[0.03] sm:text-[400px]">
          404
        </span>
      </div>

      <div className="relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#bfff3c]/70">
          / lost in the feed
        </p>
        <h1 className="mt-4 font-display text-[48px] italic leading-[1.05] text-white sm:text-[64px]">
          This page<br />got <span className="text-[#bfff3c]">vibed out</span>.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/40">
          We looked under every screenshot, scrolled every feed, couldn&apos;t find it. Maybe
          it was never built. Maybe it shipped, got resurrected, got vibed again.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-accent rounded-full px-5 py-2.5 text-[13px]"
          >
            Back to feed
          </Link>
          <Link
            href="/submit"
            className="rounded-full border border-white/[0.08] bg-white/[0.02] px-5 py-2.5 text-[13px] font-medium text-white/70 transition-all hover:border-white/[0.2] hover:text-white"
          >
            Submit an app
          </Link>
        </div>
      </div>
    </div>
  )
}
