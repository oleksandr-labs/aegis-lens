/**
 * Press-release ingest with NER + KG enrichment (task 7).
 *
 * Runs a conservative, dictionary + pattern-based named-entity recogniser over a
 * press release (MoD / branch) and links recognised entities to knowledge-graph
 * node ids so downstream services can build edges (e.g. unit → settlement,
 * weapon_system → press_release). This is a heuristic NER suitable as a codeable
 * contract; a production deployment would swap in a UA-language NER model behind
 * the same interface.
 *
 * NEUTRALITY: enrichment annotates WHO/WHAT/WHERE the official text names; it
 * adds no interpretation or assessment of the claims.
 */

import type {
  EnrichedPressRelease,
  EntityType,
  NamedEntity,
  OblastCode,
  RawOfficialPost,
} from "./types";
import { OBLASTS, resolveOblasts } from "./sources";

/** A KG node id is `${type}:${slug}` — stable + greppable. */
function kgId(type: EntityType, surface: string): string {
  const slug = surface
    .toLowerCase()
    .replace(/['ʼ`]/g, "")
    .replace(/[^a-zа-яіїєґ0-9]+/giu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${type}:${slug}`;
}

/** Weapon-system surface forms → canonical KG slug. */
const WEAPON_SYSTEMS: Array<{ re: RegExp; canon: string }> = [
  { re: /shahed|шахед|герань/iu, canon: "shahed-136" },
  { re: /калібр|kalibr/iu, canon: "kalibr" },
  { re: /іскандер|искандер|iskander/iu, canon: "iskander" },
  { re: /бпла|безпілотн|дрон/iu, canon: "uav" },
  { re: /himars|хаймарс/iu, canon: "himars" },
  { re: /patriot|петріот/iu, canon: "patriot" },
  { re: /крилат[аиоі]+\s+ракет/iu, canon: "cruise-missile" },
  { re: /балістичн/iu, canon: "ballistic-missile" },
];

/** Match military unit references like "47-ї окремої механізованої бригади". */
const UNIT_RE = /\b(\d{1,4})[-–]?[їа]?\s+(?:окрем[аоіої]+\s+)?(механізован|штурмов|десантн|танков|аеромобільн|бригад|полку?)[а-яіїєґ]*\s*(бригад[аиіи]?|полк[уа]?|батальйон)?/giu;

/** Country references. */
const COUNTRIES: Array<{ re: RegExp; canon: string; nameUk: string }> = [
  { re: /росі[яйї]|рф\b|російськ/iu, canon: "russia", nameUk: "Росія" },
  { re: /україн/iu, canon: "ukraine", nameUk: "Україна" },
];

/** Organization references (the authorities themselves). */
const ORGS: Array<{ re: RegExp; canon: string }> = [
  { re: /міністерств[оа]\s+оборони|міноборони/iu, canon: "mod-ua" },
  { re: /генеральн[ио]+\s+штаб|генштаб/iu, canon: "general-staff-ua" },
  { re: /повітрян[іих]+\s+сил/iu, canon: "air-force-ua" },
  { re: /військово[-\s]морськ/iu, canon: "navy-ua" },
];

/** Run NER over a Ukrainian press text. Conservative, offset-tagged. */
export function extractEntities(text: string): NamedEntity[] {
  const entities: NamedEntity[] = [];
  const push = (type: EntityType, surface: string, offset: number, extra: Partial<NamedEntity> = {}) => {
    entities.push({ type, textUk: surface, offset, ...extra });
  };

  // Oblasts (settlement-level resolution reuses the oblast resolver).
  for (const code of resolveOblasts(text) as OblastCode[]) {
    const info = OBLASTS[code];
    const stem = info.nameUk.replace(/(ська|зька|цька)$/u, "");
    const off = text.toLowerCase().indexOf(stem.toLowerCase());
    push("oblast", info.nameUk, Math.max(0, off), { kgId: `oblast:${code}`, oblast: code });
  }

  // Weapon systems.
  for (const w of WEAPON_SYSTEMS) {
    const m = w.re.exec(text);
    if (m) push("weapon_system", m[0], m.index, { kgId: `weapon_system:${w.canon}` });
  }

  // Units.
  let um: RegExpExecArray | null;
  const unitRe = new RegExp(UNIT_RE.source, "giu");
  while ((um = unitRe.exec(text)) !== null) {
    push("unit", um[0].trim().replace(/\s+/g, " "), um.index, { kgId: kgId("unit", um[0]) });
  }

  // Countries.
  for (const c of COUNTRIES) {
    const m = c.re.exec(text);
    if (m) push("country", c.nameUk, m.index, { kgId: `country:${c.canon}` });
  }

  // Organizations.
  for (const o of ORGS) {
    const m = o.re.exec(text);
    if (m) push("organization", m[0], m.index, { kgId: `organization:${o.canon}` });
  }

  // Dedupe by (type + kgId), keep earliest offset.
  const byKey = new Map<string, NamedEntity>();
  for (const e of entities) {
    const key = `${e.type}|${e.kgId ?? e.textUk}`;
    const prev = byKey.get(key);
    if (!prev || (e.offset ?? Infinity) < (prev.offset ?? Infinity)) byKey.set(key, e);
  }
  return [...byKey.values()].sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0));
}

/** Ingest + enrich a press release. */
export function ingestPressRelease(post: RawOfficialPost): EnrichedPressRelease {
  const text = post.text;
  const entities = extractEntities(`${post.titleUk ?? ""}\n${text}`);
  const regions = [...new Set(entities.filter((e) => e.oblast).map((e) => e.oblast!))];
  const kgNodeIds = [...new Set(entities.map((e) => e.kgId).filter((x): x is string => !!x))];

  const regionEn = regions.map((r) => OBLASTS[r].nameEn).join(", ");
  const summary = {
    uk:
      `Прес-реліз (${post.branch === "mod" ? "Міноборони" : "офіційне джерело"}): ` +
      (post.titleUk ?? text.slice(0, 140)) +
      (regions.length ? ` Регіони: ${regions.map((r) => OBLASTS[r].nameUk).join(", ")}.` : ""),
    en:
      `Press release (${post.branch === "mod" ? "MoD" : "official source"}): ` +
      (post.titleUk ?? text.slice(0, 140)) +
      (regionEn ? ` Regions: ${regionEn}.` : ""),
    de:
      `Pressemitteilung (${post.branch === "mod" ? "Verteidigungsministerium" : "offizielle Quelle"}): ` +
      (post.titleUk ?? text.slice(0, 140)) +
      (regionEn ? ` Regionen: ${regionEn}.` : ""),
  };

  return {
    id: post.id,
    branch: post.branch,
    publishedAt: post.publishedAt,
    url: post.url,
    titleUk: post.titleUk,
    text,
    entities,
    regions,
    kgNodeIds,
    summary,
  };
}
