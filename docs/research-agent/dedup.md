# Dedup

The single biggest failure mode for an agent like this is opening the same PR
every day until a human merges it. We avoid that with three deterministic
layers, plus an optional LLM tiebreaker (off by default, planned for v2).

## Layer 1 — `state/seen.json`

A JSON file at `agent/state/seen.json` records every URL the agent has ever
processed, by 16-char SHA-1 of the canonical URL.

**Where it lives depends on the runtime:**

- **In CI:** the file is persisted via `actions/cache` between workflow runs.
  Branch protection on `main` (and the agent never having write access to
  protected branches) means the file cannot be committed to git from the
  workflow. The cache is keyed `agent-state-<run_id>` with `restore-keys:
  agent-state-` so each run picks up the most recent prior cache.
- **Locally:** the file in the repo is your state. Edit/inspect freely.
- **The committed `agent/state/seen.json`** is the bootstrap for the very
  first CI run (when no cache exists yet). After that, the cache diverges
  and is authoritative; the committed file is essentially frozen.

```json
{
  "version": 1,
  "last_run": "2026-05-12T14:00:00Z",
  "seen": [
    {
      "url_hash": "a1b2c3d4...",
      "url": "https://...",
      "title": "...",
      "first_seen": "2026-05-11T14:00:00Z",
      "outcome": "pr_opened",
      "pr_number": 17
    }
  ]
}
```

`outcome` values:

| value | meaning |
|---|---|
| `skipped_filter` | dropped by keyword filter (rarely written; usually only in summary) |
| `skipped_duplicate` | matched against existing content or open PR |
| `skipped_score` | scored below `reviewThreshold` |
| `needs_review` | scored between `reviewThreshold` and `publishThreshold` |
| `pr_opened` | drafted and PR opened |
| `errored` | drafting or PR creation failed |

**Once an entry exists with any non-error outcome, the agent will never
revisit that URL.** In CI, the state file survives across runs via
`actions/cache`; locally, via the in-repo file.

**Cache eviction caveat:** GitHub evicts caches that haven't been accessed
in 7 days. The agent runs daily, so eviction never triggers in normal
operation. If the workflow is paused for >7 days, cache evicts and the
next run starts with empty layer-1 state — but layers 2 and 3 still
provide full dedup correctness, so this is a performance regression (more
URLs re-evaluated) rather than a correctness one.

## Layer 2 — committed content

Every run, the agent reads all `content/blogs/*.md` files and extracts:

- The slug (filename minus `.md`)
- The frontmatter title
- All URLs appearing anywhere in the body (matched by regex)

A new candidate is dropped if either:

1. Its canonical URL appears verbatim in any blog post body, or
2. Its title overlaps significantly with an existing post title (≥4 shared
   content words OR ≥60% Jaccard on rare-word sets — see `titlesOverlap` in
   `pipeline/dedupe.ts`).

This catches the case where a story was published before the agent was
deployed (or via manual PR), and a new source republishes it.

## Layer 3 — open PRs

The agent calls `gh pr list --state open --json number,title,body,files,labels`
once per run, and for each open PR extracts:

- The PR title
- The PR body (which our auto-PRs include source URLs in)
- The list of changed files

A candidate is dropped if its canonical URL appears in any open PR body, or
its title overlaps with any open PR title (same overlap heuristic).

This is the layer that prevents the "agent re-creates yesterday's
unreviewed PR" loop. **It works because every auto-generated PR includes
the source URL in a known place in the body** — the `pr.ts` template puts it
under `## Source`.

If the user or another tool opens a PR that doesn't include the source URL
in the body, this layer can miss it. In that case, layer 2 will catch it
once the PR merges, but until then there's a small window for a duplicate.
Mitigation: if you're submitting a manual PR for an incident, paste the
source URL into the PR body too.

## Layer 4 — LLM semantic tiebreaker (v2, not yet active)

Layers 1–3 catch identical URLs and near-identical titles, but they miss
"Cursor wipes Railway DB" vs "AI agent deletes production data on Railway"
when the URLs are different. The fix is a Claude Haiku call that takes the
new candidate's title + summary and the top-3 nearest existing titles, and
returns `same | different | uncertain`.

This is wired up via `config.llmTiebreaker` (default true) but the actual
call site is not yet implemented — it's a deliberate v2 because:

- It costs money per run (~$0.001 per call, but adds up if Reddit dumps 50
  borderline candidates).
- The two layers above already get us 90%+ recall on the existing posts.

When implemented, it lives in `pipeline/dedupe.ts` between layer 3 and the
"fresh" return.

## Backfilling state

If you want the agent to mark all current blog posts as already-seen
(belt-and-suspenders against layer 2 missing something), run:

```bash
cd agent
bun run --print "
  import { loadExistingContent } from './pipeline/existing-content.ts';
  import { loadState, saveState, recordSeen } from './lib/state.ts';
  import { canonicalize, urlHash } from './lib/canonical-url.ts';
  const e = loadExistingContent();
  const s = await loadState();
  for (const u of e.sourceUrls) {
    recordSeen(s, {
      url_hash: urlHash(u), url: u, title: '(backfilled)',
      first_seen: new Date().toISOString(), outcome: 'skipped_duplicate',
      reason: 'backfilled from existing content'
    });
  }
  await saveState(s);
"
```

This is **not** required — layer 2 covers it — but it makes the dedup faster
and the state file a complete history.

## What "duplicate" deliberately misses

We don't dedup on:

- **Same product, different incident.** Two unrelated Cursor incidents are
  two stories.
- **Same incident, much later follow-up.** A 6-month retrospective on an old
  incident is treated as a new story (this is rare; if it becomes a problem,
  add a tag-based filter at layer 2).
- **Same URL after redirect.** We canonicalize tracking params but not full
  redirect chains. If `bit.ly/x` and `example.com/article` both reach the
  same article, we'll see them as different. Layer 2 (URL match) catches the
  second one once the first is published; layer 3 catches it within an open
  PR window.
