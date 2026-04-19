import type { Metadata } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import { PendingActionRunner } from '@/components/auth/PendingActionRunner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
})

// Allow overriding the canonical site URL per environment (preview deploys,
// local dev against an ngrok tunnel, etc.) while defaulting to production.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vibe-board-sand.vercel.app'

const DEFAULT_TITLE = 'VibeBoard — AI-built apps, curated'
const DEFAULT_DESCRIPTION =
  'A curated showcase of apps built with AI. Discover, vote, and share the best vibe-coded projects from indie builders.'
const DEFAULT_OG = `${SITE_URL}/api/og`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    // Child pages export `title: 'App Name'` and Next.js composes it as `App Name · VibeBoard`.
    template: '%s · VibeBoard',
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: 'VibeBoard',
  keywords: [
    'AI apps',
    'vibe coded',
    'AI-built apps',
    'indie makers',
    'showcase',
    'Product Hunt alternative',
    'AI tools',
  ],
  authors: [{ name: 'VibeBoard' }],
  creator: 'VibeBoard',
  publisher: 'VibeBoard',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'VibeBoard',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: DEFAULT_OG,
        width: 1200,
        height: 630,
        alt: 'VibeBoard — AI-built apps, curated',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <PendingActionRunner />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
