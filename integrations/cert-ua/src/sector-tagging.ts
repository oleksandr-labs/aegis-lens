/**
 * Per-sector tagging for cyber advisories.
 *
 * Classifies which critical-infrastructure sector(s) an advisory concerns
 * (energy / telecom / finance / gov / media / transport / defense / healthcare)
 * using bilingual (UK + EN) keyword matching over the title + body. Also infers
 * a coarse region set where an oblast is explicitly named.
 *
 * This is a heuristic enrichment — explicit sector/region values already present
 * on the advisory (e.g. from the demo fixture or manual curation) take priority.
 */

import type { CertAdvisory, Sector, RegionCode } from "./types";
import { CYBER_REGIONS } from "./types";

const SECTOR_KEYWORDS: Record<Sector, string[]> = {
  energy: [
    "енерг", "електро", "обленерго", "укренерго", "тец", "аес", "підстанц", "генерац", "теплопостач",
    "energy", "power grid", "electric", "substation", "nuclear plant", "utility",
  ],
  telecom: [
    "телеком", "зв'язк", "зв язк", "оператор", "інтернет-провайдер", "провайдер", "мобільн",
    "telecom", "internet provider", "isp", "mobile operator", "cellular",
  ],
  finance: [
    "банк", "фінанс", "платіж", "платіжн", "приватбанк", "ощадбанк", "нбу",
    "bank", "financ", "payment", "fintech", "card",
  ],
  gov: [
    "держав", "урядов", "міністерств", "відомств", "органи влади", "муніципал", "держспецзв",
    "government", "ministry", "state agency", "municipal", "public sector",
  ],
  media: [
    "медіа", "змі", "телеканал", "редакц", "новин", "мовлення", "журналіст",
    "media", "broadcaster", "newsroom", "tv channel", "press",
  ],
  transport: [
    "транспорт", "залізниц", "укрзалізниц", "аеропорт", "логістик", "порт",
    "transport", "railway", "airport", "logistics", "seaport",
  ],
  defense: [
    "оборон", "військов", "зсу", "армі", "генштаб",
    "defense", "defence", "military", "armed forces",
  ],
  healthcare: [
    "медичн", "лікарн", "охорони здоров", "моз",
    "healthcare", "hospital", "medical",
  ],
  other: [],
};

const REGION_KEYWORDS: Array<{ code: RegionCode; kw: string[] }> = Object.values(CYBER_REGIONS)
  .filter((r) => r.code !== "UA-ALL")
  .map((r) => ({
    code: r.code,
    kw: [r.nameUk.toLowerCase(), r.nameEn.toLowerCase()],
  }));

/** Detect sectors mentioned in free text. */
export function detectSectors(text: string): Sector[] {
  const lower = text.toLowerCase();
  const hits: Sector[] = [];
  for (const sector of Object.keys(SECTOR_KEYWORDS) as Sector[]) {
    if (sector === "other") continue;
    if (SECTOR_KEYWORDS[sector].some((kw) => lower.includes(kw))) hits.push(sector);
  }
  return hits.length > 0 ? hits : ["other"];
}

/** Detect explicitly-named regions; defaults to nationwide. */
export function detectRegions(text: string): RegionCode[] {
  const lower = text.toLowerCase();
  const hits = REGION_KEYWORDS.filter((r) => r.kw.some((k) => k && lower.includes(k))).map((r) => r.code);
  return hits.length > 0 ? hits : ["UA-ALL"];
}

/**
 * Tag an advisory with sectors + regions. Honors any explicit non-empty values
 * already present; otherwise infers from the text.
 */
export function tagAdvisory(adv: CertAdvisory): CertAdvisory {
  const text = `${adv.titleUk} ${adv.titleEn ?? ""} ${adv.bodyText}`;
  const sectors = adv.sectors && adv.sectors.length > 0 ? adv.sectors : detectSectors(text);
  const regions = adv.regions && adv.regions.length > 0 ? adv.regions : detectRegions(text);
  return { ...adv, sectors, regions };
}
