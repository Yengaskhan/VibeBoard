import type { Metadata } from 'next'

// The page itself is a client component (form state, file uploads), so its
// metadata is declared here on the route-level server layout instead.
export const metadata: Metadata = {
  title: 'Submit your app',
  description:
    'Show off what you built. Submit your AI-built app to VibeBoard and get discovered by the indie builder community.',
  alternates: { canonical: '/submit' },
  openGraph: {
    type: 'website',
    url: '/submit',
    title: 'Submit your app · VibeBoard',
    description:
      'Show off what you built. Submit your AI-built app to VibeBoard and get discovered.',
    images: [
      '/api/og?title=Submit%20your%20app&description=Show%20off%20what%20you%20built.%20Get%20discovered%20by%20the%20indie%20community.&tag=SHIP%20IT',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Submit your app · VibeBoard',
    description: 'Show off what you built. Get discovered by indie builders.',
    images: [
      '/api/og?title=Submit%20your%20app&description=Show%20off%20what%20you%20built.%20Get%20discovered%20by%20the%20indie%20community.&tag=SHIP%20IT',
    ],
  },
}

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
