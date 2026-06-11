/**
 * Grant & discount programs — free / reduced access for mission-aligned users.
 *
 * Grant-програма — це PR-актив, не маркетинговий канал.
 * Комунікувати як місію, не як знижку.
 *
 * Programs: journalist · ngo · ua-resident · academic · student
 */

import type { GrantApplication, GrantProgram } from "./types";

// ── Program definitions ───────────────────────────────────────────────────────

export interface GrantProgramConfig {
  label_en: string;
  label_uk: string;
  /** Tier granted upon approval */
  grantedTierId: string;
  /** Discount percentage applied to paid plans (0–100) */
  discountPct: number;
  /** Maximum grant duration in days (365 = annual review) */
  maxDurationDays: number;
  /** If true, manual document review is required before approval */
  requiresVerification: boolean;
  /** URL to the grant application form */
  applicationUrl: string;
  eligibilityCriteria_en: string;
  eligibilityCriteria_uk: string;
}

/**
 * Canonical grant program registry.
 *
 * journalist  — 90% off Observer/Pro for verified press credentials
 * ngo         — 90% off all tiers for registered humanitarian orgs
 * ua-resident — 70% off any tier for Ukrainian citizens/residents (duration of conflict)
 * academic    — free Observer for verified .edu / research institutions
 * student     — free Observer for enrolled students (annual renewal)
 *
 * Реєстр грантових програм.
 */
export const GRANT_PROGRAMS: Record<GrantProgram, GrantProgramConfig> = {
  journalist: {
    label_en: "Journalist / Press",
    label_uk: "Журналіст / Преса",
    grantedTierId: "pro",
    discountPct: 90,
    maxDurationDays: 365,
    requiresVerification: true,
    applicationUrl: "https://aegislens.uk/grants/journalist",
    eligibilityCriteria_en:
      "Active journalist or photojournalist with verifiable press credentials " +
      "(press card, masthead listing, or recent published byline).",
    eligibilityCriteria_uk:
      "Діючий журналіст або фотожурналіст із верифікованими прес-посвідченнями " +
      "(прес-картка, редакційна сторінка або нещодавня публікація).",
  },

  ngo: {
    label_en: "NGO / Humanitarian Organisation",
    label_uk: "НГО / Гуманітарна організація",
    grantedTierId: "team",
    discountPct: 90,
    maxDurationDays: 365,
    requiresVerification: true,
    applicationUrl: "https://aegislens.uk/grants/ngo",
    eligibilityCriteria_en:
      "Registered non-governmental organisation operating in a humanitarian, " +
      "human-rights, or conflict-monitoring capacity. Must provide official " +
      "registration documents.",
    eligibilityCriteria_uk:
      "Зареєстрована НГО, що провадить гуманітарну, правозахисну або " +
      "конфліктно-моніторингову діяльність. Необхідні офіційні реєстраційні документи.",
  },

  "ua-resident": {
    label_en: "Ukrainian Citizen / Resident",
    label_uk: "Громадянин / Резидент України",
    grantedTierId: "observer",
    discountPct: 70,
    maxDurationDays: 365,
    requiresVerification: false,
    applicationUrl: "https://aegislens.uk/grants/ua-resident",
    eligibilityCriteria_en:
      "Ukrainian citizens and residents (including internally displaced persons) " +
      "for the duration of the armed conflict. Light self-attestation with " +
      "optional document upload. Reviewed annually.",
    eligibilityCriteria_uk:
      "Громадяни та резиденти України (включно з внутрішньо переміщеними особами) " +
      "на весь час збройного конфлікту. Легка самоатестація з можливістю " +
      "завантаження документів. Щорічне поновлення.",
  },

  academic: {
    label_en: "Academic / Research Institution",
    label_uk: "Академія / Науково-дослідна установа",
    grantedTierId: "observer",
    discountPct: 100,
    maxDurationDays: 365,
    requiresVerification: true,
    applicationUrl: "https://aegislens.uk/grants/academic",
    eligibilityCriteria_en:
      "Accredited university or research institution with an active focus on " +
      "conflict studies, human security, geopolitics, or related fields. " +
      "Institutional email (.edu or equivalent) required.",
    eligibilityCriteria_uk:
      "Акредитований університет або дослідницька установа з активним фокусом на " +
      "конфліктознавстві, безпеці людини, геополітиці або суміжних галузях. " +
      "Потрібна інституційна email-адреса (.edu або аналог).",
  },

  student: {
    label_en: "Student",
    label_uk: "Студент",
    grantedTierId: "observer",
    discountPct: 100,
    maxDurationDays: 365,
    requiresVerification: true,
    applicationUrl: "https://aegislens.uk/grants/student",
    eligibilityCriteria_en:
      "Enrolled student at an accredited institution studying journalism, " +
      "political science, security studies, data journalism, or a related field. " +
      "Valid student ID or institutional email required.",
    eligibilityCriteria_uk:
      "Студент акредитованого закладу на спеціальностях журналістики, " +
      "політології, безпекових студій, дата-журналістики або суміжних. " +
      "Необхідні студентський квиток або інституційна email-адреса.",
  },
};

// ── Grant Store ───────────────────────────────────────────────────────────────

export class GrantStore {
  /**
   * Keyed by `${email}:${program}` for O(1) lookups.
   * Індексовано за `${email}:${program}`.
   */
  private readonly applications = new Map<string, GrantApplication>();

  private key(email: string, program: GrantProgram): string {
    return `${email.toLowerCase()}:${program}`;
  }

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * Submit a new grant application.
   * Throws if an application for the same email+program already exists and
   * is not yet rejected.
   *
   * Подає заявку на грант.
   */
  apply(app: GrantApplication): void {
    const k = this.key(app.applicantEmail, app.program);
    const existing = this.applications.get(k);
    if (existing && existing.status !== "rejected") {
      throw new Error(
        `[grants] Application for ${app.program} already exists for ${app.applicantEmail} ` +
          `with status "${existing.status}".`,
      );
    }
    this.applications.set(k, { ...app, status: "pending" });
  }

  /**
   * Approve a grant application and set its expiry date.
   *
   * Схвалює заявку на грант.
   */
  approve(email: string, program: GrantProgram): void {
    const k = this.key(email, program);
    const app = this.applications.get(k);
    if (!app) {
      throw new Error(
        `[grants] No application found for ${program} / ${email}`,
      );
    }

    const config = GRANT_PROGRAMS[program];
    const reviewedAt = new Date().toISOString();
    const expiresAt = new Date(
      Date.now() + config.maxDurationDays * 24 * 60 * 60 * 1000,
    ).toISOString();

    this.applications.set(k, {
      ...app,
      status: "approved",
      reviewedAt,
      expiresAt,
    });
  }

  /**
   * Reject a grant application.
   *
   * Відхиляє заявку на грант.
   */
  reject(email: string, program: GrantProgram): void {
    const k = this.key(email, program);
    const app = this.applications.get(k);
    if (!app) {
      throw new Error(
        `[grants] No application found for ${program} / ${email}`,
      );
    }
    this.applications.set(k, {
      ...app,
      status: "rejected",
      reviewedAt: new Date().toISOString(),
    });
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Get the most recently active (approved + not expired) application for an
   * email address across all programs. Returns null if none found.
   *
   * Повертає активний грант для email або null.
   */
  getActive(email: string): GrantApplication | null {
    const now = new Date();
    for (const [k, app] of this.applications.entries()) {
      if (!k.startsWith(email.toLowerCase() + ":")) continue;
      if (app.status !== "approved") continue;
      if (app.expiresAt && new Date(app.expiresAt) < now) continue;
      return { ...app };
    }
    return null;
  }

  /** Get a specific application by email + program. */
  get(email: string, program: GrantProgram): GrantApplication | null {
    return this.applications.get(this.key(email, program)) ?? null;
  }

  /** All pending applications (for admin review queue). */
  listPending(): GrantApplication[] {
    return Array.from(this.applications.values()).filter(
      (a) => a.status === "pending",
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global in-memory grant store. */
export const grantStore = new GrantStore();
