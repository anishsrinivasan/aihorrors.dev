# Sources

The agent fetches from four source types. Each is implemented as a module in
`agent/sources/` returning `Candidate[]`. Adding a new source = adding a new
file there + wiring it into `index.ts:fetchAll`.

## Tier A — high signal

### Hacker News (`agent/sources/hackernews.ts`)

- **API:** `https://hn.algolia.com/api/v1/search_by_date`
- **Auth:** none
- **Rate limit:** generous (~10K req/hr per IP); we use ~10 queries/run.
- **Why:** HN is the single highest-precision source for the kind of incident
  this site covers. If a postmortem hits the front page, it's almost
  certainly story-worthy.
- **Queries:** ten hand-tuned phrases targeting the failure modes we care
  about (`AI agent deleted`, `prompt injection`, `Cursor production`, etc.).
  Edit `HN_QUERIES` in the source file to expand coverage.
- **Risk:** narrow query coverage. If a new failure mode emerges, we won't
  see it until we add a query. Periodically review what HN top-AI stories
  the agent missed.

### Reddit (`agent/sources/reddit.ts`)

- **API:** `https://www.reddit.com/r/{sub}/new.json`
- **Auth:** none (must send a User-Agent header)
- **Rate limit:** Reddit aggressively returns 429 to default UAs; the
  `config.userAgent` value is set to identify the agent.
- **Subreddits:** `MachineLearning`, `LocalLLaMA`, `OpenAI`, `ClaudeAI`,
  `cybersecurity`, `netsec`, `sysadmin`, `programming`, `selfhosted`.
- **Why:** captures incident reports that haven't crossed over to tech press
  yet. Especially `r/cybersecurity` and `r/sysadmin` for "AI broke our prod"
  stories.
- **Risk:** noise. Reddit posts include a lot of "I asked ChatGPT for X and
  it was wrong" content that doesn't qualify. The keyword filter catches
  most, but borderline noise will reach scoring.

## Tier B — broad coverage

### RSS feeds (`agent/sources/rss.ts`)

Curated list of feeds known to cover AI/security incidents. Each feed is
fetched independently; one being down doesn't affect the others.

| Feed | Why included |
|---|---|
| The Register | Snarky but reliable on AI failures |
| Ars Technica | Deep technical writeups |
| Bleeping Computer | First on most security incidents |
| 404 Media | Tech-investigative; original reporting |
| Krebs on Security | Authoritative on breaches |
| The Hacker News | Volume + breadth on infosec |
| MIT Tech Review | Higher-level industry coverage |
| SlowMist Medium | Crypto-AI postmortems (e.g. the Bankrbot story) |
| AI Incident Database | Pre-curated incidents |

- **Risk:** catalogs / homepage feeds bring in lots of irrelevant headlines.
  Keyword filter does most of the work. If a single feed becomes pure noise,
  remove it from `FEEDS` in the source file.

### Lobsters (`agent/sources/lobsters.ts`)

- **API:** `https://lobste.rs/t/{tag}.json`
- **Tags pulled:** `ai`, `ml`, `security`
- **Why:** small but heavily-curated community. Low volume, high precision.
- **Risk:** sparse signal — sometimes nothing relevant in a 2-week window.

## Tier C — explicitly NOT included

These were considered and rejected for v1:

| Source | Why excluded |
|---|---|
| X / Twitter | Official API requires paid plan; scraping is fragile and high-effort. Better path: humans submit X links to `content/drafts/` and the agent processes those. (Not implemented yet — future work.) |
| Google News | Not free; SERP scraping violates ToS. |
| BingNews API | Free tier has narrow query budget; can revisit. |
| Mastodon | High noise-to-signal ratio for our topic; would need per-instance configs. |

## Adding a new source

```ts
// agent/sources/mything.ts
import { config } from "../config.ts";
import type { Candidate } from "../types.ts";
import { canonicalize, urlHash } from "../lib/canonical-url.ts";

export async function fetchMyThing(sinceTs: number): Promise<Candidate[]> {
  // ... fetch logic
  return [{
    url, canonicalUrl: canonicalize(url), urlHash: urlHash(url),
    title, summary, publishedAt, source: "mything",
  }];
}
```

Then:
1. Add `"mything"` to the `SourceName` union in `agent/types.ts`.
2. Import + wire into `fetchAll()` in `agent/index.ts`.
3. Add credibility scoring rules for the new domain in
   `agent/pipeline/score.ts` if applicable.

## Rate-limit posture

All sources use plain `fetch` with no retry or backoff. If a source returns
non-200, the candidate is skipped and a warning logs. This is acceptable
because:

1. The agent runs once a day. Transient failures self-heal on the next run.
2. Multiple sources cover the same incidents; missing one doesn't lose the
   story, only the headline-of-record.
3. We never paginate, so no cumulative rate burden.
