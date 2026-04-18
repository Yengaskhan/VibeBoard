# VibeBoard seed scripts

## `seed-apps.mjs`

Bulk-imports apps from `seed-submissions.md` into Supabase.

### What it does

For every entry in `seed-submissions.md`:

1. **Parses** the name, description, URL, tags, creator handle, source URL.
2. **Fetches the Open Graph image** of the target site (5s timeout, optional `og:image` or `twitter:image` meta tag).
3. **Downloads and uploads** that image to the `screenshots` bucket in Supabase Storage (`seed/<slug>-0.{ext}`) and uses its public URL as the app's first screenshot.
4. **Creates a ghost user** for the creator — a real `auth.users` + `public.users` row using the handle as the username and a synthetic `.invalid` email. This means your feed shows the real creator name (e.g., "Riley Walz") instead of your own account, even though you're the one seeding.
5. **Inserts the app** with a slug derived from the title, a long_description that includes proper attribution, and links to any tags from the allowed list.
6. **Writes an audit log** as `scripts/seed-audit-<timestamp>.json` with what happened for each entry.

The script is **idempotent** — re-running skips any slug that already exists. Ghost users are also deduped by username.

### One-time setup

1. Add your Supabase **service-role key** to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   ```
   Get this from Supabase Dashboard → Project settings → API → `service_role` secret. This key bypasses RLS, which is why we can create ghost users and write on their behalf. **Never commit this key.**

2. Make sure the `screenshots` bucket exists and is public (it should be from the initial SQL setup).

3. `.env.local` should already have `NEXT_PUBLIC_SUPABASE_URL`.

### Running

```bash
# Preview what will be seeded — makes zero DB/storage changes
node scripts/seed-apps.mjs --dry-run

# Seed for real
node scripts/seed-apps.mjs

# Faster seed, skips OG image fetch (useful if your network is slow or many URLs are down)
node scripts/seed-apps.mjs --skip-screenshots
```

### Safety guarantees

- **Idempotent**: re-running the script only inserts missing apps. Existing slugs are logged as `SKIP`.
- **Dry-run**: `--dry-run` does not call any write endpoint on Supabase.
- **No fabrication**: ghost user emails are `.invalid` (an IANA-reserved TLD that cannot resolve) and cannot receive mail. They exist purely for FK purposes.
- **Audit trail**: every run writes a JSON audit log next to the script.
- **Timeouts**: every network request has a 5–8 second timeout to prevent hangs on dead sites.

### Fixing a bad seed

If you seeded something wrong and want to remove it:

```sql
-- In Supabase SQL Editor
delete from public.apps where slug = 'the-bad-slug';
-- Ghost users and tag links cascade automatically.
-- To wipe a ghost user entirely:
delete from auth.users where email = 'rtwlz@vibeboard-seed.invalid';
```

Or to wipe all seeded apps at once:

```sql
delete from public.apps where user_id in (
  select id from auth.users where email like '%@vibeboard-seed.invalid'
);
```
