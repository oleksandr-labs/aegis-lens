/**
 * Content warning policy definitions.
 *
 * Central source of truth for severity-level configurations and
 * trauma-informed UI constants. All UI components consume these values;
 * do not hard-code severity thresholds elsewhere.
 */

import type { ContentSeverity, ContentWarningConfig } from "./types";

// ── Per-severity configs ──────────────────────────────────────────────────────

export const CONTENT_WARNING_CONFIGS: Record<ContentSeverity, ContentWarningConfig> = {
  mild: {
    severity: "mild",
    warningTypes: ["destruction"],
    blurByDefault: false,
    requiresClickThrough: false,
    requiresAgeGate: false,
    description_en: "This content depicts mild conflict-related material (property damage, smoke).",
    description_uk: "Цей вміст містить матеріали помірного характеру (пошкодження майна, дим).",
  },

  moderate: {
    severity: "moderate",
    warningTypes: ["violence", "destruction"],
    blurByDefault: true,
    requiresClickThrough: true,
    requiresAgeGate: false,
    description_en:
      "This content depicts moderate violence or conflict. A content warning is shown before display.",
    description_uk:
      "Цей вміст містить матеріали помірного насильства або конфлікту. Перед відображенням з'являється попередження.",
  },

  graphic: {
    severity: "graphic",
    warningTypes: ["violence", "gore", "casualty", "graphic-injury"],
    blurByDefault: true,
    requiresClickThrough: true,
    requiresAgeGate: true,
    description_en:
      "Graphic content: severe violence, gore, or casualties. Requires age verification (18+) and explicit acknowledgement.",
    description_uk:
      "Графічний вміст: сильне насильство, gore або жертви. Вимагає підтвердження віку (18+) та явної згоди.",
  },

  extreme: {
    severity: "extreme",
    warningTypes: ["violence", "gore", "casualty", "graphic-injury", "children-visible"],
    blurByDefault: true,
    requiresClickThrough: true,
    requiresAgeGate: true,
    description_en:
      "Extreme graphic content restricted to trained analysts. Org-level override required with admin approval.",
    description_uk:
      "Вкрай графічний вміст, доступний лише навченим аналітикам. Потрібне перевизначення на рівні організації з підтвердженням адміністратора.",
  },
};

// ── Children-face blur policy ─────────────────────────────────────────────────

/**
 * Children's faces are ALWAYS auto-blurred regardless of user preferences,
 * org overrides, or content severity level. This policy cannot be disabled.
 */
export const CHILDREN_FACE_BLUR_POLICY_EN =
  "Children's faces are always automatically blurred — this cannot be overridden.";

export const CHILDREN_FACE_BLUR_POLICY_UK =
  "Обличчя дітей завжди автоматично розмиваються — це неможливо відмінити.";

// ── Trauma-informed UI constants ──────────────────────────────────────────────

export const TRAUMA_INFORMED_UI_EN =
  "No autoplay, no loud sounds. Default conservative. Once seen cannot be unseen.";

export const TRAUMA_INFORMED_UI_UK =
  "Без автовідтворення, без гучних звуків. Типово консервативно. Побачене не можна відсторонити.";

// ── Auto-classification note ──────────────────────────────────────────────────

export const AUTO_CLASSIFY_NOTE_EN =
  "Media is auto-classified by violence/gore/casualty severity before display.";

export const AUTO_CLASSIFY_NOTE_UK =
  "Медіа автоматично класифікується за рівнем насильства/gore/жертв перед відображенням.";
