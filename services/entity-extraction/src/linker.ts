/**
 * Entity linker: match extracted mentions to canonical KG entities.
 * Uses alias + transliteration matching with Levenshtein distance fallback.
 */

import { EntityMention, KnowledgeGraphEntity, EntityLinkProposal } from "./types";

// ── Transliteration (UA Cyrillic → Latin) ────────────────────────────────────

const UA_TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", ґ: "g", д: "d", е: "e", є: "ye", ж: "zh",
  з: "z", и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "yu", я: "ya",
};

export function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((c) => UA_TRANSLIT[c] ?? c)
    .join("");
}

function normalise(s: string): string {
  return transliterate(s).replace(/[-\s_]+/g, " ").trim();
}

/** Simple edit distance for fuzzy matching. */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
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

function similarityScore(a: string, b: string): number {
  const na = normalise(a), nb = normalise(b);
  if (na === nb) return 1.0;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return 1.0;
  return 1 - levenshtein(na, nb) / maxLen;
}

// ── In-memory KG stub (wire to Postgres in production) ────────────────────────

const KG_ENTITIES: KnowledgeGraphEntity[] = [
  {
    entityId: "eq-shahed-136",
    entityClass: "equipment",
    canonicalName: "Shahed-136",
    aliases: ["shahed 136", "герань-2", "geran-2", "шахед-136"],
    wikidataId: "Q113765555",
    countryCode: "IR",
    attributes: { type: "loitering_munition", range_km: 2500, warhead_kg: 50 },
    confidence: 1.0,
    firstSeenAt: "2022-09-13T00:00:00Z",
    lastUpdatedAt: new Date().toISOString(),
    mentionEventIds: [],
  },
  {
    entityId: "eq-kinzhal",
    entityClass: "equipment",
    canonicalName: "Kh-47 Kinzhal",
    aliases: ["кинджал", "kinzhal", "кинжал", "kh-47"],
    wikidataId: "Q29478658",
    countryCode: "RU",
    attributes: { type: "hypersonic_missile", range_km: 2000, max_speed_mach: 10 },
    confidence: 1.0,
    firstSeenAt: "2018-03-01T00:00:00Z",
    lastUpdatedAt: new Date().toISOString(),
    mentionEventIds: [],
  },
  {
    entityId: "eq-patriot",
    entityClass: "equipment",
    canonicalName: "Patriot PAC-3",
    aliases: ["patriot", "pac-3", "mim-104"],
    wikidataId: "Q202705",
    countryCode: "US",
    attributes: { type: "air_defense", range_km: 160 },
    confidence: 1.0,
    firstSeenAt: "1984-01-01T00:00:00Z",
    lastUpdatedAt: new Date().toISOString(),
    mentionEventIds: [],
  },
];

const _kgIndex = new Map<string, KnowledgeGraphEntity>(KG_ENTITIES.map((e) => [e.entityId, e]));

export function addKgEntity(entity: KnowledgeGraphEntity): void {
  _kgIndex.set(entity.entityId, entity);
  KG_ENTITIES.push(entity);
}

/** Find candidate KG entities for a mention text. */
export function findCandidates(
  mentionText: string,
  entityClass: string,
  topK = 3,
): Array<{ entityId: string; canonicalName: string; score: number; isNewEntity: boolean }> {
  const candidates: Array<{ entityId: string; canonicalName: string; score: number; isNewEntity: boolean }> = [];

  for (const entity of _kgIndex.values()) {
    if (entity.entityClass !== entityClass) continue;
    const scores = [
      similarityScore(mentionText, entity.canonicalName),
      ...entity.aliases.map((a) => similarityScore(mentionText, a)),
    ];
    const best = Math.max(...scores);
    if (best > 0.6) {
      candidates.push({ entityId: entity.entityId, canonicalName: entity.canonicalName, score: best, isNewEntity: false });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, topK);
}

/** Generate link proposals for all extracted mentions. */
export function generateLinkProposals(mentions: EntityMention[]): EntityLinkProposal[] {
  return mentions.map((mention) => {
    const candidates = findCandidates(mention.text, mention.entityClass);
    const topScore = candidates[0]?.score ?? 0;

    return {
      mention,
      candidates,
      requiresHumanReview: candidates.length === 0 || topScore < 0.85,
    };
  });
}
