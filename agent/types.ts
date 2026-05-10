export type Severity = "critical" | "high" | "medium";

export interface Candidate {
  url: string;
  canonicalUrl: string;
  urlHash: string;
  title: string;
  summary: string;
  publishedAt: string;
  source: SourceName;
  rawText?: string;
  productHints?: string[];
}

export type SourceName =
  | "hackernews"
  | "reddit"
  | "rss"
  | "lobsters";

export interface ScoreBreakdown {
  severity: number;
  specificity: number;
  credibility: number;
  novelty: number;
  audienceFit: number;
  recency: number;
  total: number;
}

export type Verdict = "publish" | "skip" | "needs_review";

export interface ScoredCandidate extends Candidate {
  score: ScoreBreakdown;
  verdict: Verdict;
  scoreNotes: string;
}

export interface DedupeResult {
  candidate: Candidate;
  status: "fresh" | "duplicate";
  reason?: string;
  matchedAgainst?: string;
}

export interface SeenEntry {
  url_hash: string;
  url: string;
  title: string;
  first_seen: string;
  outcome: "skipped_filter" | "skipped_duplicate" | "skipped_score" | "needs_review" | "pr_opened" | "errored";
  pr_number?: number;
  reason?: string;
}

export interface State {
  version: 1;
  last_run: string | null;
  seen: SeenEntry[];
}

export interface DraftResult {
  slug: string;
  filename: string;
  markdown: string;
  frontmatter: {
    title: string;
    date: string;
    severity: Severity;
    tags: string[];
    excerpt: string;
  };
}

export interface RunSummary {
  startedAt: string;
  finishedAt: string;
  fetched: number;
  afterFilter: number;
  afterDedupe: number;
  scored: number;
  publishedThreshold: number;
  prsOpened: { number: number; slug: string; score: number }[];
  needsReview: { slug: string; score: number; reason: string }[];
  skipped: { url: string; reason: string }[];
  errors: string[];
}
