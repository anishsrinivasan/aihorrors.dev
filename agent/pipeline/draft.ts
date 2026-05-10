import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { config, BLOGS_DIR, REPO_ROOT } from "../config.ts";
import type { DraftResult, ScoredCandidate, Severity } from "../types.ts";

const SYSTEM_PROMPT = `You are an editor for aihorrors.dev, a blog that catalogs real-world AI incidents.
Your job: produce ONE publication-ready markdown file that strictly follows the project's STORY_TEMPLATE.md and AI_AGENT_GUIDE.md format.

Output rules:
- Output ONLY a single markdown document, no preamble, no commentary.
- Start with valid YAML frontmatter (--- fenced).
- Frontmatter fields: title, date, severity (critical|high|medium), tags (3-7), excerpt (<=150 chars).
- Required sections in order: ## What Happened, ## How It Happened, ## Why This Matters, ## Lessons Learned, ## Prevention Checklist.
- End with "---" then "**Original Source:** [link]" and any related coverage.
- 500-800 words total. Bullet points for technical detail. No speculation beyond the source.
- Title should name the product and the incident concretely.
- date: incident date if known, else publication date.`;

let cachedProvider: ReturnType<typeof createOpenRouter> | null = null;

function getProvider() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not set; cannot draft.");
  }
  if (!cachedProvider) {
    cachedProvider = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
  }
  return cachedProvider;
}

export async function draftStory(
  candidate: ScoredCandidate,
  fewShotSlugs: string[],
): Promise<DraftResult> {
  const fewShot = fewShotSlugs
    .map((slug) => readFileSync(join(BLOGS_DIR, `${slug}.md`), "utf-8"))
    .map((md, i) => `### Example ${i + 1}\n\n${md}`)
    .join("\n\n");

  const guide = readFileSync(join(REPO_ROOT, "AI_AGENT_GUIDE.md"), "utf-8");

  const userPrompt = [
    "Write a story for the following incident.",
    "",
    "## Incident metadata",
    `URL: ${candidate.url}`,
    `Source: ${candidate.source}`,
    `Headline: ${candidate.title}`,
    `Published: ${candidate.publishedAt}`,
    "",
    "## Source summary (use only this; do not invent details)",
    candidate.summary || "(no summary captured — fetch the URL contents and use them)",
    "",
    "## House style guide",
    guide,
    "",
    "## Reference examples",
    fewShot,
    "",
    "Now produce the markdown for this incident.",
  ].join("\n");

  const provider = getProvider();

  const { text } = await generateText({
    model: provider(config.draftModel),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    // Cap output. A full story is ~600-800 words ≈ 1000-1500 tokens; 4000
    // gives headroom without OpenRouter reserving 32K of credit per call.
    maxOutputTokens: 4000,
  });

  return parseDraft(text.trim());
}

function parseDraft(markdown: string): DraftResult {
  // Tolerate models that emit a preamble before the frontmatter — strip
  // anything before the first `---` line.
  const fmStart = markdown.search(/(^|\n)---\s*\n/);
  const cleaned = fmStart > 0 ? markdown.slice(fmStart).replace(/^\n/, "") : markdown;
  const { data, content } = matter(cleaned);
  if (!data.title || !data.date || !data.severity) {
    console.error("[draft] parse failed. Raw model output:\n---\n" + markdown.slice(0, 2000) + "\n---");
    throw new Error("Drafted markdown missing required frontmatter fields.");
  }
  const slug = slugify(data.title);
  const filename = `${slug}.md`;
  return {
    slug,
    filename,
    markdown: cleaned,
    frontmatter: {
      title: data.title,
      date: data.date,
      severity: data.severity as Severity,
      tags: data.tags ?? [],
      excerpt: data.excerpt ?? content.slice(0, 140),
    },
  };
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Pick few-shot examples whose tags overlap the candidate.
 * Falls back to the 2 most recent posts.
 */
export function pickFewShotExamples(
  candidate: ScoredCandidate,
  rawDocs: { slug: string; tags: string[] }[],
): string[] {
  const candTokens = new Set(
    candidate.title
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length >= 4),
  );
  const ranked = rawDocs
    .map((d) => ({
      slug: d.slug,
      score: d.tags.filter((t) => candTokens.has(t.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score);
  const top = ranked.slice(0, 2).map((r) => r.slug);
  if (top.length < 2) {
    for (const d of rawDocs.slice(0, 4)) {
      if (!top.includes(d.slug)) top.push(d.slug);
      if (top.length === 2) break;
    }
  }
  return top;
}
