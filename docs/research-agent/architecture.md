# Architecture

## Why this lives outside Vercel's build path

The Vercel project for aihorrors.dev runs `bun run build` from the repo root,
which executes `scripts/generate-stories.ts` and Vite. That build only ever
reads from `content/blogs/` and `src/`. It never imports from `agent/`, so the
agent's runtime code and dependencies are not bundled into the deployed site.

Vercel does run `bun install` at the root, which installs the root
`package.json` deps only. The agent's deps live in `agent/package.json` and
are installed independently in the GitHub Actions workflow with
`cd agent && bun install`. **This is intentional**: it keeps the Vercel build
fast and free of the Anthropic SDK / RSS parser / etc. It also keeps the
agent isolated enough that switching to a Turborepo monorepo later (if and
when we add a second deployable) is mechanical: move `agent/` to
`packages/agent/`, set Vercel's Root Directory to `apps/web`, done. The
domain `aihorrors.dev` stays attached to the Vercel project, not to the
directory layout, so this migration is reversible and safe.

## Why this is not a long-running service

A daily cron is the simplest fit for the actual rate of incidents we cover.
Stories that hit on Day 0 still hit on Day 1; missing the first 12 hours of
coverage is fine. Cron-on-GHA gives us:

- Free compute (within Actions free tier)
- Native secret management
- A workflow log per run (free observability)
- A built-in `GITHUB_TOKEN` for PR creation
- A manual trigger (`workflow_dispatch`) that doubles as an integration test

A persistent service would add infrastructure (host, deploy, monitor) for
nothing.

## Pipeline diagram

```
                ┌───────────────────────┐
                │ Source modules         │
                │ (hackernews, reddit,   │
                │  rss, lobsters)        │
                └─────────┬─────────────┘
                          │  Promise.allSettled
                          ▼
                ┌───────────────────────┐
                │ Candidate[]            │
                └─────────┬─────────────┘
                          │  filter.ts
                          ▼
              keyword filter (AI ∧ incident)
                          │
                          ▼
                ┌───────────────────────┐
                │ Layer-1 dedup           │  state/seen.json
                │ Layer-2 dedup           │  content/blogs/*.md
                │ Layer-3 dedup           │  open PRs (gh)
                └─────────┬─────────────┘
                          │
                          ▼
                ┌───────────────────────┐
                │ score.ts                │
                │ → publish / needs_rev / │
                │   skip                  │
                └─────────┬─────────────┘
                          │  top-N
                          ▼
                ┌───────────────────────┐
                │ draft.ts                │  Claude Opus + few-shot
                └─────────┬─────────────┘
                          │
                          ▼
                ┌───────────────────────┐
                │ pr.ts                   │  git + gh
                └─────────┬─────────────┘
                          │
                          ▼
                state/seen.json updated
                summary.md printed
```

## Failure model

Every stage is intentionally permissive about partial failure:

- **Source fails** (rate-limited HN, dead RSS feed): logged via
  `Promise.allSettled`, other sources continue, run completes.
- **Dedup fails** (`gh` auth missing): treated as "no open PRs"; we accept
  the small risk of a duplicate PR rather than skipping the day.
- **Drafting fails** (LLM error, malformed frontmatter): the candidate is
  recorded with `outcome: "errored"` so we don't retry it next run, and the
  next candidate in the top-N is attempted.
- **PR creation fails** (push rejected, branch exists): same — record
  `errored`, move on.

The state file is the single source of truth. As long as it persists, the
agent is idempotent: running it 5 times in a row produces the same outcome
as running it once.

In CI the state file is persisted via `actions/cache` (not committed to
git) because `main` is protected and the workflow can't push directly. The
committed `agent/state/seen.json` only seeds the very first run. See
[dedup.md § Layer 1](dedup.md#layer-1--stateseenjson) for the full
rationale and cache-eviction caveat.

## State machine for a candidate

```
        fetched
           │
           ▼
        filtered ──→  skipped_filter   (recorded only in summary, not state)
           │
           ▼
        deduped ──→  skipped_duplicate (recorded in state)
           │
           ▼
        scored
       /   │   \
      /    │    \
publish needs_  skipped_score
   │    review     │
   │      │        ▼
   │      ▼     (state)
   │  (state)
   ▼
 draft  ──→  errored  ──→ (state)
   │
   ▼
 pr_opened ──→ (state, with pr_number)
```

A `pr_opened` entry is sticky — even if the PR is later closed unmerged, the
agent will not re-suggest the URL. Closing a PR is a permanent rejection.
This is deliberate: the alternative ("retry rejected URLs after N days") adds
complexity we don't yet need, and a human can always re-run the URL through
the agent manually if they change their mind.

## Concurrency

A `concurrency` group in the workflow prevents two scheduled runs from
overlapping. `cancel-in-progress: false` means a manual `workflow_dispatch`
during a scheduled run waits for the scheduled run to finish, rather than
killing it mid-flight (which could leave a half-pushed branch).

## Secret surface

| Secret | Why | Where set |
|---|---|---|
| `OPENROUTER_API_KEY` | drafting + LLM tiebreaker (via Vercel AI SDK) | Repo Actions secrets |
| `GITHUB_TOKEN` | branch push + PR open + label | Provided automatically by Actions |

No other secrets are needed. The agent does not call X/Twitter, paid SERP
APIs, or any service that requires a key beyond OpenRouter.

**Why OpenRouter instead of a direct Anthropic / OpenAI key?** The Vercel AI
SDK (`ai` package) is provider-neutral; pairing it with
`@openrouter/ai-sdk-provider` lets us route drafts through any OpenRouter
model (Claude, GPT, Gemini, DeepSeek, Llama, Mistral…) by changing a single
env var. Unified billing, a single dashboard for usage and observability,
and easy A/B testing of models per run. Adopting Vercel's SDK also keeps the
door open for streaming, structured-output schemas, and tool calling without
swapping libraries later.

Optional GitHub Actions **variables** (not secrets) supported by the workflow:

| Variable | Effect |
|---|---|
| `OPENROUTER_DRAFT_MODEL` | Override the drafting model (default: `anthropic/claude-opus-4`) |
| `OPENROUTER_TIEBREAK_MODEL` | Override the tiebreaker model (default: `anthropic/claude-haiku-4.5`) |

Set these under repo Settings → Secrets and variables → Actions → **Variables**
tab if you want to switch models without editing code.
