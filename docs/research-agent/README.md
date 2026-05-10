# Research Agent

A daily background process that finds new AI-incident stories on the open
internet, dedupes them against everything we've already published or have in
review, scores them for relevance, and opens a PR with a draft post for the
highest-scoring candidates.

## Why this exists

aihorrors.dev is a content site. Content velocity is the bottleneck. Most
incidents that fit the site are already covered in tech press, on HN, or in
vendor postmortems within hours of breaking. Manually trawling those sources
is slow and lossy. This agent makes story sourcing a daily, idempotent
operation that the human only steps into at the review-PR stage.

## What it does (one sentence per stage)

1. **Fetch** — pulls candidate articles from Hacker News, Reddit, RSS feeds,
   and Lobsters.
2. **Filter** — keyword-gates to AI + incident terms.
3. **Dedupe** — drops anything we've already seen, already published, or
   already have in an open PR.
4. **Score** — assigns 0–100 across six dimensions and flags publish /
   needs_review / skip.
5. **Draft** — for top candidates, asks Claude to write a story matching our
   in-house style guide, using existing posts as few-shot examples.
6. **PR** — pushes a branch, opens a PR with the draft + score breakdown,
   tagged `auto-generated` so review can be filtered.
7. **Persist** — writes `agent/state/seen.json` so the next run is idempotent.

## What it does NOT do

- It never merges PRs. A human reviews and merges or closes.
- It never modifies existing posts.
- It never publishes more than `config.maxPRsPerRun` (default: 2) per day.
- It backs off entirely when ≥ `config.maxOpenAutoPRs` (default: 5) of its
  own PRs are already open and unreviewed.

## Where things live

```
agent/                           ← the agent (own package.json)
├── index.ts                     ← entrypoint / orchestration
├── config.ts                    ← all knobs (thresholds, models, lookback)
├── types.ts                     ← shared types
├── lib/
│   ├── canonical-url.ts         ← URL normalization + hashing
│   └── state.ts                 ← seen.json read/write
├── sources/                     ← one file per source (HN, Reddit, RSS…)
├── pipeline/                    ← filter → dedupe → score → draft → PR
└── state/seen.json              ← persistent dedup ledger (cached in CI, file locally)

.github/workflows/
└── research-agent.yml           ← daily cron + manual trigger

docs/research-agent/             ← this directory
├── README.md                    ← (this file)
├── architecture.md
├── sources.md
├── dedup.md
├── scoring.md
└── operations.md
```

## Running locally

```bash
cd agent
bun install
OPENROUTER_API_KEY=sk-or-... bun run run:dry    # fetch + filter + score, no PRs
OPENROUTER_API_KEY=sk-or-... bun run run        # full run (opens PRs)
```

Drafting goes through [OpenRouter](https://openrouter.ai) via the Vercel AI
SDK so you can swap models (Claude / GPT / Gemini / DeepSeek / Llama) by
changing one env var — see [operations.md](operations.md#models).

For the full operations playbook (one-time setup, secrets, manual triggers,
backfill, kill-switch), see [operations.md](operations.md).

## Reading order for a new reviewer

1. This file (mental model in 2 minutes)
2. [architecture.md](architecture.md) — how the pipeline flows end to end
3. [scoring.md](scoring.md) — what makes a story score 80 vs 40
4. [dedup.md](dedup.md) — the 3-layer dedup that keeps it from spamming PRs
5. [sources.md](sources.md) — where stories come from and why each was chosen
6. [operations.md](operations.md) — running, debugging, tuning
