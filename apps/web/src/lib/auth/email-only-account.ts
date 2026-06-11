/**
 * Email-Only Account — lightweight account for pass purchasers.
 *
 * Allows users to purchase Day/Event/Press passes without completing a full
 * signup flow. The account is identified solely by email address; a magic-link
 * is sent on every login. Can be upgraded to a full account at any time.
 *
 * Легкий акаунт тільки з email — для покупців перепусток без повної реєстрації.
 */

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * Note explaining the email-only account concept — English.
 * No password required. Login via one-time magic link sent to the email.
 * Upgradeable to a full account with profile, preferences and API access.
 */
export const EMAIL_ONLY_NOTE_EN =
  "An email-only account requires no password. " +
  "You receive a magic link each time you sign in. " +
  "Upgrade to a full account at any time to unlock API access, " +
  "watchlists, and personalized settings.";

/**
 * Note explaining the email-only account concept — Ukrainian.
 * Пароль не потрібен. Вхід через одноразове посилання, надіслане на email.
 * Можна в будь-який момент перейти на повний акаунт.
 */
export const EMAIL_ONLY_NOTE_UK =
  "Акаунт тільки з email не потребує пароля. " +
  "Ви отримуєте чарівне посилання щоразу при вході. " +
  "У будь-який момент перейдіть на повний акаунт, " +
  "щоб отримати доступ до API, списків спостереження та налаштувань.";

// ── EmailOnlyAccount ───────────────────────────────────────────────────────────

export interface EmailOnlyAccount {
  id: string;
  email: string;
  /** ISO timestamp when the account was created */
  createdAt: string;
  /** Whether the account has been upgraded to a full account */
  upgraded: boolean;
  /** ISO timestamp of the last magic-link login, or null if never logged in */
  lastLoginAt: string | null;
  /** Active pass IDs associated with this account */
  passIds: string[];
}

// ── EmailOnlyStore ─────────────────────────────────────────────────────────────

export class EmailOnlyStore {
  /** Map<email (normalised), EmailOnlyAccount> */
  private readonly accounts = new Map<string, EmailOnlyAccount>();
  private counter = 0;

  // ── createEmailOnlyAccount ─────────────────────────────────────────────────

  /**
   * Create a new email-only account, or return the existing one for this email.
   * Email addresses are normalised to lower-case.
   *
   * Створює новий акаунт або повертає наявний за адресою (реєстронезалежно).
   */
  createEmailOnlyAccount(email: string): EmailOnlyAccount {
    const normalised = email.trim().toLowerCase();

    if (!normalised || !normalised.includes("@")) {
      throw new Error(
        `[email-only-account] Invalid email address: "${email}"`,
      );
    }

    const existing = this.accounts.get(normalised);
    if (existing) return existing;

    const account: EmailOnlyAccount = {
      id: `eoa-${++this.counter}-${Date.now()}`,
      email: normalised,
      createdAt: new Date().toISOString(),
      upgraded: false,
      lastLoginAt: null,
      passIds: [],
    };

    this.accounts.set(normalised, account);
    return account;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * Look up an account by email (case-insensitive).
   * Повертає акаунт за email або null.
   */
  findByEmail(email: string): EmailOnlyAccount | null {
    return this.accounts.get(email.trim().toLowerCase()) ?? null;
  }

  /**
   * Look up an account by ID.
   * Повертає акаунт за ID або null.
   */
  findById(id: string): EmailOnlyAccount | null {
    for (const account of this.accounts.values()) {
      if (account.id === id) return account;
    }
    return null;
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  /**
   * Record a successful magic-link login.
   * Записує факт входу через magic-link.
   */
  recordLogin(email: string): void {
    const account = this.accounts.get(email.trim().toLowerCase());
    if (account) {
      account.lastLoginAt = new Date().toISOString();
    }
  }

  /**
   * Attach a pass ID to the account (called after Checkout success).
   * Прив'язує перепустку до акаунту після успішної оплати.
   */
  attachPass(email: string, passId: string): void {
    const account = this.accounts.get(email.trim().toLowerCase());
    if (account && !account.passIds.includes(passId)) {
      account.passIds.push(passId);
    }
  }

  /**
   * Mark the account as upgraded to a full account.
   * Позначає акаунт як оновлений до повного.
   */
  markUpgraded(email: string): void {
    const account = this.accounts.get(email.trim().toLowerCase());
    if (account) {
      account.upgraded = true;
    }
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────────

/** Global in-memory email-only account store. */
export const emailOnlyStore = new EmailOnlyStore();

// ── Convenience re-export ──────────────────────────────────────────────────────

/**
 * Create (or retrieve) an email-only account for a pass purchaser.
 * Зручна функція-обгортка навколо emailOnlyStore.createEmailOnlyAccount().
 */
export function createEmailOnlyAccount(email: string): EmailOnlyAccount {
  return emailOnlyStore.createEmailOnlyAccount(email);
}
