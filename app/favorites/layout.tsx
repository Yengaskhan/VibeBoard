import type { Metadata } from 'next'

// Favorites is a personal, logged-in-only page — not meant to be crawled or
// shared, so we opt out of indexing and share images.
export const metadata: Metadata = {
  title: 'Your favorites',
  description: 'Apps you\u2019ve saved on VibeBoard.',
  alternates: { canonical: '/favorites' },
  robots: { index: false, follow: false },
}

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
