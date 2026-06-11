/**
 * Task 7 — NER → linked to the UA admin hierarchy + Knowledge Graph (KG).
 *
 * OVA posts name places (raions, hromadas, cities, districts) and entities
 * (units, infrastructure). We extract them and resolve toponyms onto the
 * canonical admin hierarchy (oblast → raion → hromada), reusing the oblast
 * registry already shared via `@ua-map/civilian-alerts` (OBLASTS) — the same key
 * `@ua-map/alerts-in-ua → admin-hierarchy.ts` uses, so resolved regionCodes line
 * up across the platform.
 *
 * This is a LIGHTWEIGHT, deterministic seam: a gazetteer-driven matcher with a
 * pluggable `NerProvider` for a real model. Each mention is emitted as a KG node
 * reference (`kg:<type>:<id>`) so downstream the KG can attach the post to the
 * correct geography/entity. The post's own oblast is always known (which channel
 * posted it), giving a guaranteed oblast anchor even when no toponym matches.
 */

import type { OblastCode, OvaPost } from "./types";
import { OBLASTS } from "./types";

export type EntityType = "oblast" | "raion" | "hromada" | "city" | "facility" | "org";

export interface NamedEntity {
  text: string; // surface form as it appeared
  type: EntityType;
  /** KG node reference, e.g. "kg:oblast:UA-63" or "kg:city:kharkiv". */
  kgRef: string;
  /** Resolved oblast for geo entities, if determinable. */
  oblastCode?: OblastCode;
  /** Character offset in the source text. */
  offset?: number;
}

export interface AdminLink {
  oblastCode: OblastCode;
  oblastNameUk: string;
  oblastNameEn: string;
  /** WGS-84 centroid [lon, lat] (oblast-level anchor). */
  center?: [number, number];
  /** Finer mentions resolved within the oblast. */
  mentions: NamedEntity[];
}

export interface NerResult {
  postId: string;
  entities: NamedEntity[];
  adminLink: AdminLink;
}

export interface NerProvider {
  readonly id: string;
  extract(text: string): NamedEntity[];
}

/**
 * Small seed gazetteer of major cities → oblast. Extendable as data. The real
 * system would load the full KATOTTG gazetteer; this gives deterministic links
 * for the highest-signal toponyms without a model dependency.
 */
const CITY_GAZETTEER: Array<{ uk: string; en: string; oblast: OblastCode }> = [
  { uk: "Харків", en: "kharkiv", oblast: "UA-63" },
  { uk: "Київ", en: "kyiv", oblast: "UA-30" },
  { uk: "Одеса", en: "odesa", oblast: "UA-51" },
  { uk: "Дніпро", en: "dnipro", oblast: "UA-12" },
  { uk: "Львів", en: "lviv", oblast: "UA-46" },
  { uk: "Запоріжжя", en: "zaporizhzhia", oblast: "UA-23" },
  { uk: "Херсон", en: "kherson", oblast: "UA-65" },
  { uk: "Миколаїв", en: "mykolaiv", oblast: "UA-48" },
  { uk: "Суми", en: "sumy", oblast: "UA-59" },
  { uk: "Чернігів", en: "chernihiv", oblast: "UA-74" },
];

/** Default gazetteer NER: matches known cities + the "<...>ський район" pattern. */
export const gazetteerNer: NerProvider = {
  id: "gazetteer-v1",
  extract(text: string): NamedEntity[] {
    const out: NamedEntity[] = [];

    for (const c of CITY_GAZETTEER) {
      const idx = text.indexOf(c.uk);
      if (idx >= 0) {
        out.push({
          text: c.uk,
          type: "city",
          kgRef: `kg:city:${c.en}`,
          oblastCode: c.oblast,
          offset: idx,
        });
      }
    }

    // Raion mentions: "<Name>ського району" / "<Name>ський район".
    const raionRe = /([А-ЯІЇЄҐ][а-яіїєґ'-]+)сь?к(?:ого|ий)\s+район[уі]?/g;
    let m: RegExpExecArray | null;
    while ((m = raionRe.exec(text)) !== null) {
      out.push({
        text: m[0],
        type: "raion",
        kgRef: `kg:raion:${m[1].toLowerCase()}`,
        offset: m.index,
      });
    }

    return out;
  },
};

let active: NerProvider = gazetteerNer;
export function setNerProvider(p: NerProvider): void {
  active = p;
}

/**
 * Extract entities from a post and link to the admin hierarchy. The oblast is
 * always known from the channel, so `adminLink` is guaranteed; toponym mentions
 * refine it.
 */
export function nerLink(post: OvaPost, provider: NerProvider = active): NerResult {
  const info = OBLASTS[post.oblastCode];
  const entities = provider.extract(post.textUk);

  // Always include the channel's oblast as the anchoring KG node.
  const oblastEntity: NamedEntity = {
    text: info?.nameUk ?? post.oblastCode,
    type: "oblast",
    kgRef: `kg:oblast:${post.oblastCode}`,
    oblastCode: post.oblastCode,
  };

  return {
    postId: post.postId,
    entities: [oblastEntity, ...entities],
    adminLink: {
      oblastCode: post.oblastCode,
      oblastNameUk: info?.nameUk ?? post.oblastCode,
      oblastNameEn: info?.nameEn ?? post.oblastCode,
      center: info?.center,
      mentions: entities,
    },
  };
}
