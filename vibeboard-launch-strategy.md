# VibeBoard Launch Strategy

Compiled: 2026-04-19
Current state baseline: 11 submissions live; 10 distribution tools built (roast-my-resume, vibe-check, build-next, smooth-operator, what-do-i-eat, judge-my-music, side-project-graveyard, meeting-to-email, am-i-cooked, eli5-this), each on its own Vercel with "Built for VibeBoard" footer and live counter.

This doc is meant to be actionable tomorrow morning. No fluff, no thought-leader abstractions. Tactics only.

---

## 1. The cold start playbook — 11 → 200 in 30 days

**Principle first**: Reddit did 99% of its first month's submissions under fake accounts (Alexis Ohanian publicly admitted this). Product Hunt began as a 300-person email list. You are allowed, in fact *required*, to seed aggressively.

**Target: 200 submissions live by May 19.**

### Week-by-week submission cadence
- Days 1–3: you personally submit 20 apps yourself — all from the Batch 1 + Batch 2 research. Use different angles, different screenshots. Don't pretend to be different accounts — submit as "VibeBoard Staff / Curator" or just your main account. Goal: never have an empty feed page.
- Days 4–10: drop to 5/day self-submits. Start DMing creators of apps you've already featured asking them to claim / improve their listing. Conversion target: 15% of those DMs lead to a signup.
- Days 11–20: 3/day self-submits. First external creators begin submitting their own stuff. Target: 30% of new submissions external.
- Days 21–30: 1/day self-submits (curation polish, not volume). Target: 60%+ external.

That math: 3×20 + 7×5 + 10×3 + 10×1 = 60 + 35 + 30 + 10 = **135 self-submissions**. Add ~65 external and you hit 200.

### Order-of-operations: which types to seed first

1. **Visual apps first.** A grid of feed cards with ugly screenshots kills the first-time user impression more than low volume does. Seed Jmail-suite, Looksmapping, Panama Playlists, walzr portfolio pieces, Vibe Jam games, Corentin Bernadou / Nitish Kumar portfolios — all have strong OG images.
2. **Then the one-liner premises.** Lunches.fyi, Mehran's Steak House, Bop Spotter, Jmail — any app that's fully understood from the title.
3. **Then utility/productivity filler.** My Baby Logger, How Many Layers, PrintPigeon — needed for category breadth even if they don't individually go viral.
4. **Save the heavy hitters for launch week.** gstack, Autoresearch, MenuGen should be the Product Hunt hunt-day top-of-feed picks — not burned in week one.

### Do-not-do
- Do not announce the Reddit-style seeding (Ohanian only admitted it 10+ years later — before that, it was just "a buzzing community"). Post naturally.
- Do not self-submit 50+ in a day. The feed is your product; pacing *is* the product.
- Do not auto-scrape GitHub and dump. Every submission should have a human-written why-it-matters line. That line is your editorial voice.

---

## 2. Twitter/X growth tactics for the AI-builder community

The AI-builder niche on X has a tight, high-engagement core (~5–10k accounts that drive most discussion). Key observations:

- **Hashtags that actually get engagement:** #vibejam, #vibecoding, #buildinpublic, #indiehackers. Do not use #AI (too noisy) or #startup (dead).
- **Timing (Pacific):** weekday Tue–Thu, post between 8:00–10:00 PT for the Karpathy/Levels/YC Twitter overlap. For EU reach, 4:00 PT (= 13:00 CET) works surprisingly well for a secondary spike.
- **Accounts to reply to daily (not cold-DM, *reply*):** @levelsio, @karpathy, @rtwlz, @garrytan, @mattgordonxyz, @scobleizer, @tomasbencko, @rileywalz, @paulg, @dhh, @bramp, @patio11. Replies get 3–5× the impressions of a cold post if the parent post is already moving.
- **Post formats that move on X in 2026:**
  - Single-image "look at this weird app someone built" quote-tweets (best CTR for our content).
  - 4-tweet threads: hook → screenshot → stat → link. Avoid 10+ tweet threads — they underperform on X's current algorithm.
  - Screen-recording loops of <20s, square aspect, no text overlay. X compresses text overlays badly.
- **Volume:** 3 posts/day minimum for the first 30 days — 1 original, 1 featured-app quote-tweet from VibeBoard, 1 reply thread in the niche.

---

## 3. Content angles that work (with copy-paste templates)

### Angle A — "weird one-person app of the day"
> someone built [X]. one person. one weekend. it's live right now.
>
> [screenshot]
>
> submit yours: vibeboard.com

### Angle B — "Vibe Jam entry spotlight"
> [Creator] shipped this for the 2026 Vibe Jam.
>
> [30-sec loop]
>
> it's so good. full feed of jam entries: vibeboard.com/tag/game

### Angle C — "creator milestone" (after signup)
> [Creator] just listed their [app name] on VibeBoard.
> if you liked [comparable-known-app], you'll like this.
>
> [OG image]
>
> [link]

### Angle D — "curated round-up" (weekly, Sundays PT)
> this week on VibeBoard:
> 1. [app] — [one-liner]
> 2. [app] — [one-liner]
> 3. [app] — [one-liner]
> 4. [app] — [one-liner]
> 5. [app] — [one-liner]
>
> vibeboard.com

### Angle E — "nostalgia / canon" thread
> a short history of one-person apps that changed the internet:
> - 2008: Kogan.com
> - 2014: Nomad List (spreadsheet first)
> - 2024: IMG_0001, Bop Spotter
> - 2025: Jmail (5 hours, 18.4M visits by month's end)
> - 2026: [list from VibeBoard top-ranked this month]
>
> VibeBoard is where they live now.

Rotate A–E. Never repeat the same format two days in a row.

---

## 4. How to leverage the 10 distribution tools

Each tool is a free utility with organic traffic (ChatGPT-referral, Google, Twitter virality). Every visitor is a potential VibeBoard user. The tactic: **convert visit intent to explore intent**, then to submit intent.

### Specific per-tool plays

- **roast-my-resume** — On result page, CTA: "Looking for jobs at other solo dev shops? Browse what indie creators are building → VibeBoard." Cross-promote to any `productivity` / `developer-tool` tagged featured apps.
- **vibe-check** — After the vibe result, show "other weekend-vibed apps" grid of 4 VibeBoard cards, tag-matched to the user's vibe input.
- **build-next** — After suggesting what to build next, append "while you're thinking, here's what people just shipped: [3 latest VibeBoard submissions]." Highest-intent funnel — user is already in a builder mindset.
- **smooth-operator** — In the output, "share" button that *also* says "add your tool to VibeBoard" underneath. Low-conversion but free brand surface.
- **what-do-i-eat** — Lowest-intent overlap. Strategy: just the footer link, don't force the CTA. But capture email for a "weekly new tools" digest.
- **judge-my-music** — After the judgment, "hear what indie devs are listening to" tie-in is weak. Instead: "feeling judged? come build something better → VibeBoard."
- **side-project-graveyard** — *highest converter on paper.* People visit this tool when they're in an existential mood about their abandoned projects. CTA: "revive one and ship it — VibeBoard features projects that got to v1.0, no matter how messy."
- **meeting-to-email** — professional audience. CTA: "built this in a weekend — see 200 others like it → VibeBoard."
- **am-i-cooked** — for job-market anxious users. CTA: "not cooked. people are still shipping things. here are 5 from this week → VibeBoard."
- **eli5-this** — pure-utility users. On-result CTA: "know a builder who'd love this? send them VibeBoard."

### Shared mechanics across all 10 tools
- A running live counter in the footer: "X tools currently featured on VibeBoard." Counter should tick visibly. This is psychological — it converts curiosity into a click.
- Every OG image auto-generated when a tool has a result page should have a subtle "VibeBoard" watermark bottom-right.
- Email capture on each tool offering "Top 5 new tools this week" newsletter → nurture funnel to VibeBoard.

### Aggregate target
If all 10 tools average 200 visits/day by month-end (realistic for free, referenceable utilities), that's 60k touchpoints/month. At a 3% CTR to VibeBoard (realistic for footer links with decent copy) = 1,800 qualified visits/month from your own tool network. At 5% signup-from-visit = 90 signups. Plus 3% submission-from-signup = ~3 organic submissions/month from this channel alone. Small but free and compounding.

---

## 5. Outreach scripts

### 5a. DM to a creator whose app you just featured (warm)

> Hey [Name] — featured [app] on VibeBoard today, it's one of the best [tag] things shipped this [month/quarter]. No action needed from you, just a heads-up. If you'd ever like to claim the listing and add more context (creator handle, longer description), link's here: [URL]. Cheers.

Follow-up after 4 days if no reply:
> hey! [app] is doing well on the feed — #[rank] this week in [tag]. claim it whenever, no rush.

### 5b. DM to a friend you want to sign up

> could you take 60 sec to check this out: vibeboard.com/[their likely tag]. Just trying to get real eyes on the feed this week — tell me one thing that's broken or ugly and I'll owe you a coffee.

### 5c. Top-tier builder (Levelsio / Karpathy / Hoover / Scoble tier)

Do *not* cold DM. Instead, do this, in order:
1. Reply thoughtfully to 5 of their tweets over 2 weeks with substance (no "great thread!").
2. Feature one of their existing projects on VibeBoard and quote-tweet them when you post the featured card.
3. Only then, DM:
> hey [handle] — been featuring your stuff on VibeBoard (vibeboard.com/[slug]). the feed is going to be the canonical home for one-person apps. I'd love your honest 2-sentence take on whether the curation is the right vibe. no launch-promo ask.

Give them an opinion lane, not a favor lane. Builders answer opinion questions.

### 5d. Reaching out to a related community (r/vibecoding mod, Uneed, Indie Hackers)

> running a new curated feed for one-person AI-built apps — vibeboard.com. Not selling anything, but your community has exactly the audience that would both post and consume. happy to do a Q&A / AMA / cross-submission week with you. What format works for you?

Always offer value (AMA, data share, cross-post) before asking for audience access.

---

## 6. Product Hunt launch strategy

### Timing
- **Launch day: a Tuesday.** Tuesday–Thursday are the top-performing days; Monday is brutal for solo makers, Friday–Sunday have lower voter volume.
- **PT offset:** schedule the listing to go live at 12:01 AM PT. The PH "day" resets midnight PT; you want the maximum number of hours on page 1.
- **Month:** June 2026. Gives you ~6 weeks from now to accumulate ~150 submissions on the site, so the feed looks real on launch day. Avoid launching on a week where a mega-product (OpenAI, Anthropic, Linear) is launching.

### Pre-launch prep (4 weeks out)
1. Build a hunter list: everyone you've featured + their handles + a 1-line ask drafted for each.
2. Pre-register a Product Hunt "upcoming" page ~2 weeks before to collect email commitments.
3. Build one *killer* demo video (<45s): fast cuts of the feed, a vote animation, an OG image rendering live. No voiceover needed. Ship the `.mov` in four sizes (1080, 720, square, vertical).
4. Prepare the asset pack: PH header (240×240 icon, 1270×760 gallery images × 4, a GIF loop), an OG image, a 280-char launch post, a 4-tweet thread, a 2-paragraph email for newsletters.

### Launch day
- **Who hunts**: ideally a builder with >2k PH followers. Second best: you yourself, if you've been active on PH for 3+ months (start commenting now). Do not use a hunter service — they're cooked.
- **First 4 hours**: you, your co-founder (if any), and 10 pre-briefed friends vote/comment by 8 AM PT. Comments are more valuable than votes for the algorithm.
- **12 PM PT**: post the "we're live" tweet thread (angle D from §3). Pin it.
- **5 PM PT**: if you're in the top 10, do a reply push: quote every product above you on the leaderboard with a nice comment. Cross-traffic is real.
- **Never ask for "votes."** Ask for "feedback" or "thoughts." Explicit vote-ask gets you flagged.

### Post-launch
- Winner-of-the-day badge on VibeBoard for 30 days if you rank.
- Email every newsletter you planned for the day after, not the day of (they won't click on launch-day noise).

---

## 7. Viral mechanics inside VibeBoard

Already-built (per your brief):
- ✅ Post-to-X buttons on vote and submit actions.
- ✅ Live counters (visible on the homepage).
- ✅ OG images on detail pages.

What's missing / should be shipped before launch:

### Must-have (ship in next 2 weeks)
1. **Referral-via-share mechanic**: when a logged-in user posts a vote to X, append `?via=[username]` to the shared URL. Award the sharer a visible "early curator" badge after 3 people sign up through their links. Public badge on their profile = flex.
2. **Weekly "top 5" auto-generated OG image**: every Monday, generate an image collage of last week's top 5 cards. Tweet it from @VibeBoard. This is the most-screenshottable weekly asset.
3. **Embeddable "latest 5" widget**: a 1-line `<script>` snippet creators can paste on their own landing pages to show live VibeBoard picks. Free distribution in the creator network.
4. **"Built on VibeBoard" badge** (SVG + link) that featured creators can put in their own sites' footers. Same mechanic Netlify and Vercel use. Compounds over time.
5. **Screenshotable "rank card"**: a one-click "share my rank" button on creator profiles (e.g. "#3 in productivity this week"). These become Twitter-shared social proof.

### Nice-to-have (ship in weeks 3–6)
6. Daily email digest (opt-in): top 3 apps of the day with OG images inline. Higher-intent than social.
7. RSS feed: low-priority today but developers will notice if missing.
8. "Feature-with-me" request: creators can submit a feature draft, you approve — editorial workflow that scales your curation voice.
9. Hover-play videos on feed cards: if a card has a screen-recording uploaded, autoplay muted on hover. 2–3× the engagement per card in similar feed apps.

### Explicitly don't do
- Don't build a commenting system on the feed yet. Moderation cost is way worse than the engagement gain in the first 90 days.
- Don't open DMs between users. Too early.
- Don't do Stripe gating for extra features. You have no leverage yet; the product is the feed.

---

## 8. The first 30 days: week-by-week

### Week 1 (Apr 20–26): Fill the Feed
- **Mon:** 6 self-submissions from Batch 1 (heaviest-OG picks). Post Angle A. Send 10 "warm DM" messages (§5a).
- **Tue:** 6 submissions. Angle A again with different app. Start daily reply ritual on 5 target accounts.
- **Wed:** 6 submissions. Post Angle E nostalgia thread. DM 5 peers.
- **Thu:** 6 submissions. Ship referral-via-share mechanic (#1 above).
- **Fri:** 6 submissions. Weekly retro post on X: "shipped this week."
- **Sat–Sun:** light day. 2 submissions/day. Engage in replies only. Draft next week's content.

End of week 1: **38 live submissions**, 500+ Twitter impressions/day baseline.

### Week 2 (Apr 27 – May 3): Community Seeding
- 5 self-submissions/day (28 for the week).
- Launch on Uneed (not PH yet — save that). Refetch. Indie Hackers post.
- Ship "top 5" weekly OG image (#2).
- Post weekly round-up Sunday PT (Angle D).
- Outreach to 2 micro-newsletter operators (InfoProducts, Ben's Bites, Byrne's newsletter) offering them a data pull or guest section.

End of week 2: **66 submissions**, 1k+ signups (stretch goal 300), first outside submissions.

### Week 3 (May 4–10): External Voice
- 3/day self-submissions (21 for the week).
- Ship embeddable widget + "Built on VibeBoard" badge (#3, #4).
- Pitch one podcast (Cheeky Pint, My First Million, Default Alive, Indie Hackers podcast — any one).
- Do a cross-post week with r/vibecoding or Indie Hackers.

End of week 3: **87 submissions**, first real organic Twitter traffic.

### Week 4 (May 11–17): Viral Mechanic Stress Test
- 1–2/day self (10 for the week).
- Ship rank-card share (#5) + daily email digest (#6).
- PH upcoming page goes live for the June launch.
- Outreach to Top-tier builders (§5c).

End of week 4: **97+ submissions**, momentum carrying into Month 2.

### Days 28–30: pause, audit, polish
- Fix any churn hotspots.
- Redesign any feed card style that's been screenshotted and hasn't landed.
- Finalize PH assets.

---

## 9. Key metrics and targets

Measure weekly, not daily, to resist vanity noise.

| Metric | Month 1 target | Stretch |
|---|---|---|
| Total submissions live | 200 | 300 |
| % of submissions from external creators (by M1 end) | 25% | 45% |
| Unique signups (accounts) | 1,500 | 3,000 |
| Daily active users (logged-in, last 7 days) | 150 | 300 |
| Return-user ratio (2+ sessions in a week) | 25% | 40% |
| Share-button click-through rate (vote-share) | 8% | 15% |
| X impressions/day from @vibeboard | 3,000 | 10,000 |
| Inbound referrals from the 10 tools | 1,500/mo | 4,000/mo |
| PH launch leaderboard placement (Month 2) | Top 10 of day | Top 3 of day |
| New submissions/day, last 7 days of Month 1 | 4 | 10 |

The single most important metric: **new external submissions per week**. If that line is flat on week 4, the flywheel isn't catching. Change the curation voice and the referral copy before changing anything else.

---

## 10. Common mistakes indie platforms make

1. **Launching empty.** Digg shipped with a live but bare front page and never recovered in the first 8 weeks. *Fix:* seed aggressively, do not announce you seeded.

2. **Over-optimizing the submission flow too early.** Every indie platform I see builds auto-scraping, AI-auto-tag, submission preview before they have anyone to submit. *Fix:* your form can be Google Forms for the first 200 submissions. No one will notice.

3. **Under-curating.** Early Quibb, early Haven.money, dozens of tool-directory sites died because they accepted everything and the feed felt like a dump. *Fix:* reject 20% of submissions in week 1. Email a kind rejection with what would change your mind. Curation *is* the product.

4. **Ignoring the social graph.** Dribbble's invite-only model was half the game (Cederholm and Thornett sent t-shirts with handwritten codes to 100 designers — those designers became evangelists). *Fix:* don't literally copy invite-only, but keep "Submit with invite code" as a latent feature for later. Early creators want the feeling of being part of something small.

5. **Building comments / social / messaging too early.** Launchrock had a social layer that killed moderation bandwidth. So did Geeklist. *Fix:* no user-to-user surface area until month 4.

6. **Relying on Product Hunt for the launch.** Multiple platforms (Hunted.space, TinyProducts) treated PH day as the whole strategy and cratered the day after. *Fix:* PH is one day. The Twitter presence you built for 6 weeks is what holds when the spike dies.

7. **Chasing too many categories.** Panda, Side, Produx, HackerNews clones all died trying to be the-whole-web-for-a-small-niche. *Fix:* your niche is "one-person, AI-built, live, publicly accessible." Stay there for 12 months. Any app that doesn't fit is a firm reject.

8. **Under-using yourself as the personality.** The best curator-as-personality examples (Benedict Evans, Casey Newton, Nathan Baschez) are why their platforms have oxygen. *Fix:* put a face on VibeBoard. The X account needs opinions, not reposts. An anonymous branded account will plateau at ~2k followers.

9. **Slow iteration on the first-time user experience.** Newgrounds' Tom Fulp rebuilt the front end constantly in the portal's first 6 months. *Fix:* weekly UX pass on the home page. Something changes every week for the first 12 weeks — the returning user notices and re-explores.

10. **Not shipping the artifact-share mechanic in month 1.** Every shareable loop (the screenshotable "top 5" card, the embeddable widget, the badge) compounds. Most indie platforms ship these in month 3+, which means they miss 2 months of free compounding distribution. *Fix:* ship referral-via-share, top-5 weekly image, and the creator badge before you ship anything else fancy.

---

## closing

The honest read is this: you have 11 submissions and 10 working distribution tools with "Built for VibeBoard" footer links. That is a *strong* starting point — most solo indie platforms launch with neither. If you execute the Week 1 + Week 2 playbook above, you'll be at ~66 submissions by May 3 and a real-looking feed.

The single highest-leverage thing tomorrow morning: ship **one** of the "must-have" viral mechanics in §7 (the referral-via-share is the easiest) so that every subsequent X share you do this month is quietly building a compounding referral graph. Everything else can run behind that.
