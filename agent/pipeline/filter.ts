import { KEYWORDS, SOURCE_BLOCKLIST_PATTERNS } from "../config.ts";
import type { Candidate } from "../types.ts";

export interface FilterResult {
  kept: Candidate[];
  dropped: { candidate: Candidate; reason: string }[];
}

export function filterCandidates(items: Candidate[]): FilterResult {
  const kept: Candidate[] = [];
  const dropped: FilterResult["dropped"] = [];

  for (const c of items) {
    const blockedBy = SOURCE_BLOCKLIST_PATTERNS.find((p) => p.test(c.url));
    if (blockedBy) {
      dropped.push({ candidate: c, reason: `source blocklist: ${blockedBy}` });
      continue;
    }

    const haystack = `${c.title}\n${c.summary}`;
    if (!KEYWORDS.ai.test(haystack)) {
      dropped.push({ candidate: c, reason: "no AI keyword match" });
      continue;
    }
    if (!KEYWORDS.incident.test(haystack)) {
      dropped.push({ candidate: c, reason: "no incident keyword match" });
      continue;
    }

    kept.push(c);
  }

  return { kept, dropped };
}
