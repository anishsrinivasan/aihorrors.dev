# Research agent

Daily background process that finds new AI-incident stories, dedupes against
existing content + open PRs, scores them, and opens a PR for the top
candidates.

**Read first:** [`docs/research-agent/README.md`](../docs/research-agent/README.md)

## Quick commands

```bash
bun install                                  # install agent deps
OPENROUTER_API_KEY=sk-or-... bun run run:dry # full pipeline, no PR / state writes
OPENROUTER_API_KEY=sk-or-... bun run run     # full pipeline (opens PRs)
```

Drafting is routed through [OpenRouter](https://openrouter.ai) using the
Vercel AI SDK (`ai` + `@openrouter/ai-sdk-provider`). Swap models by setting
`OPENROUTER_DRAFT_MODEL` (default: `anthropic/claude-opus-4`).

## Layout

```
agent/
├── index.ts             ← entrypoint
├── config.ts            ← thresholds, models, lookback
├── types.ts             ← shared types
├── lib/                 ← canonical-url, state I/O
├── sources/             ← one file per source
├── pipeline/            ← filter → dedupe → score → draft → pr → summary
└── state/seen.json      ← persistent dedup ledger (committed)
```

Why this is a separate `package.json`: keeps Anthropic SDK / RSS parser /
etc. out of the Vercel build, and makes the agent's deps independently
upgradable. See [docs/research-agent/architecture.md](../docs/research-agent/architecture.md)
for the full rationale and a Turborepo migration recipe for later.
