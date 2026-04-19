import type { Metadata } from 'next'

// Onboarding is a logged-in-only setup step — not useful to crawlers.
export const metadata: Metadata = {
  title: 'Welcome to VibeBoard',
  description: 'Set up your VibeBoard profile.',
  alternates: { canonical: '/onboarding' },
  robots: { index: false, follow: false },
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
