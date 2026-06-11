/**
 * Spelling correction for search queries.
 *
 * Two strategies:
 *   1. Domain dictionary (military/OSINT terms + UA place names) — no latency
 *   2. Elasticsearch "Did you mean" via _suggest API — 1 network round-trip
 *
 * Correction is applied transparently; original query preserved for logging.
 */

// ── Domain dictionary corrections ─────────────────────────────────────────

const DOMAIN_CORRECTIONS: Record<string, string> = {
  // Drone model name typos
  "shahed 136": "shahed-136",
  "shahed136": "shahed-136",
  "shahid-136": "shahed-136",
  "шахед136": "шахед-136",
  "geryan": "geran",
  "lancet3": "lancet-3",
  "lancet 3": "lancet-3",
  "orlan10": "orlan-10",
  "orlan 10": "orlan-10",

  // Missile names
  "kalibar": "kalibr",
  "kalib": "kalibr",
  "каліьбр": "калібр",
  "kindzhall": "kinzhal",
  "kinzal": "kinzhal",
  "кинжал": "кинджал",
  "iskandar": "iskander",
  "iskander m": "iskander-m",

  // Ukrainian region typos
  "kharkiev": "kharkiv",
  "kharkow": "kharkiv",
  "харків": "харків",
  "kiyv": "kyiv",
  "kiev": "kyiv",
  "lvov": "lviv",
  "odessa": "odesa",
  "odessa region": "odesa oblast",
  "zaporizhia": "zaporizhzhia",
  "zaporizhzhya": "zaporizhzhia",

  // Event class typos
  "misile": "missile",
  "missle": "missile",
  "droen": "drone",
  "dronne": "drone",
  "artilery": "artillery",
  "artillary": "artillery",
  "airtsrike": "airstrike",
  "powre outage": "power outage",
  "power outagge": "power outage",
};

/** Apply domain dictionary corrections to a query string. */
export function applyDomainCorrections(query: string): { corrected: string; wasChanged: boolean } {
  const lower = query.toLowerCase().trim();
  for (const [wrong, right] of Object.entries(DOMAIN_CORRECTIONS)) {
    if (lower.includes(wrong)) {
      const corrected = query.toLowerCase().replace(new RegExp(escapeRegex(wrong), "gi"), right);
      return { corrected, wasChanged: corrected !== query };
    }
  }
  return { corrected: query, wasChanged: false };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Edit distance for fuzzy matching ──────────────────────────────────────

function editDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ── Common event domain terms (for closest-match fuzzy correction) ─────────

const DOMAIN_TERMS = [
  "drone", "missile", "airstrike", "artillery", "explosion", "power outage",
  "fire", "flooding", "evacuation", "casualties", "shelling", "interception",
  "shahed-136", "kalibr", "iskander", "kinzhal", "gepard", "patriot",
  "kyiv", "kharkiv", "odesa", "zaporizhzhia", "lviv", "donetsk", "kherson",
  "mykolaiv", "dnipro", "sumy", "poltava", "chernihiv",
];

/** Fuzzy-correct a single word against the domain dictionary. */
export function fuzzyCorrectWord(word: string, maxDistance = 2): string | null {
  const lower = word.toLowerCase();
  if (lower.length < 4) return null; // Don't correct short words

  let best: string | null = null;
  let bestDist = maxDistance + 1;

  for (const term of DOMAIN_TERMS) {
    const dist = editDistance(lower, term);
    if (dist < bestDist) {
      bestDist = dist;
      best = term;
    }
  }

  return bestDist <= maxDistance ? best : null;
}

// ── Elasticsearch suggest API ──────────────────────────────────────────────

export interface SpellSuggestion {
  original: string;
  suggestion: string;
  score: number;
}

/** Build the ES _suggest request body for a query. */
export function buildSuggestRequest(query: string, index = "events"): object {
  return {
    "spell-check": {
      text: query,
      phrase: {
        field: `title_en`,
        gram_size: 3,
        direct_generator: [{ field: "title_en", suggest_mode: "missing", min_word_length: 3 }],
        highlight: { pre_tag: "<em>", post_tag: "</em>" },
      },
    },
  };
}

/** Parse the ES _suggest response into SpellSuggestion objects. */
export function parseSuggestResponse(response: unknown): SpellSuggestion[] {
  const res = response as Record<string, unknown>;
  const spellCheck = res["spell-check"] as Array<{ options?: Array<{ text: string; score: number }> }>;
  if (!spellCheck?.[0]?.options?.length) return [];
  return spellCheck[0].options.map((opt) => ({
    original: (res["spell-check"] as any)[0]?.text ?? "",
    suggestion: opt.text,
    score: opt.score,
  }));
}

// ── Public correction pipeline ─────────────────────────────────────────────

export interface CorrectionResult {
  originalQuery: string;
  correctedQuery: string;
  wasChanged: boolean;
  changeType?: "domain_dictionary" | "fuzzy" | "elasticsearch";
  suggestionShown?: string; // Text like: 'Did you mean "iskander"?'
}

export function correctQuery(query: string): CorrectionResult {
  const { corrected: dictCorrected, wasChanged: dictChanged } = applyDomainCorrections(query);
  if (dictChanged) {
    return {
      originalQuery: query,
      correctedQuery: dictCorrected,
      wasChanged: true,
      changeType: "domain_dictionary",
    };
  }

  // Try word-level fuzzy on each token
  const tokens = query.split(/\s+/);
  let changed = false;
  const correctedTokens = tokens.map((token) => {
    const corr = fuzzyCorrectWord(token);
    if (corr && corr !== token.toLowerCase()) { changed = true; return corr; }
    return token;
  });

  if (changed) {
    const correctedQuery = correctedTokens.join(" ");
    return {
      originalQuery: query,
      correctedQuery,
      wasChanged: true,
      changeType: "fuzzy",
      suggestionShown: `Did you mean "${correctedQuery}"?`,
    };
  }

  return { originalQuery: query, correctedQuery: query, wasChanged: false };
}
