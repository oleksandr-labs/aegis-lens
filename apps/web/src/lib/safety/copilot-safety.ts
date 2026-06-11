/**
 * Copilot Safety Classifier — detect and refuse doxxing / PII-leaking AI prompts.
 *
 * Runs before every AI copilot request. Prompts classified as 'doxxing' or
 * 'pii-leak' are rejected with an explanatory error; 'borderline' prompts
 * are logged and reviewed.
 *
 * Класифікатор безпеки Copilot: відхиляє доксинг/PII-запити до AI.
 */

// ── Notes ─────────────────────────────────────────────────────────────────────

export const SAFETY_CLASSIFIER_NOTE_EN =
  "Pattern-based safety classifier. Supplement with LLM-as-judge for production robustness.";

export const SAFETY_CLASSIFIER_NOTE_UK =
  "Класифікатор на патернах. У продакшені доповнити LLM-суддею для надійності.";

// ── SafetyClassification ──────────────────────────────────────────────────────

export type SafetyClassification =
  | "safe"
  | "borderline"
  | "doxxing"
  | "pii-leak"
  | "manipulation";

// ── Doxxing prompt patterns ───────────────────────────────────────────────────

/**
 * Regex patterns that strongly indicate a doxxing or PII-extraction attempt.
 * Any single match escalates classification to 'doxxing' or 'pii-leak'.
 *
 * Патерни, що вказують на спробу доксингу або витоку ПДн через AI.
 */
export const DOXXING_PROMPT_PATTERNS: RegExp[] = [
  // 1. Requests for home/personal address
  /\b(?:home\s+address|personal\s+address|where\s+(?:does|do|did)\s+(?:he|she|they)\s+live|адреса\s+(?:проживання|будинку))\b/i,

  // 2. National ID / passport extraction
  /\b(?:(?:national|passport|id)\s+(?:number|no\.?)|рнокпп|ідентифікаційний\s+номер|паспортні\s+дані)\b/i,

  // 3. Phone number harvesting for a named individual
  /\b(?:phone\s+number\s+of|contact\s+details?\s+for|get\s+me\s+the\s+(?:number|phone)|номер\s+телефону\s+(?:особи|людини))\b/i,

  // 4. Family member tracking (enabler of indirect doxxing)
  /\b(?:family\s+members?\s+of|relatives?\s+of|children\s+of|spouse\s+of|члени\s+сім'ї|родичі)\b/i,

  // 5. Explicit build-a-dossier / profile private individual
  /\b(?:build\s+(?:a\s+)?(?:dossier|profile|report)\s+on|compile\s+(?:everything|all\s+info)\s+(?:about|on)|скласти\s+досьє|зібрати\s+інформацію\s+про\s+приватну)\b/i,
];

// ── Manipulation / CSIO patterns (additional signals) ─────────────────────────

const MANIPULATION_PATTERNS: RegExp[] = [
  /\b(?:ignore\s+(?:previous\s+)?instructions|disregard\s+safety|bypass\s+filter|ігноруй\s+інструкції)\b/i,
  /\b(?:pretend\s+you\s+are|act\s+as\s+if\s+you\s+have\s+no\s+restrictions|без\s+обмежень)\b/i,
];

const BORDERLINE_PATTERNS: RegExp[] = [
  /\b(?:find\s+out\s+(?:where|who)|track\s+(?:a\s+person|someone)|знайди\s+де\s+живе)\b/i,
  /\b(?:social\s+media\s+accounts?\s+of|online\s+presence\s+of)\b/i,
];

// ── classifyPrompt ────────────────────────────────────────────────────────────

/**
 * Classify an AI copilot prompt. Returns the most severe matching classification.
 * Order of precedence: doxxing > pii-leak > manipulation > borderline > safe.
 *
 * Класифікує AI-запит. Повертає найбільш серйозну відповідну класифікацію.
 */
export function classifyPrompt(prompt: string): SafetyClassification {
  // Check doxxing patterns first (highest severity)
  for (const pattern of DOXXING_PROMPT_PATTERNS) {
    if (pattern.test(prompt)) {
      // Distinguish PII-leak (ID/phone) from generic doxxing (address/dossier)
      if (
        DOXXING_PROMPT_PATTERNS[1].test(prompt) ||
        DOXXING_PROMPT_PATTERNS[2].test(prompt)
      ) {
        return "pii-leak";
      }
      return "doxxing";
    }
  }

  // Manipulation / jailbreak attempts
  for (const pattern of MANIPULATION_PATTERNS) {
    if (pattern.test(prompt)) {
      return "manipulation";
    }
  }

  // Borderline — flag for logging but allow with caveat
  for (const pattern of BORDERLINE_PATTERNS) {
    if (pattern.test(prompt)) {
      return "borderline";
    }
  }

  return "safe";
}
