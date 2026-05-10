import { config } from "../config.ts";
import type { Candidate } from "../types.ts";
import { canonicalize, urlHash } from "../lib/canonical-url.ts";

const ALGOLIA = "https://hn.algolia.com/api/v1/search_by_date";

const HN_QUERIES = [
  "AI agent deleted",
  "LLM data leak",
  "prompt injection",
  "AI hallucination incident",
  "ChatGPT exposed",
  "Claude vulnerability",
  "Cursor production",
  "Copilot leak",
  "AI coding incident",
  "Gemini exploit",
];

export async function fetchHackerNews(sinceTs: number): Promise<Candidate[]> {
  const out: Candidate[] = [];
  const seen = new Set<string>();

  for (const q of HN_QUERIES) {
    const url = `${ALGOLIA}?tags=story&query=${encodeURIComponent(q)}&numericFilters=created_at_i>${sinceTs}&hitsPerPage=20`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": config.userAgent } });
      if (!res.ok) continue;
      const data = (await res.json()) as { hits: HNHit[] };
      for (const hit of data.hits) {
        if (!hit.url) continue;
        if (seen.has(hit.objectID)) continue;
        seen.add(hit.objectID);
        const canonical = canonicalize(hit.url);
        out.push({
          url: hit.url,
          canonicalUrl: canonical,
          urlHash: urlHash(hit.url),
          title: hit.title,
          summary: hit.story_text?.slice(0, 500) ?? "",
          publishedAt: new Date(hit.created_at_i * 1000).toISOString(),
          source: "hackernews",
        });
      }
    } catch (e) {
      console.warn(`[hn] query "${q}" failed:`, (e as Error).message);
    }
  }

  return out;
}

interface HNHit {
  objectID: string;
  url?: string;
  title: string;
  story_text?: string;
  created_at_i: number;
  points?: number;
  num_comments?: number;
}
