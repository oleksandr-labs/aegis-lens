/**
 * Free Tier Abuse Detection — heuristic signals that indicate a user may be
 * abusing the free tier through multi-accounting, scraping, or other patterns.
 *
 * See TODO_anti_spam_bot.md for the full anti-abuse spec.
 *
 * Виявлення зловживань: евристичні сигнали для free tier (multi-акаунти, скрейпінг тощо).
 */

// ── Abuse signal types ────────────────────────────────────────────────────────

/**
 * Enumeration of recognised abuse signal types.
 *
 * Типи сигналів зловживань.
 */
export type AbuseSignalType =
  | "rapid-cycling"       // Account created, used, and abandoned within hours
  | "multi-account"       // Same device / IP fingerprint across multiple accounts
  | "scraping-pattern"    // High-frequency, sequential API calls with low latency
  | "geo-hop"             // IP country changes rapidly across requests
  | "email-aliasing";     // + / . trick or disposable domain to bypass email uniqueness

// ── Interfaces ────────────────────────────────────────────────────────────────

/** A single detected abuse signal for a user. */
export interface AbuseSignal {
  userId: string;
  type: AbuseSignalType;
  /** Heuristic confidence score: 0 (low) – 1 (high) */
  confidence: number;
  /** Human-readable description (English) */
  description_en: string;
  /** Human-readable description (Ukrainian) */
  description_uk: string;
  /** ISO 8601 — when this signal was assessed */
  detectedAt: string;
  /** Supporting evidence key-value pairs for audit */
  evidence: Record<string, string | number>;
}

/** Aggregated risk profile for a user. */
export interface AbuseRiskProfile {
  userId: string;
  /** Overall risk score (0–1); max of individual signal confidences */
  overallRisk: number;
  /** Risk level label */
  riskLevel: "low" | "medium" | "high" | "critical";
  signals: AbuseSignal[];
  /** ISO 8601 — most recent assessment */
  lastAssessedAt: string;
}

// ── Heuristic data stubs ──────────────────────────────────────────────────────

/**
 * Stub: returns simulated behavioural metrics for a user.
 * In production, replace with real event-store queries.
 *
 * Заглушка: симульовані метрики поведінки (замінити реальними даними).
 */
function fetchBehaviourMetrics(userId: string): {
  accountAgeHours: number;
  uniqueIpCount: number;
  requestsLastHour: number;
  medianRequestIntervalMs: number;
  countryChanges24h: number;
  emailDomain: string;
  emailHasPlusTrick: boolean;
} {
  // Stub returns benign defaults.
  // Заглушка повертає незагрозливі значення за замовчуванням.
  void userId;
  return {
    accountAgeHours: 720,
    uniqueIpCount: 1,
    requestsLastHour: 5,
    medianRequestIntervalMs: 30_000,
    countryChanges24h: 0,
    emailDomain: "gmail.com",
    emailHasPlusTrick: false,
  };
}

/** Known disposable email domains (abbreviated list). */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwaway.email",
  "yopmail.com",
  "sharklasers.com",
]);

// ── AbuseDetector ─────────────────────────────────────────────────────────────

/**
 * Heuristic abuse detector. Evaluates 5 signal types per user.
 *
 * Евристичний детектор зловживань. Оцінює 5 типів сигналів.
 */
export class AbuseDetector {
  private readonly profiles = new Map<string, AbuseRiskProfile>();

  // ── Assessment ────────────────────────────────────────────────────────────

  /**
   * Assess abuse risk for a user and return all detected signals.
   *
   * Оцінює ризик зловживань і повертає виявлені сигнали.
   */
  assessAbuseRisk(userId: string): AbuseSignal[] {
    const metrics = fetchBehaviourMetrics(userId);
    const now = new Date().toISOString();
    const signals: AbuseSignal[] = [];

    // 1. Rapid cycling — account created and used within < 12 hours
    if (metrics.accountAgeHours < 12 && metrics.requestsLastHour > 10) {
      signals.push({
        userId,
        type: "rapid-cycling",
        confidence: 0.7,
        description_en: "Account is very new and already shows high usage volume.",
        description_uk: "Акаунт дуже новий, але вже має великий обсяг запитів.",
        detectedAt: now,
        evidence: {
          accountAgeHours: metrics.accountAgeHours,
          requestsLastHour: metrics.requestsLastHour,
        },
      });
    }

    // 2. Multi-account — same fingerprint across many IPs
    if (metrics.uniqueIpCount >= 5 && metrics.accountAgeHours < 48) {
      signals.push({
        userId,
        type: "multi-account",
        confidence: Math.min(metrics.uniqueIpCount / 10, 1.0),
        description_en: "Multiple IP addresses detected in a short time window.",
        description_uk: "Виявлено кілька IP-адрес за короткий проміжок часу.",
        detectedAt: now,
        evidence: {
          uniqueIpCount: metrics.uniqueIpCount,
          accountAgeHours: metrics.accountAgeHours,
        },
      });
    }

    // 3. Scraping pattern — very fast sequential requests
    const SCRAPING_INTERVAL_MS = 500;
    if (
      metrics.requestsLastHour > 100 &&
      metrics.medianRequestIntervalMs < SCRAPING_INTERVAL_MS
    ) {
      signals.push({
        userId,
        type: "scraping-pattern",
        confidence: 0.85,
        description_en: "High-frequency API calls with sub-second intervals detected.",
        description_uk: "Виявлено часті API-запити з інтервалом менше секунди.",
        detectedAt: now,
        evidence: {
          requestsLastHour: metrics.requestsLastHour,
          medianRequestIntervalMs: metrics.medianRequestIntervalMs,
        },
      });
    }

    // 4. Geo-hop — country changes within 24h
    if (metrics.countryChanges24h >= 3) {
      signals.push({
        userId,
        type: "geo-hop",
        confidence: Math.min(metrics.countryChanges24h / 5, 1.0),
        description_en: "IP country changed multiple times within 24 hours.",
        description_uk: "IP-адреса змінила країну кілька разів протягом 24 годин.",
        detectedAt: now,
        evidence: { countryChanges24h: metrics.countryChanges24h },
      });
    }

    // 5. Email aliasing — plus trick or disposable domain
    const isDisposable = DISPOSABLE_DOMAINS.has(metrics.emailDomain);
    if (metrics.emailHasPlusTrick || isDisposable) {
      signals.push({
        userId,
        type: "email-aliasing",
        confidence: isDisposable ? 0.9 : 0.6,
        description_en: isDisposable
          ? "Disposable email domain detected."
          : "Email address uses plus-aliasing to bypass uniqueness check.",
        description_uk: isDisposable
          ? "Виявлено одноразовий email-домен."
          : "Email-адреса використовує + для обходу перевірки унікальності.",
        detectedAt: now,
        evidence: {
          emailDomain: metrics.emailDomain,
          hasPlusTrick: metrics.emailHasPlusTrick ? 1 : 0,
          isDisposable: isDisposable ? 1 : 0,
        },
      });
    }

    // Store profile for audit.
    const overallRisk = signals.reduce((max, s) => Math.max(max, s.confidence), 0);
    const riskLevel: AbuseRiskProfile["riskLevel"] =
      overallRisk >= 0.8
        ? "critical"
        : overallRisk >= 0.6
        ? "high"
        : overallRisk >= 0.3
        ? "medium"
        : "low";

    this.profiles.set(userId, {
      userId,
      overallRisk,
      riskLevel,
      signals,
      lastAssessedAt: now,
    });

    return signals;
  }

  // ── Profile accessor ──────────────────────────────────────────────────────

  /**
   * Return the most recent risk profile for a user, or null.
   *
   * Повертає останній профіль ризику для користувача.
   */
  getRiskProfile(userId: string): AbuseRiskProfile | null {
    return this.profiles.get(userId) ?? null;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global abuse detector singleton. */
export const abuseDetector = new AbuseDetector();
