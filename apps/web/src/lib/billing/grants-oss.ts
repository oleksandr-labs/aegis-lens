/**
 * Open-Source Maintainer Grant — free / discounted access for contributors
 * to OSINT tooling that Aegis Lens depends on or benefits from.
 *
 * Applications are reviewed manually; approved maintainers receive Pro-tier
 * access for 12 months, renewable.
 *
 * Грант для мейнтейнерів відкритого коду — для авторів OSINT-інструментів, якими користується платформа.
 */

// ── Notes ──────────────────────────────────────────────────────────────────────

/**
 * Eligibility criteria — English.
 * Applicant must be an active maintainer of an open-source OSINT, geospatial,
 * or investigative-journalism tool with ≥50 GitHub stars and an active commit
 * history in the last 6 months. Commercial forks of MIT/Apache tooling are
 * eligible if the open-source fork is actively maintained.
 */
export const OSS_GRANT_CRITERIA_EN =
  "Applicant must be an active maintainer of an open-source OSINT, " +
  "geospatial, or investigative-journalism tool " +
  "with at least 50 GitHub stars and a commit in the last 6 months. " +
  "Commercial forks remain eligible if the open-source fork is actively maintained. " +
  "One grant per person; not transferable. Renewed annually on re-verification.";

/**
 * Eligibility criteria — Ukrainian.
 * Заявник має бути активним мейнтейнером OSINT/геопросторового/журналістського
 * інструменту з ≥50 зірками на GitHub і комітом за останні 6 місяців.
 * Один грант на особу; не передається. Поновлюється щорічно.
 */
export const OSS_GRANT_CRITERIA_UK =
  "Заявник має бути активним мейнтейнером OSINT-інструменту, " +
  "геопросторового або журналістського проєкту " +
  "з щонайменше 50 зірками на GitHub та комітом за останні 6 місяців. " +
  "Комерційні форки залишаються прийнятними за умови активної підтримки відкритої гілки. " +
  "Один грант на особу; не передається. Поновлюється щорічно після верифікації.";

// ── OssGrantConfig ─────────────────────────────────────────────────────────────

export interface OssGrantConfig {
  userId: string;
  /** GitHub repository URL submitted in the application, e.g. "https://github.com/org/repo" */
  githubRepo: string;
  /** Application status */
  status: "pending" | "approved" | "rejected" | "revoked";
  /** ISO timestamp of submission */
  appliedAt: string;
  /** ISO timestamp of status change (approval / rejection / revocation) */
  resolvedAt: string | null;
  /** Reviewer note (internal) */
  reviewNote: string;
  /** ISO timestamp when the grant expires (12 months from approval) */
  expiresAt: string | null;
}

// ── OssGrantStore ──────────────────────────────────────────────────────────────

export class OssGrantStore {
  private readonly applications = new Map<string, OssGrantConfig>();

  // ── applyForOssGrant ───────────────────────────────────────────────────────

  /**
   * Submit an application for the OSS maintainer grant.
   * Idempotent: if a pending or approved application already exists for this
   * user, the existing record is returned unchanged.
   *
   * Подати заявку на грант. Ідемпотентно: повторний виклик повертає наявну заявку.
   */
  async applyForOssGrant(userId: string, githubRepo: string): Promise<void> {
    const existing = this.applications.get(userId);
    if (existing && existing.status !== "rejected" && existing.status !== "revoked") {
      // Already has an active application — do nothing
      return;
    }

    if (!githubRepo.startsWith("https://github.com/")) {
      throw new Error(
        `[grants-oss] Invalid GitHub repo URL: "${githubRepo}". ` +
          `Must start with https://github.com/`,
      );
    }

    const application: OssGrantConfig = {
      userId,
      githubRepo,
      status: "pending",
      appliedAt: new Date().toISOString(),
      resolvedAt: null,
      reviewNote: "",
      expiresAt: null,
    };

    this.applications.set(userId, application);

    // TODO: notify review queue (email / Slack webhook / admin dashboard event)
    // Повідомити чергу модерації (email / Slack / адмін-дашборд)
  }

  // ── approve / reject / revoke ──────────────────────────────────────────────

  /** Approve the grant and set a 12-month expiry. */
  approve(userId: string, reviewNote = ""): void {
    const app = this.applications.get(userId);
    if (!app) throw new Error(`[grants-oss] No application for userId "${userId}".`);

    const resolvedAt = new Date();
    const expiresAt = new Date(resolvedAt.getTime() + 365 * 24 * 60 * 60 * 1_000);

    this.applications.set(userId, {
      ...app,
      status: "approved",
      resolvedAt: resolvedAt.toISOString(),
      reviewNote,
      expiresAt: expiresAt.toISOString(),
    });
  }

  /** Reject the application. */
  reject(userId: string, reviewNote = ""): void {
    const app = this.applications.get(userId);
    if (!app) throw new Error(`[grants-oss] No application for userId "${userId}".`);
    this.applications.set(userId, {
      ...app,
      status: "rejected",
      resolvedAt: new Date().toISOString(),
      reviewNote,
    });
  }

  /** Read */
  getApplication(userId: string): OssGrantConfig | null {
    return this.applications.get(userId) ?? null;
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────────

/** Global in-memory OSS grant store. */
export const ossGrantStore = new OssGrantStore();

// ── Convenience re-export ──────────────────────────────────────────────────────

/**
 * Apply for the OSS maintainer grant (convenience wrapper).
 * Зручна функція-обгортка навколо ossGrantStore.applyForOssGrant().
 */
export async function applyForOssGrant(
  userId: string,
  githubRepo: string,
): Promise<void> {
  return ossGrantStore.applyForOssGrant(userId, githubRepo);
}
