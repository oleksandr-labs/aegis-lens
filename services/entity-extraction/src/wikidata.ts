/**
 * Wikidata cross-reference (`sameAs`) — codeable contract.
 *
 * Enriches canonical KG entities with a Wikidata Q-number so entity pages can link
 * out (`sameAs`) and pull stable multilingual labels / coordinates. The KG entity
 * type already carries an optional `wikidataId` (see types.ts) and the seed KG in
 * `linker.ts` populates it for known equipment; this module is the resolver that
 * fills it for new entities.
 *
 * NETWORK NOTE: live resolution hits the public Wikidata SPARQL/REST endpoint, which
 * we cannot call from this environment, so the deliverable is the typed client +
 * a small offline gazetteer fixture + a `resolveSameAs` that uses the fixture and
 * falls back to the live client when an endpoint is configured. ToS / attribution
 * (CC0 data, polite query rate) are documented in COMPLIANCE.md. The endpoint is
 * read from `process.env.WIKIDATA_SPARQL_ENDPOINT`; never hardcode secrets.
 */

import { EntityClass, KnowledgeGraphEntity } from "./types";
import { transliterate } from "./linker";

// ── sameAs result schema ───────────────────────────────────────────────────────

export interface WikidataMatch {
  /** Q-number, e.g. "Q113765555". */
  qid: string;
  label: string;
  description?: string;
  /** Wikidata "instance of" P31 values mapped to our class, for sanity-checking. */
  inferredClass?: EntityClass;
  /** 0-1 match confidence (label similarity + class agreement). */
  confidence: number;
  /** Canonical entity URL for `sameAs`. */
  url: string;
}

export interface SameAsResolution {
  /** Best match, if any cleared the confidence floor. */
  match?: WikidataMatch;
  /** All candidates considered (for HITL review of weak matches). */
  candidates: WikidataMatch[];
  /** Source of the resolution. */
  source: "fixture" | "sparql" | "none";
}

function qidUrl(qid: string): string {
  return `https://www.wikidata.org/entity/${qid}`;
}

// ── Offline gazetteer fixture (known high-frequency entities) ──────────────────

interface FixtureEntry {
  qid: string;
  label: string;
  description: string;
  entityClass: EntityClass;
  aliases: string[];
}

const WIKIDATA_FIXTURE: FixtureEntry[] = [
  { qid: "Q113765555", label: "Shahed-136", description: "Iranian loitering munition", entityClass: "equipment", aliases: ["shahed-136", "geran-2", "герань-2", "шахед-136"] },
  { qid: "Q29478658", label: "Kh-47M2 Kinzhal", description: "Russian air-launched ballistic missile", entityClass: "equipment", aliases: ["kinzhal", "кинджал", "kh-47"] },
  { qid: "Q202705", label: "MIM-104 Patriot", description: "US surface-to-air missile system", entityClass: "equipment", aliases: ["patriot", "pac-3", "mim-104"] },
  { qid: "Q1899", label: "Kyiv", description: "Capital of Ukraine", entityClass: "region", aliases: ["kyiv", "kiev", "київ"] },
  { qid: "Q42308", label: "Kharkiv", description: "City in Ukraine", entityClass: "region", aliases: ["kharkiv", "харків"] },
  { qid: "Q161024", label: "Odesa", description: "City in Ukraine", entityClass: "region", aliases: ["odesa", "odessa", "одеса"] },
  { qid: "Q200713", label: "Armed Forces of Ukraine", description: "Military of Ukraine", entityClass: "organisation", aliases: ["zsu", "зсу", "afu", "armed forces of ukraine"] },
];

function norm(s: string): string {
  return transliterate(s).replace(/[-\s_.]+/g, " ").trim();
}

function scoreFixture(query: string, entry: FixtureEntry): number {
  const q = norm(query);
  const targets = [entry.label, ...entry.aliases].map(norm);
  if (targets.includes(q)) return 1;
  // containment partial credit
  const partial = targets.some((t) => t.includes(q) || q.includes(t));
  return partial ? 0.7 : 0;
}

// ── Live SPARQL client (contract) ───────────────────────────────────────────────

/**
 * Minimal Wikidata SPARQL client. Live network is unavailable here, so this is the
 * documented contract: it issues a label-search query, maps rows to `WikidataMatch`,
 * and returns `[]` on any failure (callers then keep the fixture / leave unlinked).
 */
export class WikidataClient {
  constructor(
    private readonly endpoint = process.env.WIKIDATA_SPARQL_ENDPOINT ?? "https://query.wikidata.org/sparql",
    private readonly userAgent = "AegisLens/1.0 (OSINT KG enrichment; contact ops@aegislens)",
  ) {}

  async search(label: string, _entityClass: EntityClass, limit = 5): Promise<WikidataMatch[]> {
    const query = buildLabelSearchSparql(label, limit);
    try {
      const url = `${this.endpoint}?query=${encodeURIComponent(query)}&format=json`;
      const res = await fetch(url, { headers: { "User-Agent": this.userAgent, Accept: "application/sparql-results+json" } });
      if (!res.ok) return [];
      const json = (await res.json()) as {
        results: { bindings: Array<{ item: { value: string }; itemLabel?: { value: string }; itemDescription?: { value: string } }> };
      };
      return json.results.bindings.map((b) => {
        const qid = b.item.value.split("/").pop() ?? "";
        return {
          qid,
          label: b.itemLabel?.value ?? label,
          description: b.itemDescription?.value,
          confidence: 0.6,
          url: qidUrl(qid),
        };
      });
    } catch {
      return [];
    }
  }
}

/** Build a label-search SPARQL query (kept inspectable for COMPLIANCE review). */
export function buildLabelSearchSparql(label: string, limit: number): string {
  const safe = label.replace(/["\\]/g, "");
  return `SELECT ?item ?itemLabel ?itemDescription WHERE {
  ?item rdfs:label ?label .
  FILTER(LCASE(STR(?label)) = LCASE("${safe}"))
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,uk". }
} LIMIT ${limit}`;
}

// ── Resolver ───────────────────────────────────────────────────────────────────

export interface SameAsOptions {
  /** Minimum confidence to auto-attach the match (else surfaced for review). */
  minConfidence?: number;
  /** Optional live client; if omitted, only the fixture is consulted. */
  client?: WikidataClient;
}

/**
 * Resolve a `sameAs` Wikidata match for a label + class.
 * Strategy: fixture first (deterministic, offline); if no fixture hit and a live
 * client is supplied, query SPARQL. Returns candidates + the chosen match.
 */
export async function resolveSameAs(
  label: string,
  entityClass: EntityClass,
  opts: SameAsOptions = {},
): Promise<SameAsResolution> {
  const minConfidence = opts.minConfidence ?? 0.85;

  // 1) fixture
  const fixtureCandidates: WikidataMatch[] = WIKIDATA_FIXTURE.filter((e) => e.entityClass === entityClass)
    .map((e) => ({ entry: e, score: scoreFixture(label, e) }))
    .filter(({ score }) => score > 0)
    .map(({ entry, score }) => ({
      qid: entry.qid,
      label: entry.label,
      description: entry.description,
      inferredClass: entry.entityClass,
      confidence: score,
      url: qidUrl(entry.qid),
    }))
    .sort((a, b) => b.confidence - a.confidence);

  if (fixtureCandidates.length > 0) {
    const top = fixtureCandidates[0];
    return { match: top.confidence >= minConfidence ? top : undefined, candidates: fixtureCandidates, source: "fixture" };
  }

  // 2) live SPARQL (when available)
  if (opts.client) {
    const live = await opts.client.search(label, entityClass);
    if (live.length > 0) {
      const top = live[0];
      return { match: top.confidence >= minConfidence ? top : undefined, candidates: live, source: "sparql" };
    }
  }

  return { candidates: [], source: "none" };
}

/**
 * Attach a resolved Wikidata id to a KG entity (`sameAs`). Pure — returns a new
 * entity; only sets `wikidataId` when a confident match exists and the field is
 * currently empty (never overwrites a curated id).
 */
export async function enrichWithWikidata(
  entity: KnowledgeGraphEntity,
  opts?: SameAsOptions,
): Promise<{ entity: KnowledgeGraphEntity; resolution: SameAsResolution }> {
  const resolution = await resolveSameAs(entity.canonicalName, entity.entityClass, opts);
  if (entity.wikidataId || !resolution.match) return { entity, resolution };
  return {
    entity: { ...entity, wikidataId: resolution.match.qid, lastUpdatedAt: new Date().toISOString() },
    resolution,
  };
}
