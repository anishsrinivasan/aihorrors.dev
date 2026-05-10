import Parser from "rss-parser";
import { config } from "../config.ts";
import type { Candidate } from "../types.ts";
import { canonicalize, urlHash } from "../lib/canonical-url.ts";

const FEEDS = [
  { name: "The Register", url: "https://www.theregister.com/headlines.atom" },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
  { name: "Bleeping Computer", url: "https://www.bleepingcomputer.com/feed/" },
  { name: "404 Media", url: "https://www.404media.co/rss/" },
  { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/" },
  { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews" },
  { name: "MIT Tech Review AI", url: "https://www.technologyreview.com/feed/" },
  { name: "SlowMist Medium", url: "https://slowmist.medium.com/feed" },
  { name: "AI Incident Database", url: "https://incidentdatabase.ai/rss.xml" },
];

export async function fetchRss(sinceTs: number): Promise<Candidate[]> {
  const parser = new Parser({
    headers: { "User-Agent": config.userAgent },
    timeout: 15000,
  });

  const out: Candidate[] = [];
  const since = sinceTs * 1000;

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items) {
        const url = item.link;
        if (!url) continue;
        const pubMs = item.isoDate ? new Date(item.isoDate).getTime() : Date.now();
        if (pubMs < since) continue;
        out.push({
          url,
          canonicalUrl: canonicalize(url),
          urlHash: urlHash(url),
          title: item.title ?? "(untitled)",
          summary: (item.contentSnippet ?? item.content ?? "").slice(0, 500),
          publishedAt: new Date(pubMs).toISOString(),
          source: "rss",
        });
      }
    } catch (e) {
      console.warn(`[rss] ${feed.name} failed:`, (e as Error).message);
    }
  }

  return out;
}
