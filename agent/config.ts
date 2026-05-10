import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = join(__dirname, "..");
export const BLOGS_DIR = join(REPO_ROOT, "content/blogs");
export const DRAFTS_DIR = join(REPO_ROOT, "content/drafts");
export const STATE_PATH = join(__dirname, "state/seen.json");

export const config = {
  // How far back we'll look for incident stories (days).
  lookbackDays: 14,

  // Recency decay window for scoring (days).
  recencyFullPoints: 7,
  recencyZeroPoints: 30,

  // Score thresholds.
  publishThreshold: 60,
  reviewThreshold: 50,

  // Max PRs the agent will open per run. Hard safety cap.
  maxPRsPerRun: 2,

  // If there are already this many open auto-generated PRs, the agent backs off
  // (signals review backlog).
  maxOpenAutoPRs: 5,

  // User agent for HTTP requests.
  userAgent: "ai-horrors-research-agent/0.1 (+https://aihorrors.dev)",

  // Models routed via OpenRouter. Identifiers follow OpenRouter's `provider/model`
  // catalog (see https://openrouter.ai/models). Override per-run with the env
  // vars below; leave defaults pinned to current generation Anthropic models so
  // drafts stay consistent with prior runs.
  // Use `||` (not `??`) so an empty-string env var (e.g. an unset GH Actions
  // variable that resolves to "") falls back to the default.
  draftModel: process.env.OPENROUTER_DRAFT_MODEL || "anthropic/claude-opus-4",
  tiebreakModel: process.env.OPENROUTER_TIEBREAK_MODEL || "anthropic/claude-haiku-4.5",

  dryRun: process.env.DRY_RUN === "1",
  // Force-run bypasses the open-PR backoff cap so the agent runs even when
  // there are already `maxOpenAutoPRs` auto-generated PRs awaiting review.
  // Threshold and dedup are NOT bypassed — force only disables the
  // review-backlog circuit breaker.
  forceRun: process.env.FORCE_RUN === "1",
  llmTiebreaker: process.env.LLM_TIEBREAKER !== "0",
  llmDrafting: process.env.LLM_DRAFTING !== "0",

  prLabel: "auto-generated",
} as const;

export const KEYWORDS = {
  // Must match at least one AI term AND one incident term.
  // Patterns are mostly stems so we catch tense / morphology variants
  // (delete / deleted / deletes / deleting all match `delet`).
  ai: /\b(chatgpt|claude|gemini|grok|copilot|cursor|llama|gpt-?[0-9]|\bllm\b|ai[\s-]?(agent|coding|coded|powered|assistant|chatbot|bot|written|generated|based|tool)|artificial intelligence|openai|anthropic|x[\s-]?ai|mistral|perplexity|deepseek|stable diffusion|midjourney|sora|veo|runway|coding agent|coding assistant|code assistant|machine learning|\bml model)\b/i,
  incident:
    /\b(delet(e|ed|es|ing)|leak(s|ed|ing|age)?|expos(e|ed|ing|ure)|drain(s|ed|ing)?|exploit(s|ed|ing)?|hack(s|ed|ing|er)?|broke|broken|breach(es|ed|ing)?|crash(es|ed|ing)?|wipe(s|d|ing)?|outage|stol(e|en)|theft|compromis(e|es|ed|ing)|vulnerab|prompt injection|jailbreak|hallucinat|data loss|ransom|backdoor|exfiltrat|misconfigur|0day|zero[- ]?day|\bcve\b|goes? rogue|gone rogue|destroy(s|ed|ing)?)\b/i,
};

export const SOURCE_BLOCKLIST_PATTERNS = [
  /youtube\.com\/shorts/i,
  /tiktok\.com/i,
  // Aggregators that often republish without adding signal:
  /yahoo\.com\/finance/i,
];
