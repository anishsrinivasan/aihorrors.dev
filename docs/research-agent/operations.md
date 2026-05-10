# Operations

How to set up, run, debug, and tune the research agent.

## One-time setup

### 1. Add `OPENROUTER_API_KEY` to repo secrets

```
GitHub → repo settings → Secrets and variables → Actions → New repository secret
Name:  OPENROUTER_API_KEY
Value: sk-or-v1-...
```

Get the key from https://openrouter.ai/keys. Add credit at
https://openrouter.ai/credits — a few dollars covers many months at the
default 2 PRs/day cap.

The workflow uses the built-in `GITHUB_TOKEN` for branch push + PR creation,
so no other secrets are required.

**Optional model overrides** (set under Variables, not Secrets — these are
not sensitive):

| Variable | Default | Notes |
|---|---|---|
| `OPENROUTER_DRAFT_MODEL` | `anthropic/claude-opus-4` | Used for the long draft generation |
| `OPENROUTER_TIEBREAK_MODEL` | `anthropic/claude-haiku-4.5` | Used by the v2 LLM dedup tiebreaker |

Browse OpenRouter's catalog at https://openrouter.ai/models for current IDs
(e.g. `openai/gpt-4o`, `google/gemini-2.5-pro`, `deepseek/deepseek-chat`).

### 2. Create the `auto-generated` label

Visible filter for auto-PRs in review queues:

```bash
gh label create auto-generated --color "ededed" --description "Opened by the research agent"
```

### 3. (Optional) Enable required-reviews on `main`

Recommended — auto-PRs should not auto-merge. Settings → Branches →
Branch protection rules → `main` → require pull request review before
merging.

### 4. First run (manual, dry)

```
GitHub → Actions → research-agent → Run workflow → dry_run = true
```

Check the run logs:

- Should fetch ~50–200 candidates total
- Should drop most to keyword filter (this is normal)
- Should drop the rest to dedup (since all current blogs are already known)
- Should report 0 PRs opened (dry run)

If anything errors, check the workflow log under the failing step. Common
first-run issues:

- `gh: not found` → the workflow uses `setup-bun` only; `gh` is preinstalled
  on `ubuntu-latest` runners, but if you change runners, add a setup step.
- `OPENROUTER_API_KEY not set` → secret not added to repo.
- `Insufficient credits` from OpenRouter (`AI_APICallError: This request requires more credits, or fewer max_tokens`) → top up at https://openrouter.ai/credits, **or** lower the cost-of-failure by switching to a cheaper model (`OPENROUTER_DRAFT_MODEL=anthropic/claude-haiku-4.5`). Note: OpenRouter checks balance against the *requested* `max_tokens` ceiling, not actual usage — a $1 balance won't run Opus at the agent's 4000-token cap, but will run Haiku comfortably.

### 5. First real run

Same path as above, with `dry_run = false`. Expect 0–2 PRs to be opened.

### Manual-trigger inputs

`workflow_dispatch` supports three inputs that override default behavior for
a single run (none affect the daily cron):

| Input | Type | Default | Effect |
|---|---|---|---|
| `dry_run` | boolean | `false` | Fetch + filter + score, but do not open PRs or mutate state. Useful for testing source/scoring changes. |
| `force_run` | boolean | `false` | Bypass the `maxOpenAutoPRs` backoff. Use when there's a review backlog you intend to ignore (e.g. "I closed those PRs and want to re-run today"). Threshold and dedup are still enforced. |
| `model` | string | `""` | Override `OPENROUTER_DRAFT_MODEL` for this run only (e.g. `anthropic/claude-haiku-4.5` to test a cheaper model without changing the repo variable). |

Example: re-run the agent with Haiku and ignore the backoff:

```
GitHub → Actions → research-agent → Run workflow
  dry_run:    false
  force_run:  true
  model:      anthropic/claude-haiku-4.5
```

Locally the same overrides work as env vars:

```bash
FORCE_RUN=1 OPENROUTER_DRAFT_MODEL=anthropic/claude-haiku-4.5 bun run run
```

## Running locally

```bash
cd agent
bun install
OPENROUTER_API_KEY=sk-or-v1-... bun run run:dry
```

Local runs use your authenticated `gh` CLI (`gh auth status`) for PR queries
and creation. If you don't want a local run to actually push branches, keep
`DRY_RUN=1`.

To test a single source:

```ts
// agent/scratch.ts
import { fetchHackerNews } from "./sources/hackernews.ts";
const since = Math.floor(Date.now() / 1000) - 14 * 86400;
console.log(await fetchHackerNews(since));
```

```
bun run scratch.ts
```

## Tuning knobs

All in `agent/config.ts`:

| Knob | Default | When to change |
|---|---|---|
| `lookbackDays` | 14 | Increase if you re-enable a previously-disabled source and want to backfill |
| `publishThreshold` | 60 | Raise if review queue gets noisy; lower if good stories are being skipped |
| `reviewThreshold` | 50 | Same logic, for the borderline tier |
| `maxPRsPerRun` | 2 | Max PRs the agent can open in a single run |
| `maxOpenAutoPRs` | 5 | If this many auto-PRs are open, the next run no-ops (review backlog signal) |
| `recencyFullPoints` | 7 | Days within which a story still gets full recency credit |
| `recencyZeroPoints` | 30 | Days at which recency hits zero |
| `draftModel` | `anthropic/claude-opus-4` | OpenRouter ID. Smaller models = cheaper, lower quality. Try `anthropic/claude-sonnet-4`, `openai/gpt-4o`, `google/gemini-2.5-pro`, `deepseek/deepseek-chat`. Override per-run with `OPENROUTER_DRAFT_MODEL`. |
| `tiebreakModel` | `anthropic/claude-haiku-4.5` | Used by future LLM dedup tiebreaker. Override with `OPENROUTER_TIEBREAK_MODEL`. |

<a name="models"></a>
### Switching models

Because all LLM calls go through the Vercel AI SDK + OpenRouter, swapping
models is a one-line change. Three ways, in order of granularity:

1. **Per-run** — set the env var when invoking:
   ```bash
   OPENROUTER_DRAFT_MODEL=openai/gpt-4o bun run run
   ```

2. **Per-environment** — set the GitHub Actions repository **variable**
   `OPENROUTER_DRAFT_MODEL` (Settings → Secrets and variables → Actions →
   Variables tab). The workflow already wires it to the agent's env.

3. **Permanent default** — edit the literal in `agent/config.ts`.

The agent code never checks model identity, so any OpenRouter-hosted model
that supports text generation works. The only model-specific behavior is
parsing the markdown response — frontier models all comply with the system
prompt's "output ONLY markdown" instruction; tiny models (<7B) sometimes
add preamble that breaks frontmatter parsing. Stay above ~70B for drafting.

## Killswitch

To pause the daily run without deleting code:

```
GitHub → Actions → research-agent → "..." → Disable workflow
```

To pause for one day, do nothing — the next manual trigger or scheduled run
re-enables it. To pause permanently, delete `.github/workflows/research-agent.yml`.

To stop a run mid-flight: Actions → the running job → Cancel workflow. The
agent has no external side effects until the PR-creation step, so cancelling
during fetch/score is safe. Cancelling between commit and push leaves a
local branch on the runner that gets discarded with the runner. Cancelling
between push and PR creation leaves an orphaned branch on the remote — you
can delete it manually with `git push origin --delete add-story/<slug>`.

## Debugging a bad PR

When the agent opens a PR that's wrong (off-topic, low-quality, factually
suspect, duplicate that slipped through):

1. **Close the PR.** Closing is treated as permanent rejection; the agent
   won't re-suggest the URL.
2. **Check the score breakdown in the PR body.** Which dimension is
   over/under-rated?
3. **If it's the rubric:** edit `agent/pipeline/score.ts`, re-calibrate
   against existing posts (see `docs/research-agent/scoring.md`).
4. **If it's the draft:** the bad markdown lives in the closed branch — read
   it, identify what the LLM got wrong (hallucinated detail? missed a
   section? wrong tone?), and adjust the system prompt in
   `agent/pipeline/draft.ts:SYSTEM_PROMPT`.
5. **If it's a dedup miss:** check why the URL didn't match an existing
   blog. Usually it's a different domain quoting the same incident — fix is
   to add layer-4 LLM tiebreaker (see `dedup.md`).

## Backfilling

If you want all current blogs registered as already-seen URLs (for layer-1
dedup completeness), see the snippet in `dedup.md`. Not required for
correctness — layer 2 already covers it.

## Migrating to Turborepo (if/when needed)

The agent was deliberately structured to make this migration cheap. To
move to a Turborepo monorepo:

1. `mkdir apps && git mv {content,src,scripts,public,index.html,vite.config.js,...} apps/web/`
2. `mkdir packages && git mv agent packages/agent`
3. Add `pnpm-workspace.yaml` or `bunfig.toml` workspace config
4. Add a root `turbo.json` with `web` and `agent` pipelines
5. **In Vercel:** Project Settings → General → Root Directory → set to `apps/web`. Domain stays attached.
6. Update `.github/workflows/research-agent.yml`: `working-directory: packages/agent` instead of `agent`.

This is a ~1 hour migration. The current single-repo layout is fine; only
do this when you have a second deployable to share configuration with.

## Cost

Per-run cost is dominated by the drafting LLM call. OpenRouter passes
through provider pricing with a small markup (typically ~5%).

- Drafting: ~3K input tokens (prompt + few-shot) + ~1.5K output tokens.
  Reference prices via OpenRouter (always check live):
  - `anthropic/claude-opus-4` — ~$0.10–0.15 per draft
  - `anthropic/claude-sonnet-4` — ~$0.02–0.03 per draft
  - `openai/gpt-4o` — ~$0.03–0.05 per draft
  - `google/gemini-2.5-pro` — ~$0.02–0.04 per draft
  - `deepseek/deepseek-chat` — ~$0.002–0.005 per draft

  Capped at `maxPRsPerRun = 2`, so worst case is 2× whichever model you pick.
- Fetching + filtering + scoring: $0 (no LLM).
- LLM tiebreaker (v2, not active): ~$0.001 per borderline candidate with
  Haiku.

At one run/day, ceiling on Opus is **~$10/month**. Switch to Sonnet 4 or
Gemini 2.5 Pro for ~5x cheaper, or DeepSeek for ~30x cheaper, with quality
trade-offs that mostly affect the prose polish of the Lessons section. Test
a few runs on a cheaper model and read the resulting drafts before
committing to a permanent switch.

## Observability

Every run prints a summary to stdout AND writes it to `$GITHUB_STEP_SUMMARY`,
which appears under the workflow run page in GitHub.

The summary includes:

- Funnel counts (fetched / filtered / deduped / scored)
- PRs opened (with score)
- Items queued as needs_review
- Errors
- First 10 skipped items with reasons

For longer-term tracking, the `seen.json` file is your audit log. Every URL
the agent has ever processed is in there, with outcome and timestamp.
