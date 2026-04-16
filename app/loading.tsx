export default function HomeLoading() {
  return (
    <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-10">
        <div className="h-10 w-80 animate-pulse rounded-lg bg-white/[0.04]" />
        <div className="mt-3 h-5 w-64 animate-pulse rounded-md bg-white/[0.03]" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-28 animate-pulse rounded-full bg-white/[0.04]" />
        <div className="h-9 w-16 animate-pulse rounded-full bg-white/[0.03]" />
        <div className="h-9 w-14 animate-pulse rounded-full bg-white/[0.03]" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0f]"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="aspect-[16/10] w-full animate-pulse bg-white/[0.03]" />
            <div className="p-4">
              <div className="h-5 w-3/4 animate-pulse rounded-md bg-white/[0.04]" />
              <div className="mt-2 h-4 w-full animate-pulse rounded-md bg-white/[0.03]" />
              <div className="mt-1 h-4 w-2/3 animate-pulse rounded-md bg-white/[0.03]" />
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 animate-pulse rounded-full bg-white/[0.04]" />
                  <div className="h-3 w-16 animate-pulse rounded-md bg-white/[0.03]" />
                </div>
                <div className="h-5 w-14 animate-pulse rounded-full bg-white/[0.03]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
