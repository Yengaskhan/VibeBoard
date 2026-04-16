import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 text-center">
      <div className="text-[120px] font-black leading-none tracking-tighter text-white/[0.04] sm:text-[180px]">
        404
      </div>
      <h1 className="mt-2 text-xl font-semibold text-white/80">Page not found</h1>
      <p className="mt-2 text-[15px] text-white/30">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 py-2.5 text-[14px] font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:shadow-purple-500/30 hover:brightness-110"
      >
        Back to Home
      </Link>
    </div>
  )
}
