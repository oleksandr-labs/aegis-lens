/**
 * Risk Score API — Aegis Lens / Ukrainian MAP
 *
 * Geopolitical risk scoring for fintech, KYC, insurance, and supply-chain compliance.
 * Exposes focused endpoints: location, entity, route, asset, and forecast risk.
 *
 * API оцінки ризиків для фінтех, KYC, страхування та відповідності постачання.
 * All monetary values in USD. Scores on a 0–100 scale (100 = highest risk).
 */

// ── Request / response types ──────────────────────────────────────────────────

/** Supported risk-score endpoint types. */
export type RiskEndpoint =
  | "location"
  | "entity"
  | "route"
  | "asset"
  | "forecast";

/**
 * Input parameters for any risk-score request.
 * Fields are optional depending on the endpoint type.
 *
 * Вхідні параметри запиту оцінки ризику.
 */
export interface RiskScoreRequest {
  /** Which risk endpoint to evaluate. */
  endpoint: RiskEndpoint;
  /** WGS-84 coordinates [latitude, longitude] for location/asset queries. */
  coordinates?: [number, number];
  /** Entity identifier for entity queries (IATI, MMSI, ICAO, or internal ID). */
  entityId?: string;
  /** Entity type for entity queries. */
  entityType?: "org" | "vessel" | "aircraft" | "person";
  /** Ordered waypoints [lat, lon] for route risk queries. */
  routeWaypoints?: [number, number][];
  /** Asset category for asset risk queries (e.g. "warehouse", "pipeline", "vessel"). */
  assetType?: string;
  /** Time horizon for forecast queries. */
  forecastHorizon?: "7d" | "30d" | "90d";
}

/**
 * Risk score response returned by all endpoints.
 *
 * Відповідь з оцінкою ризику.
 */
export interface RiskScoreResponse {
  /**
   * Composite risk score, 0–100.
   * 0–25: low | 26–50: moderate | 51–75: high | 76–100: critical
   */
  score: number;
  /** Model confidence in the score, 0–1. */
  confidence: number;
  /** Data layers that contributed to this score. */
  contributingLayers: string[];
  /** Forecast data if the forecastHorizon parameter was provided. */
  forecast?: {
    horizon: string;
    trendDirection: "increasing" | "stable" | "decreasing";
    /** Expected absolute score change over the forecast horizon. */
    delta: number;
  };
  /** Sanctions screening result if entity was queried. */
  sanctions?: {
    isSanctioned: boolean;
    listNames: string[];
  };
  /** Required disclaimer appended to all API responses. */
  disclaimer: string;
}

// ── Pricing tiers ─────────────────────────────────────────────────────────────

/**
 * Risk API pricing tiers.
 *
 * Тарифи API оцінки ризиків.
 */
export const RISK_API_PRICING: {
  tier: string;
  priceUsdMo: number;
  callsPerDay: number;
  webhookEnabled: boolean;
  rapidApiListed: boolean;
}[] = [
  {
    tier: "free-dev",
    priceUsdMo: 0,
    callsPerDay: 100,
    webhookEnabled: false,
    rapidApiListed: true,
  },
  {
    tier: "starter",
    priceUsdMo: 99,
    callsPerDay: 10_000,
    webhookEnabled: false,
    rapidApiListed: true,
  },
  {
    tier: "growth",
    priceUsdMo: 499,
    callsPerDay: 100_000,
    webhookEnabled: true,
    rapidApiListed: true,
  },
  {
    tier: "enterprise",
    priceUsdMo: 0, // custom contract
    callsPerDay: -1, // unlimited
    webhookEnabled: true,
    rapidApiListed: false,
  },
];

// ── Prohibited uses ───────────────────────────────────────────────────────────

/**
 * Prohibited uses per the Aegis Lens Risk API Terms of Service.
 *
 * Заборонені способи використання API оцінки ризиків.
 */
export const RISK_API_PROHIBITED_USES: string[] = [
  "Surveillance of named individuals beyond sanctions screening",
  "Collecting or storing personally identifiable information about queried subjects",
  "Insurance redlining or geographic discrimination against civilian populations",
  "Targeting civilians, journalists, or human-rights defenders",
  "Developing autonomous targeting or weapons guidance systems",
  "Use by entities on OFAC, EU, UK, or UN sanctions lists",
  "Reselling raw API output as a competing data product",
  "Generating disinformation or manipulating public perception of risk",
];

// ── Disclaimers ───────────────────────────────────────────────────────────────

/**
 * Required disclaimer appended to every Risk Score API response (English).
 *
 * Обов'язковий дисклеймер у кожній відповіді API (англійська).
 */
export const RISK_SCORE_DISCLAIMER_EN =
  "Risk scores are probabilistic estimates based on open-source data and should " +
  "not be the sole basis for financial, legal, or safety-critical decisions. " +
  "Aegis Lens Ltd accepts no liability for decisions made using this output. " +
  "Data is provided under the Aegis Lens API Terms of Service. " +
  "Scores do not constitute legal advice, investment advice, or insurance assessments.";

/**
 * Required disclaimer appended to every Risk Score API response (Ukrainian).
 *
 * Обов'язковий дисклеймер у кожній відповіді API (українська).
 */
export const RISK_SCORE_DISCLAIMER_UK =
  "Оцінки ризику є ймовірнісними прогнозами на основі даних з відкритих джерел і не мають " +
  "бути єдиною підставою для фінансових, юридичних або критично важливих для безпеки рішень. " +
  "Aegis Lens Ltd не несе відповідальності за рішення, прийняті на основі цього виводу. " +
  "Дані надаються відповідно до Умов використання API Aegis Lens. " +
  "Оцінки не є юридичною консультацією, інвестиційним порадником чи страховою оцінкою.";

// ── Heuristic stub ────────────────────────────────────────────────────────────

/**
 * Compute a location-based risk score using a deterministic heuristic stub.
 *
 * This is a non-production stub: it uses geographic proximity to the conflict
 * zone as a simple proxy. In production, this is replaced by the full
 * multi-layer scoring engine in `packages/risk-engine`.
 *
 * isProduction: false — do not use for real decisions.
 *
 * Евристичний stub для оцінки ризику за координатами (не для продакшену).
 */
export function computeLocationRisk(
  coords: [number, number],
): RiskScoreResponse {
  const [lat, lon] = coords;

  // Very rough heuristic: eastern Ukraine high-risk band
  // 46–52°N, 33–40°E — conflict zone proximity
  const inHighRiskLat = lat >= 46 && lat <= 52;
  const inHighRiskLon = lon >= 33 && lon <= 40;
  const inModerateRiskLon = lon >= 28 && lon < 33;

  let score: number;
  let trendDirection: "increasing" | "stable" | "decreasing";
  const layers: string[] = ["event-density", "infrastructure-damage", "air-alert-frequency"];

  if (inHighRiskLat && inHighRiskLon) {
    // Eastern Ukraine / active conflict zone
    score = Math.min(
      100,
      70 + Math.round(Math.random() * 20),
    );
    trendDirection = "stable";
    layers.push("frontline-proximity", "artillery-impact-zone");
  } else if (inHighRiskLat && inModerateRiskLon) {
    // Central Ukraine — moderate risk
    score = 30 + Math.round(Math.random() * 20);
    trendDirection = "stable";
    layers.push("missile-strike-range");
  } else if (lat >= 49 && lat <= 55 && lon >= 20 && lon <= 40) {
    // Poland / Belarus border region — low-moderate
    score = 10 + Math.round(Math.random() * 15);
    trendDirection = "decreasing";
  } else {
    // Outside region — very low
    score = Math.round(Math.random() * 10);
    trendDirection = "stable";
  }

  return {
    score,
    confidence: 0.55, // stub confidence — replace with model output
    contributingLayers: layers,
    forecast: {
      horizon: "30d",
      trendDirection,
      delta: trendDirection === "increasing" ? 5 : trendDirection === "decreasing" ? -3 : 0,
    },
    disclaimer: RISK_SCORE_DISCLAIMER_EN,
  };
}

/**
 * Map a numeric risk score (0–100) to a categorical label.
 * Категоризація числової оцінки ризику.
 */
export function riskScoreLabel(
  score: number,
): "low" | "moderate" | "high" | "critical" {
  if (score <= 25) return "low";
  if (score <= 50) return "moderate";
  if (score <= 75) return "high";
  return "critical";
}
