import type { RunSummary } from "../types.ts";

export function renderSummary(s: RunSummary): string {
  const lines: string[] = [];
  lines.push(`# Research agent run — ${s.startedAt}`);
  lines.push("");
  lines.push(`Duration: ${s.startedAt} → ${s.finishedAt}`);
  lines.push("");
  lines.push("## Funnel");
  lines.push(`- fetched: ${s.fetched}`);
  lines.push(`- after keyword filter: ${s.afterFilter}`);
  lines.push(`- after dedup: ${s.afterDedupe}`);
  lines.push(`- scored: ${s.scored}`);
  lines.push(`- threshold (publish): ${s.publishedThreshold}`);
  lines.push("");

  if (s.prsOpened.length) {
    lines.push("## PRs opened");
    for (const p of s.prsOpened) {
      lines.push(`- #${p.number} \`${p.slug}\` — score ${p.score}`);
    }
    lines.push("");
  }

  if (s.needsReview.length) {
    lines.push("## Needs review (queued, no PR)");
    for (const r of s.needsReview) {
      lines.push(`- \`${r.slug}\` (score ${r.score}): ${r.reason}`);
    }
    lines.push("");
  }

  if (s.errors.length) {
    lines.push("## Errors");
    for (const e of s.errors) lines.push(`- ${e}`);
    lines.push("");
  }

  lines.push(`Skipped (${s.skipped.length}). First 10:`);
  for (const k of s.skipped.slice(0, 10)) {
    lines.push(`- ${k.url} — ${k.reason}`);
  }

  return lines.join("\n");
}
