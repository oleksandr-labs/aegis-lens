/**
 * Civilian guidance integration — evacuation-order extraction + plain-language
 * safety guidance (uk + en).
 *
 * DSNS reports frequently carry actionable instructions for civilians:
 * evacuation orders, "do not approach suspicious objects", shelter advice, etc.
 * This module detects an evacuation order in a report and renders concise,
 * plain-language guidance keyed to the emergency type, so the product can show
 * a "what to do" panel alongside the map marker.
 *
 * Guidance text is intentionally generic and conservative; it is NOT a
 * substitute for official DSNS instructions, and the UI must link back to the
 * source. See COMPLIANCE.md (no medical/legal advice; signpost official channels).
 */

import type { EmergencyType } from "./types";

export interface EvacuationDetection {
  ordered: boolean;
  /** 0–1 confidence the report contains a genuine evacuation order. */
  confidence: number;
  /** Matched phrase(s), for audit. */
  matched: string[];
}

const EVAC_KEYWORDS = [
  "евакуац", "евакуй", "відселен", "негайно залиш", "покин",
  "evacuat", "leave the area", "leave immediately",
];

/** Detect whether a report contains an evacuation order. */
export function detectEvacuationOrder(text: string): EvacuationDetection {
  const lower = text.toLowerCase();
  const matched = EVAC_KEYWORDS.filter((k) => lower.includes(k));
  if (matched.length === 0) return { ordered: false, confidence: 0, matched: [] };
  // "Оголошено евакуацію" / "evacuation announced" → strong signal.
  const strong = /оголош\w*\s+евакуац|announce\w*\s+evacuat/i.test(text);
  return { ordered: true, confidence: strong ? 0.9 : 0.7, matched };
}

export interface CivilianGuidance {
  type: EmergencyType;
  /** Headline instruction. */
  headline: { en: string; uk: string };
  /** Ordered, plain-language steps. */
  steps: Array<{ en: string; uk: string }>;
  /** Official DSNS channel signpost. */
  source: { en: string; uk: string };
}

const OFFICIAL_SIGNPOST = {
  en: "Follow official DSNS instructions and local authorities. Emergency line: 101.",
  uk: "Дотримуйтесь офіційних вказівок ДСНС та місцевої влади. Лінія порятунку: 101.",
};

const GUIDANCE: Partial<Record<EmergencyType, Omit<CivilianGuidance, "type" | "source">>> = {
  demining: {
    headline: {
      en: "Explosive ordnance in the area",
      uk: "У районі вибухонебезпечні предмети",
    },
    steps: [
      { en: "Do not touch or move any suspicious object.", uk: "Не торкайтесь і не переміщуйте підозрілі предмети." },
      { en: "Keep a safe distance and warn others.", uk: "Тримайтеся на безпечній відстані та попередьте інших." },
      { en: "Report the location to DSNS (101) or police (102).", uk: "Повідомте про місце ДСНС (101) або поліції (102)." },
    ],
  },
  fire: {
    headline: { en: "Fire nearby", uk: "Пожежа поблизу" },
    steps: [
      { en: "Move away from smoke; keep low if indoors.", uk: "Відійдіть від диму; у приміщенні тримайтеся ближче до підлоги." },
      { en: "Do not use lifts; use stairs to evacuate.", uk: "Не користуйтеся ліфтом; евакуюйтеся сходами." },
      { en: "Call 101 and report trapped people.", uk: "Телефонуйте 101 та повідомте про людей у пастці." },
    ],
  },
  explosion: {
    headline: { en: "Explosion — secondary hazards possible", uk: "Вибух — можливі вторинні небезпеки" },
    steps: [
      { en: "Take cover; beware of falling debris and gas leaks.", uk: "Укрийтеся; стережіться уламків та витоку газу." },
      { en: "Do not return to damaged buildings.", uk: "Не повертайтеся до пошкоджених будівель." },
      { en: "Await DSNS clearance before approaching.", uk: "Чекайте на дозвіл ДСНС, перш ніж наближатися." },
    ],
  },
  collapse: {
    headline: { en: "Building collapse — rescue in progress", uk: "Обвалення будівлі — триває порятунок" },
    steps: [
      { en: "Keep clear of the structure; it may collapse further.", uk: "Тримайтеся подалі від конструкції; можливе подальше обвалення." },
      { en: "Do not enter rubble; let rescuers work.", uk: "Не заходьте в завали; дайте рятувальникам працювати." },
      { en: "Report missing people to DSNS (101).", uk: "Повідомте про зниклих ДСНС (101)." },
    ],
  },
  hazmat: {
    headline: { en: "Hazardous substance release", uk: "Викид небезпечної речовини" },
    steps: [
      { en: "Move upwind and uphill; avoid low areas.", uk: "Рухайтеся проти вітру та на підвищення; уникайте низин." },
      { en: "Close windows; seal gaps if sheltering.", uk: "Зачиніть вікна; ущільніть щілини, якщо укриваєтесь." },
      { en: "Follow evacuation routes from authorities.", uk: "Дотримуйтесь маршрутів евакуації від влади." },
    ],
  },
  flood: {
    headline: { en: "Flooding risk", uk: "Загроза підтоплення" },
    steps: [
      { en: "Move to higher ground; avoid flood water.", uk: "Підніміться на висоту; уникайте паводкових вод." },
      { en: "Disconnect electricity if it is safe to do so.", uk: "Вимкніть електрику, якщо це безпечно." },
      { en: "Do not drive through flooded roads.", uk: "Не їдьте затопленими дорогами." },
    ],
  },
  evacuation: {
    headline: { en: "Evacuation ordered", uk: "Оголошено евакуацію" },
    steps: [
      { en: "Take documents, water, medicine, and a power bank.", uk: "Візьміть документи, воду, ліки та павербанк." },
      { en: "Follow the designated route; help neighbours.", uk: "Рухайтеся визначеним маршрутом; допоможіть сусідам." },
      { en: "Register at the assembly / reception point.", uk: "Зареєструйтесь на пункті збору / прийому." },
    ],
  },
};

const DEFAULT_GUIDANCE: Omit<CivilianGuidance, "type" | "source"> = {
  headline: { en: "Emergency in the area", uk: "Надзвичайна ситуація в районі" },
  steps: [
    { en: "Stay alert and follow official instructions.", uk: "Будьте пильні та виконуйте офіційні вказівки." },
    { en: "Avoid the affected area unless you need help.", uk: "Уникайте ураженої зони, якщо вам не потрібна допомога." },
  ],
};

/** Build civilian guidance for an emergency type (+ evacuation override). */
export function buildGuidance(type: EmergencyType, evacuationOrdered = false): CivilianGuidance {
  const base = (evacuationOrdered ? GUIDANCE.evacuation : GUIDANCE[type]) ?? DEFAULT_GUIDANCE;
  return { type, ...base, source: OFFICIAL_SIGNPOST };
}
