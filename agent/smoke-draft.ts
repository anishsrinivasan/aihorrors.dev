/**
 * Smoke test for the OpenRouter / Vercel AI SDK integration.
 *
 * Constructs a synthetic candidate (no network fetch needed), runs it through
 * draftStory(), and prints the result. Does NOT open a PR or write to disk.
 *
 *   bun run smoke-draft.ts
 */

import { draftStory, pickFewShotExamples } from "./pipeline/draft.ts";
import { loadExistingContent } from "./pipeline/existing-content.ts";
import { config } from "./config.ts";
import type { ScoredCandidate } from "./types.ts";

const synthetic: ScoredCandidate = {
  url: "https://example.com/synthetic-incident",
  canonicalUrl: "https://example.com/synthetic-incident",
  urlHash: "smoke",
  title: "Synth AI Coding Assistant Drops Production PostgreSQL During Routine Migration",
  summary:
    "On May 8 2026, the AI coding agent 'Synth' (a fictional product used here for testing) was given a task to optimize a production PostgreSQL schema during a maintenance window. The agent misinterpreted a benchmark suggestion as an instruction and executed `DROP DATABASE` on the live cluster, causing 4 hours of downtime for ~12,000 users. Backups were 6 hours stale due to a misconfigured retention policy. The CTO confirmed the incident in a public postmortem, citing 'overly broad agent permissions' and 'no out-of-band confirmation for destructive SQL'. SlowMist published a writeup recommending sandboxed schema changes, RLS-scoped agent credentials, and explicit allow-lists for destructive operations.",
  publishedAt: new Date().toISOString(),
  source: "rss",
  score: {
    severity: 26,
    specificity: 18,
    credibility: 12,
    novelty: 12,
    audienceFit: 9,
    recency: 10,
    total: 87,
  },
  verdict: "publish",
  scoreNotes: "synthetic smoke test",
};

console.log("[smoke] model:", config.draftModel);
console.log("[smoke] env:", process.env.OPENROUTER_API_KEY ? "OPENROUTER_API_KEY ✓" : "OPENROUTER_API_KEY ✗");
console.log();

const existing = loadExistingContent();
const fewShot = pickFewShotExamples(synthetic, existing.rawDocs);
console.log("[smoke] few-shot examples:", fewShot);
console.log("[smoke] calling draftStory()...");
console.time("[smoke] draft");

const draft = await draftStory(synthetic, fewShot);

console.timeEnd("[smoke] draft");
console.log();
console.log("=== PARSED FRONTMATTER ===");
console.log(JSON.stringify(draft.frontmatter, null, 2));
console.log();
console.log("=== SLUG ===");
console.log(draft.slug);
console.log();
console.log("=== FULL MARKDOWN ===");
console.log(draft.markdown);

const requiredSections = [
  "## What Happened",
  "## How It Happened",
  "## Why This Matters",
  "## Lessons Learned",
  "## Prevention Checklist",
];
const missing = requiredSections.filter((s) => !draft.markdown.includes(s));
if (missing.length) {
  console.error("\n[smoke] FAIL — missing sections:", missing);
  process.exit(1);
}
if (!draft.frontmatter.tags?.length) {
  console.error("[smoke] FAIL — no tags in frontmatter");
  process.exit(1);
}
console.log("\n[smoke] OK — all required sections present, frontmatter parsed.");
