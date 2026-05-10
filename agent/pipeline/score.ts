import { config } from "../config.ts";
import type { Candidate, ScoreBreakdown, ScoredCandidate, Verdict } from "../types.ts";

/**
 * Heuristic scorer. Returns 0-100 with a breakdown.
 *
 * Weights:
 *   severity     30
 *   specificity  20
 *   credibility  15
 *   novelty      15
 *   audienceFit  10
 *   recency      10
 */
export function scoreCandidate(c: Candidate, knownTitles: string[]): ScoredCandidate {
  const haystack = `${c.title}\n${c.summary}`.toLowerCase();
  const notes: string[] = [];

  // Severity: real $ loss / data loss / outage / CVE.
  let severity = 0;
  const severitySignals = [
    { rx: /\$[\d,.]+\s*(k|m|million|billion|thousand)?/i, pts: 10, label: "dollar amount" },
    { rx: /\b(production|prod|prod-?env)\b/i, pts: 6, label: "prod system" },
    { rx: /\bdeleted|wiped|destroy(ed)?\b/i, pts: 8, label: "destruction verb" },
    { rx: /\bbreach(ed)?|leak(ed)?|exposed\b/i, pts: 8, label: "data exposure" },
    { rx: /\b(cve-\d{4}-\d{4,7})\b/i, pts: 6, label: "CVE id" },
    { rx: /\boutage|down(time)?\b/i, pts: 5, label: "outage" },
    { rx: /\bdrained|stolen|compromised\b/i, pts: 6, label: "theft" },
  ];
  for (const s of severitySignals) {
    if (s.rx.test(haystack)) {
      severity += s.pts;
      notes.push(`+${s.pts} severity (${s.label})`);
    }
  }
  severity = Math.min(severity, 30);

  // Specificity: identifiable product + identifiable date + technical mechanism.
  let specificity = 0;
  const productHits = [/\b(chatgpt|claude|gemini|grok|copilot|cursor|llama|gpt-?[0-9])\b/gi]
    .flatMap((rx) => Array.from(haystack.matchAll(rx)).map((m) => m[0]));
  if (productHits.length) {
    specificity += 8;
    notes.push(`+8 specificity (named product: ${productHits[0]})`);
  }
  if (/\b(20\d\d-\d\d-\d\d|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(haystack)) {
    specificity += 5;
    notes.push("+5 specificity (date reference)");
  }
  if (/\b(prompt injection|sql injection|xss|rce|sandbox escape|race condition|misconfig|exfil)\b/i.test(haystack)) {
    specificity += 7;
    notes.push("+7 specificity (technical mechanism named)");
  }
  specificity = Math.min(specificity, 20);

  // Credibility from the source domain.
  let credibility = 0;
  const host = safeHost(c.url);
  const credSignals: { rx: RegExp; pts: number; label: string }[] = [
    { rx: /(theregister|arstechnica|bleepingcomputer|404media|krebsonsecurity|wired|techcrunch|reuters|bloomberg|ft\.com|nytimes|wsj)/i, pts: 12, label: "tier-A outlet" },
    { rx: /(slowmist|blog\.cloudflare|aws\.amazon|googlecloudplatform|status\.|engineering\.atspotify|github\.blog)/i, pts: 12, label: "vendor postmortem" },
    { rx: /(incidentdatabase\.ai)/i, pts: 10, label: "incident database" },
    { rx: /(news\.ycombinator|lobste\.rs)/i, pts: 4, label: "discussion forum" },
    { rx: /(reddit\.com|medium\.com|substack\.com)/i, pts: 3, label: "blog/social platform" },
  ];
  for (const s of credSignals) {
    if (s.rx.test(host)) {
      credibility = Math.max(credibility, s.pts);
      notes.push(`+${s.pts} credibility (${s.label}: ${host})`);
      break;
    }
  }
  credibility = Math.min(credibility, 15);

  // Novelty: penalize if title heavily overlaps an existing title (we already
  // dedup'd hard matches, so anything reaching here is at least moderately new).
  let novelty = 12;
  const closest = closestTitle(c.title, knownTitles);
  if (closest && closest.overlap >= 0.4) {
    novelty -= 8;
    notes.push(`-8 novelty (similar to: "${closest.title}")`);
  }
  if (/\b(first|never seen|new class|novel|unprecedented)\b/i.test(haystack)) {
    novelty += 3;
    notes.push("+3 novelty (claims first-of-kind)");
  }
  novelty = Math.max(0, Math.min(novelty, 15));

  // Audience fit: do we have enough hooks to write a Lessons + Prevention checklist?
  let audienceFit = 0;
  if (/\b(prevention|mitigation|lesson|takeaway|recommend|should have|root cause)\b/i.test(haystack)) {
    audienceFit += 6;
    notes.push("+6 audience fit (lessons signal)");
  }
  if (/\b(developer|engineer|devops|sre|security team|admin)\b/i.test(haystack)) {
    audienceFit += 4;
    notes.push("+4 audience fit (technical audience)");
  }
  audienceFit = Math.min(audienceFit, 10);

  // Recency: linear decay from full at recencyFullPoints to 0 at recencyZeroPoints.
  const ageDays = (Date.now() - new Date(c.publishedAt).getTime()) / 86_400_000;
  let recency = 10;
  if (ageDays <= config.recencyFullPoints) {
    recency = 10;
  } else if (ageDays >= config.recencyZeroPoints) {
    recency = 0;
  } else {
    const span = config.recencyZeroPoints - config.recencyFullPoints;
    recency = Math.round(10 * (1 - (ageDays - config.recencyFullPoints) / span));
  }
  notes.push(`recency=${recency} (age=${ageDays.toFixed(1)}d)`);

  const total = severity + specificity + credibility + novelty + audienceFit + recency;
  const breakdown: ScoreBreakdown = {
    severity,
    specificity,
    credibility,
    novelty,
    audienceFit,
    recency,
    total,
  };

  let verdict: Verdict = "skip";
  if (total >= config.publishThreshold) verdict = "publish";
  else if (total >= config.reviewThreshold) verdict = "needs_review";

  return { ...c, score: breakdown, verdict, scoreNotes: notes.join("; ") };
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function closestTitle(t: string, known: string[]): { title: string; overlap: number } | null {
  const tokensA = tokens(t);
  if (!tokensA.size) return null;
  let best: { title: string; overlap: number } | null = null;
  for (const k of known) {
    const tokensB = tokens(k);
    if (!tokensB.size) continue;
    const inter = new Set([...tokensA].filter((x) => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);
    const overlap = inter.size / union.size;
    if (!best || overlap > best.overlap) best = { title: k, overlap };
  }
  return best;
}

const STOPWORDS = new Set([
  "the","a","an","and","or","but","in","on","of","to","for","with","by","at",
  "from","as","is","was","be","been","are","were","ai","story","story:","add",
]);

function tokens(s: string): Set<string> {
  return new Set(
    s.toLowerCase().replace(/[^\w\s-]/g, " ").split(/\s+/)
      .filter((w) => w.length >= 3 && !STOPWORDS.has(w)),
  );
}
