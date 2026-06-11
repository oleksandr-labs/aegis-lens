/**
 * Severe-weather civilian advisories (TODO task 8).
 *
 * Translate an orange/red UHMC warning (or a danger-mark flood) into a plain,
 * action-oriented civilian advisory in EN + UK. Distinct from alert-push.ts:
 * push.ts owns delivery/transport; this owns the *advisory copy* — the
 * protective-action guidance shown in the safety UI and read aloud, written to
 * be calm, specific and non-alarming (civilian-safe).
 */

import type { SevereWarning, RiverGauge, WarningPhenomenon } from "./types";
import { OBLAST_GEO, WARNING_LEVEL_LABELS, FLOOD_RISK_LABELS } from "./types";

export interface CivilianAdvisory {
  advisoryId: string;
  oblast: string;
  /** "warning" | "flood" */
  kind: "warning" | "flood";
  severity: 1 | 2 | 3 | 4 | 5;
  headline: { en: string; uk: string };
  /** What is happening, plainly. */
  whatToExpect: { en: string; uk: string };
  /** Concrete protective action. */
  whatToDo: { en: string; uk: string };
  validUntil?: string;
  attribution: { en: string; uk: string };
}

/** Protective-action copy per phenomenon (calm, specific). */
const ACTION: Record<WarningPhenomenon, { en: string; uk: string }> = {
  wind: {
    en: "Secure loose objects, avoid trees, scaffolding and billboards, and take care when driving high-sided vehicles.",
    uk: "Закріпіть незакріплені предмети, тримайтеся подалі від дерев, риштувань і рекламних щитів, обережно керуйте високими авто.",
  },
  rain: {
    en: "Avoid low-lying areas and underpasses, do not drive through standing water, and allow extra travel time.",
    uk: "Уникайте низин і підземних переходів, не їдьте через калюжі, закладайте додатковий час на дорогу.",
  },
  thunderstorm: {
    en: "Stay indoors, unplug sensitive electronics, and avoid open ground, tall trees and water.",
    uk: "Залишайтеся в приміщенні, вимкніть чутливу електроніку, уникайте відкритих місць, високих дерев і води.",
  },
  snow: {
    en: "Limit non-essential travel, keep warm clothing and a charged phone, and check on vulnerable neighbours.",
    uk: "Обмежте необов'язкові поїздки, тримайте теплий одяг і заряджений телефон, перевірте вразливих сусідів.",
  },
  ice: {
    en: "Walk slowly on treated paths, wear non-slip footwear, and drive gently with extra braking distance.",
    uk: "Ходіть повільно обробленими доріжками, взуйте неслизьке взуття, кермуйте плавно зі збільшеною дистанцією.",
  },
  fog: {
    en: "Use low-beam headlights, increase following distance, and reduce speed.",
    uk: "Увімкніть ближнє світло, збільшіть дистанцію, знизьте швидкість.",
  },
  heat: {
    en: "Drink water regularly, avoid midday sun and exertion, and check on elderly relatives.",
    uk: "Пийте воду регулярно, уникайте полуденного сонця й навантажень, перевірте літніх родичів.",
  },
  frost: {
    en: "Protect plants and water pipes, and dress in layers for cold mornings.",
    uk: "Захистіть рослини й водопровід, вдягайтеся багатошарово в холодні ранки.",
  },
  flood: {
    en: "Move valuables and people away from riverbanks and low ground, and follow local evacuation guidance.",
    uk: "Перемістіть людей і цінне майно подалі від берегів і низин, дотримуйтеся вказівок щодо евакуації.",
  },
  fire_danger: {
    en: "Do not light fires outdoors, dispose of cigarettes safely, and report any smoke to emergency services.",
    uk: "Не розпалюйте вогнищ просто неба, гасіть недопалки, повідомляйте про дим у служби порятунку.",
  },
};

const EXPECT: Record<WarningPhenomenon, { en: string; uk: string }> = {
  wind:         { en: "Strong, gusty winds.",            uk: "Сильний, поривчастий вітер." },
  rain:         { en: "Heavy rainfall with local flooding.", uk: "Сильні дощі з локальними підтопленнями." },
  thunderstorm: { en: "Thunderstorms, possibly with hail.", uk: "Грози, можливий град." },
  snow:         { en: "Significant snowfall and drifting.", uk: "Значні снігопади, можливі замети." },
  ice:          { en: "Icy surfaces on roads and pavements.", uk: "Ожеледиця на дорогах і тротуарах." },
  fog:          { en: "Dense fog reducing visibility.",  uk: "Густий туман, погана видимість." },
  heat:         { en: "Extreme heat.",                   uk: "Аномальна спека." },
  frost:        { en: "Overnight frost.",                uk: "Нічні заморозки." },
  flood:        { en: "Rising river levels.",            uk: "Підйом рівня води в річках." },
  fire_danger:  { en: "Extreme fire danger.",            uk: "Надзвичайна пожежна небезпека." },
};

const ATTRIBUTION = {
  en: "Issued by the Ukrainian Hydrometeorological Center (meteo.gov.ua).",
  uk: "Видано Українським гідрометеорологічним центром (meteo.gov.ua).",
};

/** Build a civilian advisory from a severe-weather warning. */
export function warningToAdvisory(w: SevereWarning): CivilianAdvisory {
  const geo = OBLAST_GEO[w.oblast];
  const lvl = WARNING_LEVEL_LABELS[w.level];
  const severity = w.level === "red" ? 5 : w.level === "orange" ? 4 : 2;
  const expect = EXPECT[w.phenomenon];
  const action = ACTION[w.phenomenon];
  return {
    advisoryId: `advisory:${w.warningId}`,
    oblast: w.oblast,
    kind: "warning",
    severity,
    headline: {
      en: `${lvl.en} for ${geo.nameEn} Oblast`,
      uk: `${lvl.uk} для ${geo.nameUk} області`,
    },
    whatToExpect: expect,
    whatToDo: action,
    validUntil: w.expiresAt,
    attribution: ATTRIBUTION,
  };
}

/** Build a civilian advisory from an adverse/danger flood gauge. */
export function floodToAdvisory(g: RiverGauge): CivilianAdvisory {
  const geo = OBLAST_GEO[g.oblast];
  const band = FLOOD_RISK_LABELS[g.risk];
  return {
    advisoryId: `advisory:flood:${g.gaugeId}`,
    oblast: g.oblast,
    kind: "flood",
    severity: band.severity,
    headline: {
      en: `${band.en} — ${g.riverEn} near ${g.stationEn} (${geo.nameEn} Oblast)`,
      uk: `${band.uk} — р. ${g.riverUk} біля ${g.stationUk} (${geo.nameUk} область)`,
    },
    whatToExpect: {
      en: `Water level ${g.levelCm} cm (${g.changeCm24h >= 0 ? "+" : ""}${g.changeCm24h} cm in 24h), near the ${g.risk === "danger" ? "danger" : "adverse"} mark.`,
      uk: `Рівень води ${g.levelCm} см (${g.changeCm24h >= 0 ? "+" : ""}${g.changeCm24h} см за добу), біля ${g.risk === "danger" ? "небезпечної" : "несприятливої"} позначки.`,
    },
    whatToDo: ACTION.flood,
    attribution: ATTRIBUTION,
  };
}

/** Build advisories for all push-eligible warnings + flood alerts in a snapshot. */
export function buildAdvisories(
  warnings: SevereWarning[],
  floodAlerts: RiverGauge[],
): CivilianAdvisory[] {
  const out: CivilianAdvisory[] = [];
  for (const w of warnings) {
    if (w.level === "yellow") continue; // overlay-only; advisories are orange+
    out.push(warningToAdvisory(w));
  }
  for (const g of floodAlerts) out.push(floodToAdvisory(g));
  return out;
}
