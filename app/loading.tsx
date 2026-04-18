export default function HomeLoading() {
  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
      {/* Hero skeleton */}
      <div className="mb-10">
        <div className="h-4 w-40 shimmer rounded-full" />
        <div className="mt-4 h-12 w-[min(90%,640px)] shimmer rounded-xl" />
        <div className="mt-3 h-5 w-80 shimmer rounded-full" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        <div className="h-9 w-32 shimmer rounded-full" />
        <div className="h-9 w-16 shimmer rounded-full" />
        <div className="h-9 w-14 shimmer rounded-full" />
      </div>

      {/* Featured skeleton — large */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101014]">
        <div className="aspect-[16/9] w-full shimmer" />
        <div className="p-8">
          <div className="h-8 w-2/3 shimmer rounded-lg" />
          <div className="mt-3 h-4 w-full shimmer rounded-md" />
          <div className="mt-2 h-4 w-5/6 shimmer rounded-md" />
        </div>
      </div>

      {/* Bento skeleton — asymmetric */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
        {[
          'lg:col-span-4',
          'lg:col-span-2',
          'lg:col-span-2',
          'lg:col-span-2',
          'lg:col-span-2',
          'lg:col-span-4',
          'lg:col-span-2',
        ].map((span, i) => (
          <div
            key={i}
            className={`${span} overflow-hidden rounded-2xl border border-white/[0.06] bg-[#101014]`}
          >
            <div className={`${i === 0 || i === 5 ? 'aspect-[16/10]' : 'aspect-[4/3]'} w-full shimmer`} />
            <div className="p-4">
              <div className="h-4 w-3/4 shimmer rounded-md" />
              <div className="mt-2 h-3 w-full shimmer rounded-md" />
              <div className="mt-1 h-3 w-2/3 shimmer rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom hint */}
      <div className="mt-10 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/20">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#bfff3c]/70 blink-dot" />
        Loading latest drops
      </div>
    </div>
  )
}
