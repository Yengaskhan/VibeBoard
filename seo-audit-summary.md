# SEO & Shareability Audit — Summary

Run: 2026-04-19
Result: production build ✅ (13 routes compile clean)
Deployed URL: https://vibe-board-sand.vercel.app

---

## What was broken

1. **No `metadataBase`.** Root layout only set `title` + `description`. Any relative OG image URL resolved to `null` at runtime — Twitter/FB previews were silently broken on pages without an absolute image URL.
2. **No title template.** Every page had to hard-code `' | VibeBoard'` in its title string. Inconsistent casing / separator across pages (`|`, `·`, `—`).
3. **Homepage had no page-level metadata** — it inherited only the generic root description.
4. **Submit, Favorites, Onboarding, Reset-Password pages are client components** → can't declare `export const metadata` directly. They were falling back to root metadata with no page-specific OG.
5. **App detail pages missing `og:url`, `og:type=article`, `og:site_name`** — social crawlers saw them as generic "websites" instead of articles, which affects unfurling on LinkedIn/Slack.
6. **User profile pages had no OG or Twitter tags at all.** Sharing a profile showed the site-wide default card.
7. **No sitemap.xml** — Google had to rely on crawl-discovery. New app submissions could take weeks to index.
8. **No robots.txt** — admin/api/auth routes were technically crawlable. No sitemap hint published.
9. **App detail page used raw screenshot URL** without a branded fallback when no screenshot existed.

---

## What was fixed

### Root metadata (`app/layout.tsx`)
- Set `metadataBase: new URL(SITE_URL)` so every relative OG URL resolves absolutely.
- Added `title.template: '%s · VibeBoard'` — child pages export just the page name and Next.js composes it.
- Full `openGraph` + `twitter` defaults covering `type`, `siteName`, `images` (1200×630 branded card from `/api/og`), locale, description, and alt text.
- `keywords`, `applicationName`, `publisher`, `authors`, `creator` for rich results.
- `robots.googleBot` config: `max-image-preview: large`, `max-snippet: -1`.
- Default canonical set.
- `SITE_URL` is env-overridable via `NEXT_PUBLIC_SITE_URL` for preview deploys.

### Dynamic OG image route (`app/api/og/route.tsx`)
- New edge-runtime route using `next/og` `ImageResponse`.
- Renders a 1200×630 branded card with the VibeBoard logo, italicized Instrument Serif title, description, optional `tag` eyebrow, optional `creator` byline, and the site URL footer.
- Accepts `?title=`, `?description=`, `?tag=`, `?creator=` params.
- Fetches Instrument Serif from Google Fonts at edge to match the in-site display type.
- Falls back to system serif if the font fetch fails, so the route never errors out.
- Used as the fallback OG for any page without a natural image (homepage, submit, app without screenshot, user without avatar).

### Per-page metadata

| Page | Method | Canonical | OG image |
|------|--------|-----------|----------|
| Homepage `/` | Server-component `metadata` export | `/` | `/api/og?...curated...` |
| App detail `/app/[slug]` | `generateMetadata` → Supabase | `/app/{slug}` | App screenshot → fallback `/api/og?title=...&creator=...` |
| User profile `/user/[username]` | `generateMetadata` → Supabase | `/user/{username}` | Avatar → fallback `/api/og?tag=BUILDER+PROFILE` |
| Submit `/submit` | Route-level `layout.tsx` | `/submit` | `/api/og?tag=SHIP+IT` |
| Favorites `/favorites` | Route-level `layout.tsx`, `noindex` | — | — |
| Onboarding `/onboarding` | Route-level `layout.tsx`, `noindex` | — | — |
| Reset password `/auth/reset-password` | Route-level `layout.tsx`, `noindex` | — | — |

App detail pages are now emitted as `og:type=article` with `og:site_name=VibeBoard` and `twitter:creator=@{display_name}` when available.

User profile pages use `og:type=profile` and the larger avatar as a square `summary` Twitter card, falling back to a `summary_large_image` branded card when the user has no avatar.

### Sitemap (`app/sitemap.ts`)
- Dynamic Next.js sitemap. Revalidates every 1 hour.
- Always includes `/` and `/submit`.
- Pulls every app slug from Supabase `public.apps` and emits `/app/{slug}` with `lastModified=created_at`, priority 0.8.
- Pulls every user username from `public.users` and emits `/user/{username}`, priority 0.5.
- If Supabase is unreachable at build time, gracefully falls back to just static routes so the build never fails.
- Served at `/sitemap.xml`.

### Robots (`app/robots.ts`)
- Allows `/` to all crawlers.
- Disallows `/api/`, `/auth/`, `/onboarding`, `/favorites`, `/submit` (auth-gated or server-internal).
- Points at `{SITE_URL}/sitemap.xml`.
- Sets `host` hint.
- Served at `/robots.txt`.

### Semantic HTML + alt text
- `<h1>` present on every public page (homepage hero, app detail via `AppHeader`, user profile name, submit header, favorites header, 404). Audit checked `grep '<h1'` across `app/**` and `components/**`.
- All `<Image>` and `<img>` tags audited — 9 occurrences across 7 files, all have `alt` attributes.
- `<article>` wrapper already on app detail page, `<aside>` for vote/favorite side panel, `<section>` for "About this build". No changes needed.
- Keywords meta added at root for classic SEO crawlers.

---

## Mental Twitter share test

Scenario: someone pastes `https://vibe-board-sand.vercel.app/app/nfl-command-center` into an X composer.

1. Twitter's `twitterbot` GET the URL.
2. Page's `generateMetadata` runs server-side — hits Supabase for `title`, `short_description`, `screenshot_urls[0]`, `user.display_name`.
3. Response HTML includes:
   ```
   <meta property="og:type" content="article">
   <meta property="og:site_name" content="VibeBoard">
   <meta property="og:title" content="NFL Command Center · VibeBoard">
   <meta property="og:description" content="Be a GM of an NFL Team">
   <meta property="og:image" content="https://{supabase-project}.supabase.co/storage/v1/.../screenshot.png">
   <meta property="og:image:width" content="1200">
   <meta property="og:image:height" content="630">
   <meta property="og:image:alt" content="NFL Command Center">
   <meta property="og:url" content="https://vibe-board-sand.vercel.app/app/nfl-command-center">
   <meta name="twitter:card" content="summary_large_image">
   <meta name="twitter:title" content="NFL Command Center · VibeBoard">
   <meta name="twitter:description" content="Be a GM of an NFL Team">
   <meta name="twitter:image" content="...screenshot.png">
   <meta name="twitter:creator" content="@Trey Yengo">
   ```
4. Twitter renders a large-image card: screenshot on top, title bold, description, domain stamp.

For apps without a screenshot (rare), the fallback `/api/og?title={title}&description={desc}&creator={display_name}` renders the branded lime-gradient card.

For user profiles like `/user/trey`: `og:type=profile`, avatar (400×400) as `twitter:card=summary`, display name composed with ` · VibeBoard`, bio as description.

---

## Remaining known issues / future work

1. **Google Search Console verification** — add a `google-site-verification` meta tag once you set up a Search Console property for `vibe-board-sand.vercel.app`. Drop it into `app/layout.tsx` `metadata.verification.google`.
2. **Structured data (JSON-LD)** — not added in this pass. Would boost rich results for app detail pages. Good next iteration: emit `SoftwareApplication` schema on `/app/[slug]` with `name`, `description`, `aggregateRating` (derived from vote_count), `author`, `screenshot`.
3. **Submit page OG when shared** — `/submit` is in `disallow` for crawlers because the middleware redirects unauthenticated users to `/`. Social crawlers following a shared submit URL will also get redirected and see homepage OG. If submits need to be share-worthy later, remove the middleware redirect and handle auth inside the page (show a "Sign in to submit" UI).
4. **Tools index page (`/tools`)** — the prompt mentioned auditing this, but no `/tools` route exists in the codebase. The 10 companion tools are deployed as separate Vercel projects with their own metadata, outside the VibeBoard repo. Nothing to audit here.
5. **Sitemap revalidation** — currently 1-hour. If you push many submissions rapidly, Google may see stale sitemap entries. Bump to 10 minutes or add an `on_insert` webhook → `revalidate()` if that becomes a problem.
6. **`NEXT_PUBLIC_SITE_URL` env var** — currently defaults to the Vercel URL. If you add a custom domain (e.g. `vibeboard.com`), set this in Vercel project settings to override everywhere at once: sitemap, robots, canonical, OG URLs.
7. **Canonical for preview deploys** — every preview branch will canonical to the production URL. That's by design (so Google doesn't split ranking across previews), but be aware.
8. **Favicon / app icons** — only `favicon.ico` is declared. Consider adding `apple-touch-icon` (180×180) and a 512×512 PNG for PWA/Android.
9. **`Cache-Control` on `/api/og`** — the edge route doesn't set explicit caching headers. Vercel's default for edge functions is fine but if OG generation becomes a hotspot, set `s-maxage=31536000, stale-while-revalidate`.

---

## Files changed

| File | Action |
|------|--------|
| `app/layout.tsx` | Full metadata rewrite |
| `app/page.tsx` | Added page-level `metadata` export |
| `app/app/[slug]/page.tsx` | Enhanced `generateMetadata` with `type=article`, canonical, fallback OG |
| `app/user/[username]/page.tsx` | Enhanced `generateMetadata` with OG/Twitter + avatar |
| `app/submit/layout.tsx` | **new** — metadata for client-component submit page |
| `app/favorites/layout.tsx` | **new** — metadata + noindex |
| `app/onboarding/layout.tsx` | **new** — metadata + noindex |
| `app/auth/reset-password/layout.tsx` | **new** — metadata + noindex |
| `app/api/og/route.tsx` | **new** — dynamic branded OG image generator |
| `app/sitemap.ts` | **new** — dynamic sitemap from Supabase |
| `app/robots.ts` | **new** — robots.txt with sitemap pointer |
| `seo-audit-summary.md` | **new** — this document |

---

## Verify after deploy

1. `curl https://vibe-board-sand.vercel.app/sitemap.xml` → should return XML with app + user URLs
2. `curl https://vibe-board-sand.vercel.app/robots.txt` → should list disallows + sitemap URL
3. Paste any `/app/[slug]` URL into https://cards-dev.twitter.com/validator → should show large-image card
4. Paste the homepage into https://opengraph.xyz → should show lime-gradient branded card
5. Paste the homepage into https://www.opengraph.xyz (or https://www.linkedin.com/post-inspector/) → ditto
