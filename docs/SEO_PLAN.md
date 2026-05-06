# SEO Implementation Plan — aihorrors.dev

**Audit date:** 2026-05-06
**Current SEO Health Score:** 62 / 100
**Target after Phase 1 + 2:** 88 / 100

This plan is the actionable companion to the audit. Each task lists: the change, the files touched, acceptance criteria, and an estimate. Tasks are grouped by phase so we can ship in safe, reviewable batches.

---

## Phase 0 — Decisions (locked 2026-05-06)

| # | Decision | Choice | Notes |
|---|---|---|---|
| D1 | Primary host | **`aihorrors.dev`** (apex) — redirect `www.aihorrors.dev` → `aihorrors.dev` | Code already aligns. Vercel dashboard: set `aihorrors.dev` as primary domain so the current 307 redirect direction matches our canonical signal. |
| D2 | Author attribution | **`AI HORRORS`** as `Organization` author with `url: https://aihorrors.dev` | Site/brand is the publisher — no personal name, no bot moniker. Matches the brand wordmark. |
| D3 | Per-story OG images | **Yes — `@vercel/og` at build time, with hash-based cache** | Cache keyed on `title \| excerpt \| severity \| tags` so images regenerate only when the inputs change. Cache path: `node_modules/.cache/og/[slug].{png,hash}` (Vercel auto-persists this dir between deploys). |
| D4 | RSS feed | **Full content** | Phase 3 task. |
| D5 | Tag archive pages | **Deferred** | Not in current scope. |
| D6 | Sources field on stories | **Skipped** | Essential fixes only. |
| D7 | Related stories block | **Deferred** | Essential fixes only. |
| D8 | Self-host fonts | **Deferred** | Per user — skip for now. |

**Active scope:** Phase 1 (all), Phase 2 (2.1–2.5, skipping 2.6), Phase 3 (3.1 OG images + 3.3 RSS only).

---

## Phase 1 — Critical fixes (target: 1 day)

Goal: stop actively bleeding signal. Nothing here is risky.

### 1.1 Add `robots.txt`
- **File:** `public/robots.txt` (new)
- **Content:** allow all, point to sitemap on the chosen primary host
- **Acceptance:** `curl https://aihorrors.dev/robots.txt` returns 200 with valid directives
- **Estimate:** 5 min

### 1.2 Fix severity badge bug
- **File:** `src/routes/story.$slug.tsx:82`
- **Change:** `{config.badge}` → `{config.label}` (the `severityConfig` object has `label`, not `badge`)
- **Acceptance:** rendered story HTML shows `CRITICAL` / `HIGH` / `MEDIUM` text inside the badge instead of an empty `<span></span>`
- **Estimate:** 2 min

### 1.3 Resolve www / non-www canonical mismatch
- **Decision dependency:** D1
- **If keeping non-www (recommended):**
  - In Vercel project settings, set `aihorrors.dev` as primary domain and `www.aihorrors.dev` as redirect (or remove the www redirect entirely if it's not needed)
  - No code change — `SITE_URL` in `scripts/ssr-prerender.tsx:19` already points to `https://aihorrors.dev`
- **If switching to www:**
  - Update `SITE_URL` in `scripts/ssr-prerender.tsx:19` to `https://www.aihorrors.dev`
  - Update all hardcoded `aihorrors.dev` references in the same file
- **Acceptance:** `curl -I https://aihorrors.dev/` returns 200 (not 307); canonical and og:url match the served URL exactly
- **Estimate:** 15 min

### 1.4 Generate `sitemap.xml` at build time
- **File:** `scripts/ssr-prerender.tsx` — extend to also write `dist/sitemap.xml`
- **Content:** entries for `/`, `/contribute`, and `/story/:slug` for every story
- **Lastmod:** drive from frontmatter `date`; for `/` and `/contribute` use the most recent story date
- **Priority:** `/` → 1.0, `/story/*` → 0.8, `/contribute` → 0.5
- **Changefreq:** `/` → daily, others → monthly
- **Acceptance:** `curl https://aihorrors.dev/sitemap.xml` returns valid XML; passes `https://www.xml-sitemaps.com/validate-xml-sitemap.html`
- **Estimate:** 45 min

### 1.5 Clean up stale `dist/` in repo
- **File:** `.gitignore` — add `dist/`
- **Action:** `git rm -r --cached dist/` then commit
- **Acceptance:** `dist/` no longer tracked; Vercel builds still produce it
- **Estimate:** 5 min

**Phase 1 total: ~1.5 hours of work.** After deploy, request reindex in Search Console.

---

## Phase 2 — High-impact fixes (target: 2-3 days)

Goal: unlock rich results, AI citations, and crawler trust.

### 2.1 Inject JSON-LD structured data per route
- **File:** `scripts/ssr-prerender.tsx`
- **Change:** for each route, build a schema object and inject `<script type="application/ld+json">` before `</head>`

**Homepage schemas:**
- `WebSite` with `potentialAction: SearchAction` (even though search isn't built — Google uses this for sitelinks searchbox)
- `Organization` with `founder: Person(Anish Srinivasan)`, `sameAs: [GitHub, Twitter]`, `logo`

**Story page schemas:**
- `Article` with: `headline`, `datePublished` (frontmatter `date`), `dateModified` (same unless we add it), `author: Person(Anish Srinivasan)` (or whatever D2 lands on), `image` (per-story OG once 2.4 lands; `og.png` as interim), `articleSection: 'AI Incidents'`, `keywords` (frontmatter `tags` joined), `mainEntityOfPage`
- `BreadcrumbList`: Home → Story title

**Acceptance:**
- Each rendered HTML file contains valid JSON-LD
- Passes `https://validator.schema.org/`
- Passes Google Rich Results Test for at least Article on a story page
- **Estimate:** 2 hr

### 2.2 Fix `og:type` and add article-specific meta on story pages
- **File:** `scripts/ssr-prerender.tsx`
- **Change:** for story routes only, set:
  - `og:type` → `article`
  - `article:published_time` → frontmatter date (ISO 8601)
  - `article:modified_time` → same (until we track edits)
  - `article:author` → "Anish Srinivasan"
  - `article:section` → "AI Incidents"
  - `article:tag` → one tag per `<meta>` (multiple meta tags)
- **Acceptance:** LinkedIn Post Inspector and Twitter Card validator render the story as an article preview with author + date
- **Estimate:** 30 min

### 2.3 Dedupe `<h1>` tags — one per page
- **File:** `src/routes/__root.tsx:46`
- **Change:** convert `<h1 className="font-display ...">AI HORRORS</h1>` (logo) to `<span>` with the same Tailwind classes (or `<p>` if you want a block element). The site title in the logo doesn't need to be `<h1>` on every page.
- **Verify:** homepage hero in `src/routes/index.tsx` keeps its `<h1>`; story pages keep `<h1>{story.title}` in `src/routes/story.$slug.tsx:104`; contribute page keeps its content `<h1>`
- **Acceptance:** every rendered HTML has exactly one `<h1>`
- **Estimate:** 15 min

### 2.4 Add `AI HORRORS` (brand) as author (schema only, no UI changes)
- **Decision dependency:** D2 (locked: brand-as-author)
- **Scope:** schema + meta only — no frontmatter changes, no byline UI, no sources field
- **Files:**
  - `scripts/ssr-prerender.tsx` — emit `author: { "@type": "Organization", "name": "AI HORRORS", "url": "https://aihorrors.dev" }` in Article JSON-LD
  - Same file — set `<meta name="author" content="AI HORRORS">` and `<meta property="article:author" content="AI HORRORS">` for story routes
- **Acceptance:** Article schema validates with `author` populated; meta author tags present on story pages
- **Estimate:** 15 min

### 2.5 Rewrite homepage meta description
- **Files:** `index.html:8`, `index.html:10`, `index.html:19`, and the matching `routes[0].meta.description` in `scripts/ssr-prerender.tsx:30`
- **New copy (proposal — confirm or rewrite):**
  > "Real AI disasters from production: Cursor deleting databases in 9 seconds, Replit wiping prod, Antigravity nuking entire drives. Community-curated cautionary tales for engineers shipping AI."
  > (148 chars — within Google's ~155 char display limit)
- **Acceptance:** description renders in SERP preview tools without truncation
- **Estimate:** 10 min

### 2.6 Add "Related stories" block to story pages — **DEFERRED (D7)**

**Phase 2 active total: ~3.5 hours.**

---

## Phase 3 — Medium-impact (target: week 2)

### 3.1 Per-story OG images at build time (with cache)
- **Decision dependency:** D3 (locked: `@vercel/og` + hash-based cache)
- **Approach:**
  - New script `scripts/generate-og-images.tsx` runs after `generate-stories.ts`, before `ssr-prerender.tsx`
  - **Cache key per story:** `sha1(title | excerpt | severity | tags.join(','))`
  - **Cache layout:** `node_modules/.cache/og/[slug].png` and `node_modules/.cache/og/[slug].hash` — Vercel auto-persists `node_modules/.cache/` across builds, so unchanged stories skip regeneration
  - **Font:** Archivo Black TTF fetched from Google Fonts on first build, cached at `node_modules/.cache/og/font.ttf`
  - For each story: hash inputs → if hash matches cache, copy cached PNG to `dist/og/[slug].png` → otherwise render JSX (brand bg, title auto-sized, severity badge, AI HORRORS wordmark) and write both `dist/og/` and cache
  - Update `ssr-prerender.tsx` to set `og:image` to `/og/[slug].png` on story routes; falls back to `/og.png` for `/` and `/contribute`
- **Acceptance:** rebuilding without changes regenerates 0 images; editing a frontmatter field regenerates only that story's image; Twitter Card validator shows unique imagery per story
- **Estimate:** 3 hr

### 3.2 Add `/llms.txt`
- **File:** `public/llms.txt` (new) — but generated at build time so it stays current
- **Generator:** add to `ssr-prerender.tsx` — produces a markdown file following the [llmstxt.org](https://llmstxt.org/) spec:
  ```
  # AI Horrors
  > Community-curated archive of real AI production disasters with timelines, root causes, and lessons.

  ## Stories
  - [Cursor AI Agent Deletes Production Database in 9 Seconds](https://aihorrors.dev/story/cursor-deletes-production-database): Railway API token misuse wipes prod DB and backups in 9s.
  - ...
  ```
- **Optional:** also generate `llms-full.txt` with full story content concatenated
- **Acceptance:** file exists, references every story, parses as valid markdown
- **Estimate:** 30 min

### 3.3 RSS feed
- **Decision dependency:** D4
- **File:** new generator step in `ssr-prerender.tsx` writing `dist/feed.xml` (RSS 2.0)
- **HTML link:** add `<link rel="alternate" type="application/rss+xml" title="AI HORRORS" href="/feed.xml">` to `index.html` and the prerender template
- **Items:** every story, newest first, full content
- **Acceptance:** validates at `https://validator.w3.org/feed/`
- **Estimate:** 1 hr

### 3.4 Real 404 instead of redirect — **DEFERRED (out of essential scope)**
- **Files:**
  - `src/routes/story.$slug.tsx:12` — replace `redirect({ to: '/' })` with `throw notFound()`
  - `src/routes/__root.tsx` — add `notFoundComponent` returning a real 404 UI with link home
  - `vercel.json` — verify SPA fallback still works for known routes; ensure unknown routes serve a 404 status (may need a custom Vercel 404 config or middleware)
- **Acceptance:** `curl -I https://aihorrors.dev/story/does-not-exist` returns 404 status, not 200
- **Estimate:** 1 hr

### 3.5 Self-host Google Fonts
- **Files:** `index.html:22-24`, `src/index.css`
- **Action:** download Space Mono + Archivo Black WOFF2 files into `public/fonts/`, replace the Google Fonts `<link>` with local `@font-face` declarations using `font-display: swap`
- **Benefit:** removes 2 cross-origin handshakes from the critical path; no privacy implications either
- **Acceptance:** Lighthouse "Avoid chaining critical requests" warning drops; fonts still render
- **Estimate:** 45 min

**Phase 3 total: ~6 hours.**

---

## Phase 4 — Lower-priority polish (backlog)

- **4.1** Add `<meta name="robots" content="max-image-preview:large">` and `<meta name="theme-color" content="#0a0a0a">` in `index.html` and prerender template (10 min)
- **4.2** Tag archive pages `/tags/:tag` — only ship for tags with ≥3 stories; pre-render at build (decision deferred per D5)
- **4.3** Add `<noscript>` fallback inside `<body>` linking to GitHub repo + plain-text story listing (15 min)
- **4.4** Add `dateModified` tracking — store last-edit timestamp per story (e.g. via `git log -1 --format=%aI <file>` in the generate script) (30 min)
- **4.5** Search functionality — would unlock real SearchAction schema use; significant feature, separate decision

---

## Summary table

| Phase | Tasks | Effort | New score est. |
|---|---|---|---|
| 1 — Critical | robots, sitemap, badge bug, host alignment, .gitignore | ~1.5 hr | 62 → 75 |
| 2 — High | JSON-LD, og:type, h1 dedupe, author/sources, home meta, related | ~6 hr | 75 → 88 |
| 3 — Medium | per-story OG, llms.txt, RSS, real 404, self-host fonts | ~6 hr | 88 → 94 |
| 4 — Polish | misc meta, tag pages, noscript, dateModified | as needed | 94 → 96+ |

---

## Delivery (revised 2026-05-06)

- **Single PR** containing all in-scope tasks (Phases 1, 2 sans 2.6, 3.1, 3.3)
- **Branch:** `seo/essential-fixes`
- **No commits** — assistant stops at file changes; user reviews locally and pushes
- **Manual step (Vercel dashboard):** set `aihorrors.dev` as the primary domain so `www` redirects to apex (matches our canonicals)
