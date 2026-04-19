import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vibe-board-sand.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',          // internal endpoints
          '/auth/',         // login/callback/reset
          '/onboarding',    // auth-gated
          '/favorites',     // auth-gated, personal
          '/submit',        // auth-gated action
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
