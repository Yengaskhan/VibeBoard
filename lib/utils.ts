import type { SupabaseClient } from '@supabase/supabase-js'

export const slugify = (title: string): string =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')

export const generateUniqueSlug = async (
  title: string,
  supabase: SupabaseClient
): Promise<string> => {
  const base = slugify(title)
  let slug = base
  let counter = 2

  while (true) {
    const { data } = await supabase
      .from('apps')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!data) return slug
    slug = `${base}-${counter}`
    counter++
  }
}
