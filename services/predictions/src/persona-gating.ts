/**
 * Disabled by default for civilian persona.
 *
 * AI-prediction layers are the most easily misread surface in the product, so
 * they default OFF for the civilian persona. This module maps persona → default
 * layer visibility and exposes the gating decision the layer registry / map
 * bootstrap should consult. A user may still manually opt in (where their tier
 * allows it) — this only controls the DEFAULT state on first load.
 */

export type Persona =
  | "civilian" // general public — restrained UX, predictions hidden
  | "journalist" // OSINT / press — predictions shown but heavily caveated
  | "analyst" // professional analyst — full forecast tooling
  | "responder"; // emergency responder — observations prioritised, predictions optional

/** Layer ids this gating policy governs (AI-prediction surfaces). */
export type GatedLayerId = "ai_predicted_zones";

export interface PersonaLayerDefaults {
  persona: Persona;
  /** layerId → default visible on first load. */
  defaults: Record<GatedLayerId, boolean>;
  /** Why predictions are gated this way, for an in-UI tooltip. */
  rationaleEn: string;
  rationaleUk: string;
}

/**
 * Persona → default visibility for AI-prediction layers.
 * civilian => ai layer default OFF (hard requirement).
 */
export const PERSONA_LAYER_DEFAULTS: Record<Persona, PersonaLayerDefaults> = {
  civilian: {
    persona: "civilian",
    defaults: { ai_predicted_zones: false },
    rationaleEn:
      "AI predictions are hidden by default for the public to avoid mistaking forecasts for confirmed danger.",
    rationaleUk:
      "AI-прогнози приховані за замовчуванням для широкого загалу, щоб не сплутати прогнози з підтвердженою небезпекою.",
  },
  journalist: {
    persona: "journalist",
    defaults: { ai_predicted_zones: false },
    rationaleEn:
      "Predictions are available but off by default; enable with care and always label as AI forecast.",
    rationaleUk:
      "Прогнози доступні, але вимкнені за замовчуванням; вмикайте обережно та завжди позначайте як AI-прогноз.",
  },
  analyst: {
    persona: "analyst",
    defaults: { ai_predicted_zones: true },
    rationaleEn:
      "Full forecast tooling enabled for professional analysis with backtest context.",
    rationaleUk:
      "Повний інструментарій прогнозування увімкнено для професійного аналізу з контекстом бектесту.",
  },
  responder: {
    persona: "responder",
    defaults: { ai_predicted_zones: false },
    rationaleEn:
      "Confirmed observations are prioritised; predictions are opt-in to avoid acting on uncertain forecasts.",
    rationaleUk:
      "Пріоритет надається підтвердженим спостереженням; прогнози — за вибором, щоб не діяти на основі непевних прогнозів.",
  },
};

const DEFAULT_PERSONA: Persona = "civilian";

/** Resolve a (possibly unknown) persona string to a known persona. */
export function resolvePersona(persona?: string | null): Persona {
  if (persona && persona in PERSONA_LAYER_DEFAULTS) return persona as Persona;
  return DEFAULT_PERSONA; // unknown → safest (civilian, predictions off)
}

/**
 * Enforcement function: should `layerId` be visible by default for `persona`?
 * Defaults to hidden when in doubt.
 */
export function isLayerDefaultVisible(persona: string | null | undefined, layerId: GatedLayerId): boolean {
  const resolved = resolvePersona(persona);
  return PERSONA_LAYER_DEFAULTS[resolved].defaults[layerId] ?? false;
}

export function getPersonaDefaults(persona: string | null | undefined): PersonaLayerDefaults {
  return PERSONA_LAYER_DEFAULTS[resolvePersona(persona)];
}
