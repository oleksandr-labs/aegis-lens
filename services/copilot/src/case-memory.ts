/**
 * Per-case-file conversation memory.
 *
 * Sprint 1.2 added per-SESSION in-memory history (ephemeral, dies with the tab).
 * A *case file* is a long-lived investigation that may span many sessions, days,
 * and analysts. This module gives each case file durable copilot memory:
 *   - an append-only turn log scoped to `caseId`,
 *   - "pinned facts" the analyst marks as established (each MUST cite an event ID),
 *   - a rolling summary that bounds context size as a case grows,
 *   - `buildCaseContext()` which assembles the memory into a prompt-ready block.
 *
 * Storage is an in-memory `MemoryStore` here (swap for a DB-backed store in prod
 * via the `CaseMemoryStore` interface).
 */

export interface CaseTurn {
  role: "user" | "assistant";
  content: string;
  at: string; // ISO-8601
  /** Event IDs cited in this turn (assistant turns should be grounded). */
  citedEventIds?: string[];
}

export interface PinnedFact {
  id: string;
  /** The established finding, in the analyst's words. */
  statement: string;
  /** REQUIRED supporting event IDs — a fact with no citation is rejected. */
  citedEventIds: string[];
  pinnedBy: string;
  pinnedAt: string;
}

export interface CaseMemory {
  caseId: string;
  /** Locale the case is conducted in. */
  locale: "en" | "uk";
  turns: CaseTurn[];
  pinnedFacts: PinnedFact[];
  /** Rolling summary of older turns (keeps context bounded). */
  rollingSummary?: string;
  updatedAt: string;
}

/** Storage seam — DB-backed in prod, in-memory here. */
export interface CaseMemoryStore {
  get(caseId: string): Promise<CaseMemory | undefined>;
  put(memory: CaseMemory): Promise<void>;
}

export class InMemoryCaseStore implements CaseMemoryStore {
  private readonly map = new Map<string, CaseMemory>();
  async get(caseId: string): Promise<CaseMemory | undefined> {
    const m = this.map.get(caseId);
    return m ? structuredCloneSafe(m) : undefined;
  }
  async put(memory: CaseMemory): Promise<void> {
    this.map.set(memory.caseId, structuredCloneSafe(memory));
  }
}

function structuredCloneSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/** Default cap on retained verbatim turns before summarisation kicks in. */
export const MAX_VERBATIM_TURNS = 20;

function emptyMemory(caseId: string, locale: "en" | "uk"): CaseMemory {
  return { caseId, locale, turns: [], pinnedFacts: [], updatedAt: new Date().toISOString() };
}

/** Append a turn to a case file's memory. */
export async function appendTurn(
  store: CaseMemoryStore,
  caseId: string,
  turn: CaseTurn,
  locale: "en" | "uk" = "en",
): Promise<CaseMemory> {
  const mem = (await store.get(caseId)) ?? emptyMemory(caseId, locale);
  mem.turns.push(turn);
  mem.updatedAt = new Date().toISOString();
  await store.put(mem);
  return mem;
}

/**
 * Pin an established fact. Enforces the platform's grounding rule:
 * a fact with zero cited event IDs is rejected.
 */
export async function pinFact(
  store: CaseMemoryStore,
  caseId: string,
  fact: Omit<PinnedFact, "id" | "pinnedAt">,
): Promise<{ ok: boolean; reason?: string; fact?: PinnedFact }> {
  if (!fact.citedEventIds || fact.citedEventIds.length === 0) {
    return { ok: false, reason: "A pinned fact must cite at least one event ID (grounding rule)." };
  }
  const mem = (await store.get(caseId)) ?? emptyMemory(caseId, "en");
  const pinned: PinnedFact = {
    ...fact,
    id: `pf-${mem.pinnedFacts.length + 1}-${Date.now().toString(36)}`,
    pinnedAt: new Date().toISOString(),
  };
  mem.pinnedFacts.push(pinned);
  mem.updatedAt = new Date().toISOString();
  await store.put(mem);
  return { ok: true, fact: pinned };
}

/**
 * Summariser seam — a real impl calls the LLM. The default is a deterministic
 * extractive fallback (so the loop works offline / in CI).
 */
export type Summariser = (turns: CaseTurn[], locale: "en" | "uk") => Promise<string>;

export const extractiveSummariser: Summariser = async (turns, locale) => {
  const lines = turns.slice(0, -2).map((t) => `${t.role}: ${t.content.replace(/\s+/g, " ").slice(0, 140)}`);
  const header = locale === "uk" ? "Підсумок попередніх ходів:" : "Summary of earlier turns:";
  return `${header}\n${lines.join("\n")}`;
};

/**
 * Compact a case file: fold all-but-the-last `keep` turns into the rolling
 * summary so the prompt stays bounded as the case grows.
 */
export async function compactMemory(
  store: CaseMemoryStore,
  caseId: string,
  summarise: Summariser = extractiveSummariser,
  keep = MAX_VERBATIM_TURNS,
): Promise<CaseMemory | undefined> {
  const mem = await store.get(caseId);
  if (!mem || mem.turns.length <= keep) return mem;
  const older = mem.turns.slice(0, mem.turns.length - keep);
  const recent = mem.turns.slice(mem.turns.length - keep);
  const summary = await summarise(older, mem.locale);
  mem.rollingSummary = mem.rollingSummary ? `${mem.rollingSummary}\n${summary}` : summary;
  mem.turns = recent;
  mem.updatedAt = new Date().toISOString();
  await store.put(mem);
  return mem;
}

/**
 * Assemble a prompt-ready context block from a case file's memory:
 * pinned facts (with citations) + rolling summary + recent verbatim turns.
 * Localised header per the case locale.
 */
export function buildCaseContext(mem: CaseMemory, recentTurns = 6): string {
  const uk = mem.locale === "uk";
  const parts: string[] = [];

  if (mem.pinnedFacts.length) {
    parts.push(uk ? "=== Встановлені факти у справі ===" : "=== Established case facts ===");
    for (const f of mem.pinnedFacts) {
      parts.push(`- ${f.statement} [${f.citedEventIds.join(", ")}]`);
    }
  }
  if (mem.rollingSummary) {
    parts.push(uk ? "=== Підсумок справи ===" : "=== Case summary ===");
    parts.push(mem.rollingSummary);
  }
  const recent = mem.turns.slice(-recentTurns);
  if (recent.length) {
    parts.push(uk ? "=== Останні ходи ===" : "=== Recent turns ===");
    for (const t of recent) {
      const cites = t.citedEventIds?.length ? ` [${t.citedEventIds.join(", ")}]` : "";
      parts.push(`${t.role}: ${t.content}${cites}`);
    }
  }
  return parts.join("\n");
}
