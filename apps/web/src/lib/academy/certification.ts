/**
 * Academy Certification System — Aegis Lens / Ukrainian MAP
 *
 * Defines certification exams, digital credentials (Open Badges / Credly),
 * the in-memory credential store, and verification page copy.
 *
 * Система сертифікацій: іспити, цифрові бейджі, сховище облікових даних.
 * All monetary values in USD. Timestamps ISO 8601.
 */

// ── Certification Exams ───────────────────────────────────────────────────────

/**
 * A proctored certification exam linked to an Academy course or learning path.
 *
 * Прокторований іспит на сертифікацію, пов'язаний з курсом.
 */
export interface CertificationExam {
  /** Unique stable identifier. */
  id: string;
  /** The course ID this exam primarily belongs to (or "standalone"). */
  courseId: string;
  /** Exam title in English. */
  title_en: string;
  /** Exam title in Ukrainian. */
  title_uk: string;
  /** First-attempt price in USD. */
  priceUsd: number;
  /** Retake price in USD if first attempt failed after the free-retake window. */
  retakePriceUsd: number;
  /** Whether a free retake is offered within 30 days of a failed attempt. */
  retakeFreeWithin30Days: boolean;
  /** Exam time limit in minutes. */
  durationMinutes: number;
  /** Minimum percentage score required to pass (0–100). */
  passingScorePct: number;
  /** Whether the exam is human-proctored or AI-proctored. */
  isProctored: boolean;
  /** How many years the credential is valid before re-certification is required. */
  validityYears: number;
  /** Price in USD for re-certification after credential expiry. */
  recertificationPriceUsd: number;
  /** Credential provider for issuing the digital badge. */
  credentialProvider: "open-badges" | "credly" | "internal";
}

export const CERTIFICATION_EXAMS: CertificationExam[] = [
  {
    id: "cert-osint-analyst",
    courseId: "osint-bootcamp-cohort",
    title_en: "Certified OSINT Analyst (COA)",
    title_uk: "Сертифікований OSINT-аналітик (COA)",
    priceUsd: 199,
    retakePriceUsd: 99,
    retakeFreeWithin30Days: true,
    durationMinutes: 90,
    passingScorePct: 75,
    isProctored: true,
    validityYears: 2,
    recertificationPriceUsd: 99,
    credentialProvider: "open-badges",
  },
  {
    id: "cert-geolocation-specialist",
    courseId: "geolocation-fundamentals",
    title_en: "Certified Geolocation Specialist (CGS)",
    title_uk: "Сертифікований спеціаліст з геолокації (CGS)",
    priceUsd: 299,
    retakePriceUsd: 149,
    retakeFreeWithin30Days: true,
    durationMinutes: 60,
    passingScorePct: 80,
    isProctored: true,
    validityYears: 2,
    recertificationPriceUsd: 149,
    credentialProvider: "open-badges",
  },
  {
    id: "cert-conflict-intelligence-professional",
    courseId: "open-source-conflict-intelligence",
    title_en: "Certified Conflict Intelligence Professional (CCIP)",
    title_uk: "Сертифікований фахівець з конфліктної розвідки (CCIP)",
    priceUsd: 399,
    retakePriceUsd: 199,
    retakeFreeWithin30Days: true,
    durationMinutes: 120,
    passingScorePct: 80,
    isProctored: true,
    validityYears: 3,
    recertificationPriceUsd: 199,
    credentialProvider: "credly",
  },
];

// ── Digital Credentials ───────────────────────────────────────────────────────

/**
 * An issued digital credential (badge) for a specific user.
 *
 * Виданий цифровий бейдж для конкретного користувача.
 */
export interface DigitalCredential {
  /** Unique credential record ID. */
  certId: string;
  /** Platform user ID of the credential holder. */
  userId: string;
  /** ISO 8601 timestamp when the credential was earned. */
  earnedAt: string;
  /** ISO 8601 timestamp when the credential expires (undefined = perpetual). */
  expiresAt?: string;
  /** Public URL to verify this credential. */
  verificationUrl: string;
  /** Pre-built LinkedIn share URL. */
  linkedInShareUrl: string;
  /** URL of the badge image (PNG, square, 600×600). */
  badgeImageUrl: string;
}

// ── Credential Store ──────────────────────────────────────────────────────────

/**
 * In-memory credential store for development and single-instance deployments.
 * Sprint 2 swaps this for a database-backed implementation.
 *
 * In-memory сховище облікових даних (для dev та single-instance prod).
 */
export class CredentialStore {
  private readonly store = new Map<string, DigitalCredential>();

  /**
   * Issue a new digital credential.
   * Creates a deterministic verification token from certId + userId + timestamp.
   * Видає новий цифровий бейдж.
   */
  issue(certId: string, userId: string): DigitalCredential {
    const exam = CERTIFICATION_EXAMS.find((e) => e.id === certId);
    const now = new Date();
    const earnedAt = now.toISOString();

    // Compute expiry date from exam validity period
    let expiresAt: string | undefined;
    if (exam && exam.validityYears > 0) {
      const expiry = new Date(now);
      expiry.setFullYear(expiry.getFullYear() + exam.validityYears);
      expiresAt = expiry.toISOString();
    }

    // Simple deterministic token: base64 of certId:userId:earnedAt
    const raw = `${certId}:${userId}:${earnedAt}`;
    const token =
      typeof Buffer !== "undefined"
        ? Buffer.from(raw).toString("base64url")
        : btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

    const verificationUrl = `https://aegislens.com/credentials/verify/${token}`;
    const linkedInShareUrl = [
      "https://www.linkedin.com/profile/add",
      `?startTask=CERTIFICATION_NAME`,
      `&name=${encodeURIComponent(exam?.title_en ?? certId)}`,
      `&organizationId=0`,
      `&issueYear=${now.getFullYear()}`,
      `&issueMonth=${now.getMonth() + 1}`,
      `&certUrl=${encodeURIComponent(verificationUrl)}`,
    ].join("");

    const credential: DigitalCredential = {
      certId,
      userId,
      earnedAt,
      expiresAt,
      verificationUrl,
      linkedInShareUrl,
      badgeImageUrl: `https://aegislens.com/badges/${certId}.png`,
    };

    this.store.set(token, credential);
    return credential;
  }

  /**
   * Verify a credential by its public token.
   * Returns null if the token is unknown or the credential has expired.
   * Верифікує бейдж за публічним токеном.
   */
  verify(verificationToken: string): DigitalCredential | null {
    const cred = this.store.get(verificationToken);
    if (!cred) return null;

    if (cred.expiresAt && new Date(cred.expiresAt) < new Date()) {
      return null; // expired
    }

    return cred;
  }

  /**
   * Return all credentials issued to a given user.
   * Повертає всі бейджі конкретного користувача.
   */
  getByUser(userId: string): DigitalCredential[] {
    return Array.from(this.store.values()).filter((c) => c.userId === userId);
  }
}

/** Singleton credential store instance. */
export const credentialStore = new CredentialStore();

// ── Public page copy ──────────────────────────────────────────────────────────

/**
 * Copy text for the public credential verification page.
 * Текст для публічної сторінки верифікації бейджів.
 */
export const CREDENTIAL_VERIFICATION_PAGE_EN = `
## Verify an Aegis Lens Credential

Enter a verification URL or paste a credential token below to confirm the
authenticity of an Aegis Lens Academy certificate.

### What does this page verify?

This page checks that a credential:
- Was issued by Aegis Lens Academy
- Belongs to the stated holder
- Has not expired or been revoked

### About Aegis Lens Certifications

Aegis Lens Academy issues internationally recognised digital credentials for
OSINT professionals, conflict analysts, and verification journalists. All
credentials comply with the Open Badges v2.1 specification and can be shared
directly to LinkedIn, CVs, and professional portfolios.

### Questions?

Contact academy@aegislens.com for credential disputes, employer verification
requests, or bulk verification for hiring processes.
`.trim();
