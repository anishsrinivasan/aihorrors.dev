import { config } from "../config.ts";
import type { Candidate } from "../types.ts";
import { canonicalize, urlHash } from "../lib/canonical-url.ts";

export async function fetchLobsters(sinceTs: number): Promise<Candidate[]> {
  const out: Candidate[] = [];
  // Lobsters has a JSON feed for tagged posts.
  const tags = ["ai", "ml", "security"];
  for (const tag of tags) {
    try {
      const res = await fetch(`https://lobste.rs/t/${tag}.json`, {
        headers: { "User-Agent": config.userAgent },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as LobstersStory[];
      for (const story of data) {
        const pubMs = new Date(story.created_at).getTime();
        if (pubMs / 1000 < sinceTs) continue;
        const url = story.url || story.short_id_url;
        if (!url) continue;
        out.push({
          url,
          canonicalUrl: canonicalize(url),
          urlHash: urlHash(url),
          title: story.title,
          summary: story.description?.slice(0, 500) ?? "",
          publishedAt: new Date(pubMs).toISOString(),
          source: "lobsters",
        });
      }
    } catch (e) {
      console.warn(`[lobsters] tag ${tag} failed:`, (e as Error).message);
    }
  }
  return out;
}

interface LobstersStory {
  short_id: string;
  short_id_url: string;
  url: string;
  title: string;
  description?: string;
  created_at: string;
  score: number;
  tags: string[];
}
