/**
 * Civilian-safe UI mode — plain-language labels, no military jargon.
 *
 * Task: "Civilian-safe UI mode (no jargon, plain labels)" (TODO_civilian_alerts.md).
 *
 * The default analyst UI uses OSINT/military jargon ("URBAN_FIGHTING",
 * "radiological", "all-clear"). For civilians under stress, copy must be calm,
 * plain, and actionable. This module provides:
 *   - a per-alert-type plain-language label map (uk / ru / en),
 *   - a jargon -> plain dictionary for free-text passing through the UI,
 *   - a short calm action line per alert type.
 *
 * Tone rules (brief): calm, plain, fast. No exclamation marks, no "ENEMY",
 * no acronyms. Tell people what to do, briefly.
 */

import type { AlertType } from "./types";

export type CivilianLocale = "uk" | "ru" | "en";

export interface PlainLabel {
  uk: string;
  ru: string;
  en: string;
}

/** Plain, calm name for each alert type. */
export const PLAIN_ALERT_LABELS: Record<AlertType, PlainLabel> = {
  air_raid: {
    uk: "Повітряна тривога",
    ru: "Воздушная тревога",
    en: "Air raid alert",
  },
  artillery: {
    uk: "Загроза обстрілу",
    ru: "Угроза обстрела",
    en: "Shelling risk",
  },
  urban_fighting: {
    uk: "Небезпека на вулицях",
    ru: "Опасность на улицах",
    en: "Danger in the streets",
  },
  chemical: {
    uk: "Хімічна небезпека",
    ru: "Химическая опасность",
    en: "Chemical danger",
  },
  nuclear: {
    uk: "Ядерна небезпека",
    ru: "Ядерная опасность",
    en: "Nuclear danger",
  },
  radiological: {
    uk: "Радіаційна небезпека",
    ru: "Радиационная опасность",
    en: "Radiation danger",
  },
  info: {
    uk: "Повідомлення",
    ru: "Сообщение",
    en: "Notice",
  },
};

/** Short, calm action line — what to actually do. */
export const PLAIN_ACTION_LINES: Record<AlertType, PlainLabel> = {
  air_raid: {
    uk: "Пройдіть в укриття. Залишайтесь там до відбою.",
    ru: "Пройдите в укрытие. Оставайтесь там до отбоя.",
    en: "Go to a shelter. Stay until the all clear.",
  },
  artillery: {
    uk: "Відійдіть від вікон. Знайдіть міцну стіну або укриття.",
    ru: "Отойдите от окон. Найдите прочную стену или укрытие.",
    en: "Move away from windows. Find a solid wall or shelter.",
  },
  urban_fighting: {
    uk: "Залишайтесь вдома. Не виходьте на вулицю.",
    ru: "Оставайтесь дома. Не выходите на улицу.",
    en: "Stay indoors. Do not go outside.",
  },
  chemical: {
    uk: "Зачиніть вікна. Підніміться вище. Слухайте офіційні вказівки.",
    ru: "Закройте окна. Поднимитесь выше. Слушайте официальные указания.",
    en: "Close windows. Move to a higher floor. Follow official guidance.",
  },
  nuclear: {
    uk: "Пройдіть в укриття. Слухайте офіційні вказівки.",
    ru: "Пройдите в укрытие. Слушайте официальные указания.",
    en: "Go to a shelter. Follow official guidance.",
  },
  radiological: {
    uk: "Зайдіть у приміщення. Зачиніть вікна. Слухайте офіційні вказівки.",
    ru: "Зайдите в помещение. Закройте окна. Слушайте официальные указания.",
    en: "Get indoors. Close windows. Follow official guidance.",
  },
  info: {
    uk: "Ознайомтесь з повідомленням.",
    ru: "Ознакомьтесь с сообщением.",
    en: "Read the notice.",
  },
};

/** Plain wording for the all-clear state. */
export const ALL_CLEAR_LABEL: PlainLabel = {
  uk: "Відбій тривоги. Можна виходити з укриття.",
  ru: "Отбой тревоги. Можно выходить из укрытия.",
  en: "All clear. You can leave the shelter.",
};

/**
 * Jargon -> plain replacements applied to free text before showing it to a
 * civilian. Keys are lowercase; matching is case-insensitive, whole-word.
 */
export const JARGON_TO_PLAIN: Record<string, PlainLabel> = {
  "all-clear": ALL_CLEAR_LABEL,
  "all clear": ALL_CLEAR_LABEL,
  "shelter-in-place": {
    uk: "залишайтесь в укритті",
    ru: "оставайтесь в укрытии",
    en: "stay in shelter",
  },
  "urban fighting": PLAIN_ALERT_LABELS.urban_fighting,
  "radiological": PLAIN_ALERT_LABELS.radiological,
  "ballistic": {
    uk: "ракета",
    ru: "ракета",
    en: "missile",
  },
  "uav": {
    uk: "дрон",
    ru: "дрон",
    en: "drone",
  },
  "ucav": {
    uk: "дрон",
    ru: "дрон",
    en: "drone",
  },
  "ordnance": {
    uk: "боєприпас",
    ru: "боеприпас",
    en: "munition",
  },
};

/** Get the plain label for an alert type in the given locale. */
export function plainLabel(type: AlertType, locale: CivilianLocale): string {
  return PLAIN_ALERT_LABELS[type][locale];
}

/** Get the calm action line for an alert type in the given locale. */
export function plainAction(type: AlertType, locale: CivilianLocale): string {
  return PLAIN_ACTION_LINES[type][locale];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replace any jargon terms in free text with plain wording for the locale.
 * Whole-word, case-insensitive. Leaves unknown text untouched.
 */
export function deJargonize(text: string, locale: CivilianLocale): string {
  let out = text;
  for (const [term, plain] of Object.entries(JARGON_TO_PLAIN)) {
    const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi");
    out = out.replace(re, plain[locale]);
  }
  return out;
}

/** A complete civilian-mode presentation for one alert. */
export interface CivilianPresentation {
  title: string;
  action: string;
  locale: CivilianLocale;
}

export function presentForCivilian(
  type: AlertType,
  locale: CivilianLocale,
  isAllClear = false,
): CivilianPresentation {
  if (isAllClear) {
    return { title: ALL_CLEAR_LABEL[locale], action: "", locale };
  }
  return {
    title: plainLabel(type, locale),
    action: plainAction(type, locale),
    locale,
  };
}
