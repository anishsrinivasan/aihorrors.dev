import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { BLOGS_DIR } from "../config.ts";
import { canonicalize } from "../lib/canonical-url.ts";

export interface ExistingContent {
  slugs: Set<string>;
  titles: string[];
  sourceUrls: Set<string>;
  rawDocs: { slug: string; title: string; tags: string[]; body: string }[];
}

const URL_REGEX = /https?:\/\/[^\s)\]"']+/g;

export function loadExistingContent(): ExistingContent {
  const files = readdirSync(BLOGS_DIR).filter((f) => f.endsWith(".md"));
  const slugs = new Set<string>();
  const titles: string[] = [];
  const sourceUrls = new Set<string>();
  const rawDocs: ExistingContent["rawDocs"] = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    slugs.add(slug);
    const content = readFileSync(join(BLOGS_DIR, file), "utf-8");
    const { data, content: body } = matter(content);
    titles.push(data.title ?? slug);
    rawDocs.push({
      slug,
      title: data.title ?? slug,
      tags: data.tags ?? [],
      body,
    });
    const urls = body.match(URL_REGEX) ?? [];
    for (const u of urls) sourceUrls.add(canonicalize(u));
  }

  return { slugs, titles, sourceUrls, rawDocs };
}
