import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset your password',
  description: 'Set a new password for your VibeBoard account.',
  robots: { index: false, follow: false },
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
