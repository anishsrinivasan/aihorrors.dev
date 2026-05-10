# Scoring

A candidate that passes the filter and dedup gets a 0–100 score. The score
determines whether the agent drafts and opens a PR, queues for human review,
or silently skips.

## Verdicts

| Verdict | Score range | Action |
|---|---|---|
| `publish` | ≥ `publishThreshold` (60) | Top-N by score get drafted + PR'd |
| `needs_review` | ≥ `reviewThreshold` (50), < 60 | Recorded in state and run summary; no PR |
| `skip` | < 50 | Recorded in state with score notes; no PR |

Thresholds live in `agent/config.ts`. They're calibrated against the
existing 12 posts: every published post in `content/blogs/` should score ≥ 70
when re-evaluated. If a published post scores below 60, the rubric needs
adjustment, not the post.

## Rubric (100 pts total)

| Dimension | Weight | What it rewards |
|---|---|---|
| Severity | 30 | Concrete impact: production outage, data loss, money lost, CVE assigned |
| Specificity | 20 | Named product + identifiable incident date + technical mechanism |
| Credibility | 15 | Where the story is published (tier-A outlet, vendor postmortem, AI Incident DB > forum > random Medium) |
| Novelty | 15 | New attack class or failure mode; penalized when title heavily overlaps existing posts |
| Audience fit | 10 | Has lessons / preventions extractable; technical-audience framing |
| Recency | 10 | Linear decay: full points ≤ 7 days old, zero ≥ 30 days |

The implementation lives in `agent/pipeline/score.ts` as a pure function:

```ts
function scoreCandidate(c: Candidate, knownTitles: string[]): ScoredCandidate
```

All signals are regex-matched against `title + summary`. No LLM call, no
network. This is intentional: scoring runs on every fetched candidate (after
dedup), so it must be cheap and deterministic.

## Why these dimensions, in this order

**Severity (30 pts) — biggest weight.** A reader's "oh no" reaction is what
makes the site work. A $200K crypto drain or a wiped production DB IS the
content. A think-piece about hypothetical AI risk is not.

**Specificity (20 pts).** Generic "AI is dangerous" articles are common and
worthless to us. We need a named product, a date, and a mechanism so the
post is *about* something.

**Credibility (15 pts).** This is a tiebreaker, not a gate. A story from
The Register at 80 pts beats a story from a random Medium at 75 pts, but a
random Medium with novel detail at 85 pts still wins.

**Novelty (15 pts).** Penalizes near-duplicates that survived layer-2/3
dedup (similar titles with different URLs). Also a small bonus for stories
that explicitly claim a new failure class.

**Audience fit (10 pts).** Cheap signal that the article will yield a useful
Lessons/Prevention section. Looks for words like "mitigation", "root cause",
"recommend", and audience markers like "developer", "SRE".

**Recency (10 pts).** Ours is not a breaking-news site, but a 4-month-old
"new" story looks weird. Linear decay handles this gracefully.

## Calibration

When you change the rubric, validate it against existing posts before
shipping:

```bash
cd agent
bun run --print "
  import { loadExistingContent } from './pipeline/existing-content.ts';
  import { scoreCandidate } from './pipeline/score.ts';
  const e = loadExistingContent();
  for (const d of e.rawDocs) {
    const fakeCandidate = {
      url: 'https://example.com',
      canonicalUrl: 'https://example.com',
      urlHash: '',
      title: d.title,
      summary: d.body.slice(0, 800),
      publishedAt: new Date().toISOString(),
      source: 'rss' as const,
    };
    const s = scoreCandidate(fakeCandidate, e.titles.filter(t => t !== d.title));
    console.log(d.slug, s.score.total, s.verdict);
  }
"
```

Every existing post should print `≥ 70 publish`. If one drops below 60,
either the post is genuinely thin (consider unpublishing) or the rubric is
miscalibrated.

## Score breakdown in PR body

Every auto-generated PR includes the breakdown in the body so a human
reviewer can decide quickly:

```
| Dimension | Points |
|---|---|
| Severity | 24 / 30 |
| Specificity | 18 / 20 |
| Credibility | 12 / 15 |
| Novelty | 13 / 15 |
| Audience fit | 8 / 10 |
| Recency | 10 / 10 |
```

If a dimension score looks wrong on a real PR, that's a calibration bug —
file an issue and we'll tune the regexes in `score.ts`.

## What scoring deliberately doesn't do

- **No engagement signals.** We don't weight HN points, Reddit upvotes, or
  Twitter virality. Those are noisy proxies for relevance and easy to game.
- **No keyword-stuffing reward.** Matching all 5 AI-tool names doesn't
  inflate the score; only the *presence* of one named product counts.
- **No author / domain reputation across runs.** Domain credibility is a
  static map. We don't learn from past PR outcomes (yet — see "future
  work" below).

## Future work

1. **LLM-based audience-fit grading** — replace the audience-fit regex with
   a Haiku call that reads the full article and answers "could this support a
   useful Prevention checklist?". Higher signal, ~$0.001 per call.
2. **Outcome feedback loop** — after a PR is merged or closed, record the
   reviewer's decision in `state/seen.json`, then nudge thresholds based on
   precision/recall. Premature for low-volume; revisit at 100+ runs.
3. **Domain reputation learning** — track per-domain `published / submitted`
   ratio, decay over time, use as a credibility multiplier. Same caveat.
