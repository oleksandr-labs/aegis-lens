/**
 * Daily-summary parser (task 6).
 *
 * Parses the standardized General Staff daily report ("оперативна інформація")
 * into typed fields: enemy loss tallies (cumulative total + 24h delta),
 * frontline directions with activity, total engagements, and referenced regions.
 *
 * NEUTRALITY: figures are extracted VERBATIM as officially reported. Numbers
 * that cannot be parsed are left out and `partial` is set — we never guess or
 * round. The parser does not assert the figures are independently verified; it
 * structures the official claim for downstream presentation + citation.
 */

import type {
  FrontlineActivity,
  GenStaffDailySummary,
  LossCategory,
  LossTally,
  OblastCode,
  RawOfficialPost,
} from "./types";
import { LOSS_CATEGORY_META } from "./types";
import { OBLASTS, resolveOblasts } from "./sources";

/** Ukrainian keyword stems mapped to canonical loss categories (order matters:
 *  more specific stems first so "бойових броньованих" wins over "машин"). */
const LOSS_KEYWORDS: Array<{ category: LossCategory; stems: string[] }> = [
  { category: "personnel",        stems: ["особового складу", "особовий склад"] },
  { category: "tanks",            stems: ["танків", "танки"] },
  { category: "afv",              stems: ["бойових броньованих машин", "ббм", "броньованих машин"] },
  { category: "artillery",        stems: ["артилерійських систем", "артилерійські системи"] },
  { category: "mlrs",             stems: ["рсзв"] },
  { category: "air_defense",      stems: ["засобів ппо", "засоби ппо", "ппо"] },
  { category: "aircraft",         stems: ["літаків", "літаки"] },
  { category: "helicopters",      stems: ["гелікоптерів", "гелікоптери", "вертольот"] },
  { category: "uav",              stems: ["бпла"] },
  { category: "cruise_missiles",  stems: ["крилатих ракет", "крилаті ракети"] },
  { category: "ships_boats",      stems: ["кораблів / катерів", "кораблів", "катерів"] },
  { category: "submarines",       stems: ["підводних човнів", "підводні човни"] },
  { category: "vehicles_fuel",    stems: ["автомобільної техніки", "автоцистерн", "автомобільна техніка"] },
  { category: "special_equipment",stems: ["спеціальної техніки", "спеціальна техніка"] },
];

/**
 * Extract `{ total, delta }` from the segment that follows a loss keyword.
 * Handles the standard "— 8124 (+9)" / "близько 720940 (+1180) осіб" wording.
 */
function parseLossSegment(text: string, stem: string): LossTally | undefined {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(stem);
  if (idx === -1) return undefined;
  // Window after the keyword, BOUNDED to this line item: each item in the
  // standard report ends with a comma, newline, semicolon, or final period.
  // Bounding stops a missing "(+N)" from borrowing the next item's delta.
  const rest = text.slice(idx + stem.length, idx + stem.length + 80);
  const boundary = rest.search(/[,\n;]|\.\s|\.$/u);
  const after = boundary === -1 ? rest : rest.slice(0, boundary);
  // First number = cumulative total (may contain spaces as thousands sep).
  const totalMatch = /[—\-:]?\s*(?:близько\s*)?(\d[\d\s ]{0,9}\d|\d)/u.exec(after);
  if (!totalMatch) return undefined;
  const total = parseInt(totalMatch[1].replace(/[\s ]/g, ""), 10);
  if (Number.isNaN(total)) return undefined;
  // Optional delta in parentheses: (+74) or (-1) or (+0).
  let delta: number | undefined;
  const deltaMatch = /\(\s*([+\-]?\d[\d\s ]*)\s*\)/u.exec(after);
  if (deltaMatch) {
    const d = parseInt(deltaMatch[1].replace(/[\s ]/g, ""), 10);
    if (!Number.isNaN(d)) delta = d;
  }
  return { category: stemCategory(stem), total, delta };
}

function stemCategory(stem: string): LossCategory {
  for (const k of LOSS_KEYWORDS) if (k.stems.includes(stem)) return k.category;
  return "special_equipment";
}

/** Parse all loss tallies present in the report (one per category). */
export function parseLosses(text: string): { losses: LossTally[]; missed: number } {
  const losses: LossTally[] = [];
  let missed = 0;
  for (const { stems } of LOSS_KEYWORDS) {
    let got: LossTally | undefined;
    for (const stem of stems) {
      got = parseLossSegment(text, stem);
      if (got) break;
    }
    if (got) losses.push(got);
    else missed++;
  }
  return { losses, missed };
}

/** Direction-name → oblast hints (the напрямок often names an oblast). */
const DIRECTION_EN: Record<string, string> = {
  покровськ: "Pokrovsk",
  лиманськ: "Lyman",
  купʼянськ: "Kupiansk",
  куп'янськ: "Kupiansk",
  бахмутськ: "Bakhmut",
  запорізьк: "Zaporizhzhia",
  херсонськ: "Kherson",
  торецьк: "Toretsk",
  південно: "Southern",
};

/** Parse "На <X> напрямку … відбито N атак" lines into FrontlineActivity. */
export function parseDirections(text: string): FrontlineActivity[] {
  const out: FrontlineActivity[] = [];
  const re = /На\s+([А-ЯІЇЄҐа-яіїєґʼ'\-]+)\s+напрямку([^\n]*)/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const directionUk = `${m[1]} напрямок`;
    const tail = m[2] ?? "";
    const engMatch = /(?:відбит|відбили|здійснив|зафіксовано)[^0-9]{0,20}(\d{1,3})\s*(?:атак|штурм|спроб|зіткн)/u.exec(tail);
    const engagements = engMatch ? parseInt(engMatch[1], 10) : undefined;
    const key = m[1].toLowerCase().slice(0, 8);
    let directionEn: string | undefined;
    for (const [stem, en] of Object.entries(DIRECTION_EN)) {
      if (key.startsWith(stem.slice(0, 7))) { directionEn = `${en} direction`; break; }
    }
    const obl = resolveOblasts(tail);
    out.push({
      directionUk,
      directionEn,
      engagements,
      noteUk: tail.trim().replace(/^[,\s—-]+/, "").slice(0, 160) || undefined,
      oblast: obl[0],
    });
  }
  return out;
}

/** Total engagements over the period, if stated ("відбулося 152 бойових зіткнення"). */
export function parseTotalEngagements(text: string): number | undefined {
  const m = /(\d{1,4})\s*бойов[а-яіїєґ]*\s*зіткнен/u.exec(text);
  if (!m) return undefined;
  const n = parseInt(m[1], 10);
  return Number.isNaN(n) ? undefined : n;
}

/** Parse a raw General Staff daily-summary post into structured fields. */
export function parseDailySummary(
  post: RawOfficialPost,
  opts: { date?: string } = {},
): GenStaffDailySummary {
  const text = `${post.titleUk ?? ""}\n${post.text}`;
  const date = opts.date ?? post.publishedAt.slice(0, 10);

  const { losses, missed } = parseLosses(text);
  const directions = parseDirections(text);
  const totalEngagements = parseTotalEngagements(text);

  // Regions = oblasts referenced anywhere + those resolved per direction.
  const regionSet = new Set<OblastCode>(resolveOblasts(text));
  for (const d of directions) if (d.oblast) regionSet.add(d.oblast);
  const regions = [...regionSet];

  const personnel = losses.find((l) => l.category === "personnel");
  const regionNamesUk = regions.map((r) => OBLASTS[r].nameUk).join(", ");
  const regionNamesEn = regions.map((r) => OBLASTS[r].nameEn).join(", ");

  const summary = {
    uk:
      `Зведення Генштабу ЗСУ за ${date} (офіційні дані): ` +
      [
        totalEngagements !== undefined ? `${totalEngagements} бойових зіткнень` : null,
        personnel ? `втрати о/с ${personnel.total.toLocaleString("uk-UA")}${personnel.delta !== undefined ? ` (+${personnel.delta})` : ""}` : null,
        directions.length ? `${directions.length} напрямків` : null,
        regionNamesUk ? `регіони: ${regionNamesUk}` : null,
      ].filter(Boolean).join("; ") + ".",
    en:
      `General Staff daily summary for ${date} (figures as officially reported): ` +
      [
        totalEngagements !== undefined ? `${totalEngagements} combat engagements` : null,
        personnel ? `reported personnel losses ${personnel.total.toLocaleString("en-US")}${personnel.delta !== undefined ? ` (+${personnel.delta})` : ""}` : null,
        directions.length ? `${directions.length} frontline directions` : null,
        regionNamesEn ? `regions: ${regionNamesEn}` : null,
      ].filter(Boolean).join("; ") + ".",
    de:
      `Generalstab-Tagesbericht für ${date} (offiziell gemeldete Zahlen): ` +
      [
        totalEngagements !== undefined ? `${totalEngagements} Gefechte` : null,
        personnel ? `gemeldete Personalverluste ${personnel.total.toLocaleString("de-DE")}${personnel.delta !== undefined ? ` (+${personnel.delta})` : ""}` : null,
        directions.length ? `${directions.length} Frontabschnitte` : null,
        regionNamesEn ? `Regionen: ${regionNamesEn}` : null,
      ].filter(Boolean).join("; ") + ".",
  };

  return {
    date,
    url: post.url,
    sourceChannelId: post.channelId,
    losses,
    directions,
    totalEngagements,
    regions,
    summary,
    partial: missed > 0,
  };
}

/** Human-readable label set for a loss category (uk/en/de). */
export function lossLabel(category: LossCategory): { uk: string; en: string; de: string } {
  const m = LOSS_CATEGORY_META[category];
  return { uk: m.labelUk, en: m.labelEn, de: m.labelDe };
}
