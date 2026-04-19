import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vibe-board-sand.vercel.app'

// Re-generate the sitemap at most every 60 minutes so newly-submitted apps
// show up in Google without blowing API budget on every crawler hit.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  try {
    const supabase = await createClient()

    // All published apps — dynamic from Supabase
    const { data: apps } = await supabase
      .from('apps')
      .select('slug, created_at')
      .order('created_at', { ascending: false })

    const appRoutes: MetadataRoute.Sitemap = (apps ?? []).map((app) => ({
      url: `${SITE_URL}/app/${app.slug}`,
      lastModified: new Date(app.created_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    // All user profiles
    const { data: users } = await supabase
      .from('users')
      .select('username, created_at')

    const userRoutes: MetadataRoute.Sitemap = (users ?? []).map((u) => ({
      url: `${SITE_URL}/user/${u.username}`,
      lastModified: new Date(u.created_at),
      changeFrequency: 'weekly',
      priority: 0.5,
    }))

    return [...staticRoutes, ...appRoutes, ...userRoutes]
  } catch {
    // Supabase unreachable at build time → ship static routes only rather than failing the build.
    return staticRoutes
  }
}
