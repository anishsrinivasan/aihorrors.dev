import { STATE_PATH } from "../config.ts";
import type { State, SeenEntry } from "../types.ts";

export async function loadState(): Promise<State> {
  const file = Bun.file(STATE_PATH);
  if (!(await file.exists())) {
    return { version: 1, last_run: null, seen: [] };
  }
  try {
    return (await file.json()) as State;
  } catch (e) {
    // Don't crash the run on a corrupted state file — start with empty state
    // and let the next save overwrite. Layers 2/3 still handle dedup.
    console.warn(`[state] failed to parse ${STATE_PATH}: ${(e as Error).message}. Starting fresh.`);
    return { version: 1, last_run: null, seen: [] };
  }
}

export async function saveState(state: State): Promise<void> {
  await Bun.write(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
}

export function recordSeen(state: State, entry: SeenEntry): void {
  // Replace if hash already exists, else append.
  const idx = state.seen.findIndex((e) => e.url_hash === entry.url_hash);
  if (idx >= 0) state.seen[idx] = entry;
  else state.seen.push(entry);
}

export function isSeen(state: State, urlHash: string): SeenEntry | undefined {
  return state.seen.find((e) => e.url_hash === urlHash);
}
