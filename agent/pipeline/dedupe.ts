import type { Candidate, State } from "../types.ts";
import type { ExistingContent } from "./existing-content.ts";
import type { OpenPRSummary } from "./open-prs.ts";
import { isSeen } from "../lib/state.ts";

export interface DedupeOutcome {
  fresh: Candidate[];
  duplicates: { candidate: Candidate; reason: string; matched: string }[];
}

/**
 * Three-layer dedup:
 *   1. URL-hash match in state.seen.json
 *   2. Source URL or title match in committed content/blogs/*.md
 *   3. Source URL or title match in any open PR
 *
 * (A semantic LLM tiebreaker for borderline title matches lives in score.ts;
 * this stage uses cheap deterministic checks only.)
 */
export function dedupe(
  candidates: Candidate[],
  state: State,
  existing: ExistingContent,
  openPRs: OpenPRSummary[],
): DedupeOutcome {
  const fresh: Candidate[] = [];
  const duplicates: DedupeOutcome["duplicates"] = [];

  for (const c of candidates) {
    // Layer 1: state file
    const seenEntry = isSeen(state, c.urlHash);
    if (seenEntry) {
      duplicates.push({
        candidate: c,
        reason: `seen previously (${seenEntry.outcome})`,
        matched: seenEntry.url,
      });
      continue;
    }

    // Layer 2: existing committed content
    if (existing.sourceUrls.has(c.canonicalUrl)) {
      duplicates.push({
        candidate: c,
        reason: "URL already cited in a published blog post",
        matched: c.canonicalUrl,
      });
      continue;
    }
    const titleHit = existing.titles.find((t) => titlesOverlap(t, c.title));
    if (titleHit) {
      duplicates.push({
        candidate: c,
        reason: "title overlaps with a published blog post",
        matched: titleHit,
      });
      continue;
    }

    // Layer 3: open PRs
    const prHitByUrl = openPRs.find((pr) => pr.sourceUrls.has(c.canonicalUrl));
    if (prHitByUrl) {
      duplicates.push({
        candidate: c,
        reason: `URL already cited in open PR #${prHitByUrl.number}`,
        matched: prHitByUrl.title,
      });
      continue;
    }
    const prHitByTitle = openPRs.find((pr) => titlesOverlap(pr.title, c.title));
    if (prHitByTitle) {
      duplicates.push({
        candidate: c,
        reason: `title overlaps with open PR #${prHitByTitle.number}`,
        matched: prHitByTitle.title,
      });
      continue;
    }

    fresh.push(c);
  }

  return { fresh, duplicates };
}

/**
 * Cheap title similarity: tokenize, drop stopwords, require >=4 shared
 * content words OR >=60% Jaccard overlap on the rare-word sets.
 */
function titlesOverlap(a: string, b: string): boolean {
  const setA = tokens(a);
  const setB = tokens(b);
  if (!setA.size || !setB.size) return false;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  if (intersection.size >= 4) return true;
  const union = new Set([...setA, ...setB]);
  const jaccard = intersection.size / union.size;
  return jaccard >= 0.6;
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "of", "to", "for", "with",
  "by", "at", "from", "as", "is", "was", "be", "been", "are", "were",
  "ai", "story", "story:", "add", "incident", "new", "the:", "how", "why",
  "after", "before", "into", "this", "that",
]);

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w)),
  );
}
