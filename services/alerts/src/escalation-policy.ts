'use server';
/**
 * Per-org escalation policies with on-call rotations.
 * Compatible with PagerDuty-style escalation levels (1–4) and rotating on-call schedules.
 *
 * Ескалаційні політики для організацій з черговими ротаціями.
 * Сумісно зі стилем ескалації PagerDuty (рівні 1–4) і ротаційними черговими розкладами.
 */

// ── On-call shift ─────────────────────────────────────────────────────────────

export interface OnCallShift {
  /** User ID of the on-call person */
  userId: string;
  /** Start hour in UTC (0–23) */
  startHour: number;
  /** End hour in UTC (0–23); if less than startHour, wraps midnight */
  endHour: number;
  /**
   * Weekdays this shift applies to.
   * 0 = Sunday, 1 = Monday, … 6 = Saturday.
   * Empty array = every day.
   */
  weekdays: number[];
}

// ── Escalation level ──────────────────────────────────────────────────────────

/**
 * A single escalation level.
 * Level 1 is the first responder; higher levels are notified if level N-1 doesn't acknowledge
 * within timeoutMinutes.
 *
 * Рівень ескалації. Рівень 1 — перший відповідальний.
 */
export interface EscalationLevel {
  /** 1–4 */
  level: number;
  /** Minutes to wait before escalating to the next level (null = no further escalation) */
  timeoutMinutes: number | null;
  /** User IDs or group IDs to notify at this level */
  targets: string[];
}

// ── Escalation policy ─────────────────────────────────────────────────────────

export interface EscalationPolicy {
  policyId: string;
  /** Organisation this policy belongs to */
  orgId: string;
  name: string;
  /** Escalation levels, ordered 1 → 4 */
  levels: EscalationLevel[];
  /** On-call rotation schedule entries */
  rotations: OnCallShift[];
  /** ISO-8601 timestamp of last update */
  updatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Find the on-call user for a policy at a given UTC time.
 * Returns the first shift that matches the hour and weekday, or undefined if none match.
 *
 * Повертає ID чергового користувача для заданого UTC-часу.
 */
export function getCurrentOnCallUser(
  policy: EscalationPolicy,
  nowUtc: string,
): string | undefined {
  const now = new Date(nowUtc);
  const hour = now.getUTCHours();
  const weekday = now.getUTCDay(); // 0=Sun…6=Sat

  for (const shift of policy.rotations) {
    // Check weekday (empty = all days)
    if (shift.weekdays.length > 0 && !shift.weekdays.includes(weekday)) continue;

    // Check hour range (handles overnight wrap e.g. 22–06)
    const inRange =
      shift.startHour <= shift.endHour
        ? hour >= shift.startHour && hour < shift.endHour
        : hour >= shift.startHour || hour < shift.endHour;

    if (inRange) return shift.userId;
  }

  return undefined;
}

/**
 * Get the targets for a given escalation level number.
 * Injects the current on-call user at level 1 if rotations are configured.
 *
 * Повертає список цілей для заданого рівня ескалації.
 */
export function getEscalationTarget(
  policy: EscalationPolicy,
  level: number,
  nowUtc?: string,
): string[] {
  const escalationLevel = policy.levels.find((l) => l.level === level);
  if (!escalationLevel) return [];

  const targets = [...escalationLevel.targets];

  // Inject on-call user at level 1 if rotations defined
  if (level === 1 && policy.rotations.length > 0 && nowUtc) {
    const onCall = getCurrentOnCallUser(policy, nowUtc);
    if (onCall && !targets.includes(onCall)) {
      targets.unshift(onCall);
    }
  }

  return targets;
}

// ── Store ─────────────────────────────────────────────────────────────────────

/**
 * In-memory escalation policy store keyed by policyId.
 * In production: persist to database.
 *
 * Сховище ескалаційних політик у пам'яті.
 */
export class EscalationPolicyStore {
  private readonly store = new Map<string, EscalationPolicy>();
  private _seq = 0;

  /** Add or replace an escalation policy */
  upsert(policy: Omit<EscalationPolicy, "policyId" | "updatedAt"> & { policyId?: string }): EscalationPolicy {
    const policyId = policy.policyId ?? `policy-${++this._seq}-${Date.now()}`;
    const record: EscalationPolicy = {
      ...policy,
      policyId,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(policyId, record);
    return record;
  }

  /** Get a policy by ID */
  get(policyId: string): EscalationPolicy | undefined {
    return this.store.get(policyId);
  }

  /** List all policies for an org */
  listByOrg(orgId: string): EscalationPolicy[] {
    return [...this.store.values()].filter((p) => p.orgId === orgId);
  }

  /** Delete a policy */
  delete(policyId: string): boolean {
    return this.store.delete(policyId);
  }
}

/** Singleton escalation policy store */
export const escalationPolicyStore = new EscalationPolicyStore();

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const ESCALATION_NOTES_EN = [
  "On-call rotations use UTC hours and ISO weekday numbers (0=Sun…6=Sat); convert from your local timezone before storing.",
  "Escalation policies are PagerDuty-compatible in structure: up to 4 levels, each with a timeout and a list of targets (user IDs or group IDs).",
  "getCurrentOnCallUser() is timezone-aware via UTC normalization — always pass nowUtc as an ISO-8601 string in UTC.",
  "Test your escalation policy before an incident: use the /api/v1/alerts/escalation endpoint to simulate a level-1 page and verify the on-call user resolves correctly.",
];

export const ESCALATION_NOTES_UK = [
  "Ротаційні чергування використовують UTC-години та ISO-номери днів тижня (0=Нд…6=Сб); конвертуйте з місцевого часового поясу перед збереженням.",
  "Ескалаційні політики сумісні з PagerDuty за структурою: до 4 рівнів, кожен з тайм-аутом і списком цілей (ID користувачів або груп).",
  "getCurrentOnCallUser() враховує часовий пояс через нормалізацію UTC — завжди передавайте nowUtc як рядок ISO-8601 у UTC.",
  "Перевірте свою ескалаційну політику до інциденту: використовуйте ендпоінт /api/v1/alerts/escalation для симуляції сторінки рівня 1 та перевірки правильності визначення чергового.",
];
