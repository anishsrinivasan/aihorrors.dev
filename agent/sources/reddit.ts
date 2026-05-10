import { config } from "../config.ts";
import type { Candidate } from "../types.ts";
import { canonicalize, urlHash } from "../lib/canonical-url.ts";

const SUBREDDITS = [
  "MachineLearning",
  "LocalLLaMA",
  "OpenAI",
  "ClaudeAI",
  "cybersecurity",
  "netsec",
  "sysadmin",
  "programming",
  "selfhosted",
];

export async function fetchReddit(sinceTs: number): Promise<Candidate[]> {
  const out: Candidate[] = [];
  const seen = new Set<string>();

  for (const sub of SUBREDDITS) {
    const url = `https://www.reddit.com/r/${sub}/new.json?limit=50`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": config.userAgent },
      });
      if (!res.ok) {
        console.warn(`[reddit] ${sub} returned ${res.status}`);
        continue;
      }
      const data = (await res.json()) as RedditListing;
      for (const child of data.data.children) {
        const p = child.data;
        if (p.created_utc < sinceTs) continue;
        if (p.is_self && !p.url_overridden_by_dest) continue; // self-posts without external link
        const externalUrl = p.url_overridden_by_dest || `https://www.reddit.com${p.permalink}`;
        const id = p.id;
        if (seen.has(id)) continue;
        seen.add(id);
        out.push({
          url: externalUrl,
          canonicalUrl: canonicalize(externalUrl),
          urlHash: urlHash(externalUrl),
          title: p.title,
          summary: (p.selftext ?? "").slice(0, 500),
          publishedAt: new Date(p.created_utc * 1000).toISOString(),
          source: "reddit",
        });
      }
    } catch (e) {
      console.warn(`[reddit] r/${sub} failed:`, (e as Error).message);
    }
  }

  return out;
}

interface RedditListing {
  data: {
    children: { data: RedditPost }[];
  };
}

interface RedditPost {
  id: string;
  title: string;
  selftext?: string;
  url_overridden_by_dest?: string;
  permalink: string;
  created_utc: number;
  is_self: boolean;
  subreddit: string;
}
