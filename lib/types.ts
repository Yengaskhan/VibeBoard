export type App = {
  id: string
  title: string
  slug: string
  short_description: string
  long_description: string | null
  url: string
  embed_code: string | null
  screenshot_urls: string[]
  user_id: string
  vote_count: number
  favorite_count: number
  visits: number
  created_at: string
}

export type Tag = {
  id: string
  name: string
  slug: string
}

export type AppWithUser = App & {
  user: {
    display_name: string
    username: string
    avatar_url: string | null
  }
  app_tags: {
    tag: Tag
  }[]
}

export type UserProfile = {
  id: string
  display_name: string
  username: string
  bio: string | null
  avatar_url: string | null
  twitter_handle: string | null
  github_handle: string | null
  created_at: string
}

export type UserVote = {
  app_id: string
  value: number
}

export type Favorite = {
  app_id: string
}
