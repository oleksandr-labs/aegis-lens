/**
 * Per-user bot auth-linking — DM verification flow.
 *
 * Users DM the bot the /link command; the bot generates a short-lived auth link
 * token that the user confirms in the web app to bind their platform account to
 * their Telegram / Slack / Discord identity.
 *
 * Прив'язка акаунту через DM до бота.
 * Користувач надсилає /link боту в особисте повідомлення; бот генерує короткочасний
 * токен, який користувач підтверджує у веб-застосунку для прив'язки платформенного
 * акаунту до свого Telegram / Slack / Discord.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BotPlatform = "telegram" | "slack" | "discord";

export interface BotAuthLinkRequest {
  userId: string;
  platform: BotPlatform;
  platformUserId: string;
  authToken: string;
}

export type BotAuthLinkStatus = "pending" | "confirmed" | "expired" | "revoked";

export interface BotAuthLink {
  linkId: string;
  userId: string;
  platform: BotPlatform;
  platformUserId: string;
  status: BotAuthLinkStatus;
  createdAt: string;
  confirmedAt?: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Auth link time-to-live in minutes */
export const AUTH_LINK_TTL_MINUTES = 15;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export class BotAuthLinkStore {
  private readonly links = new Map<string, BotAuthLink>();
  private linkCounter = 0;

  /**
   * Creates a new pending auth link.
   * Створює новий незавершений запис прив'язки.
   */
  create(req: BotAuthLinkRequest): BotAuthLink {
    // Revoke any existing pending link for this user + platform
    for (const link of this.links.values()) {
      if (
        link.userId === req.userId &&
        link.platform === req.platform &&
        link.status === "pending"
      ) {
        link.status = "revoked";
      }
    }

    const linkId = `lnk_${Date.now()}_${++this.linkCounter}`;
    const entry: BotAuthLink = {
      linkId,
      userId:         req.userId,
      platform:       req.platform,
      platformUserId: req.platformUserId,
      status:         "pending",
      createdAt:      new Date().toISOString(),
    };
    this.links.set(linkId, entry);
    return entry;
  }

  /**
   * Confirms a pending auth link by linkId.
   * Returns the updated link or undefined if not found / expired.
   *
   * Підтверджує незавершену прив'язку за linkId.
   * Повертає оновлений запис або undefined, якщо не знайдено / прострочено.
   */
  confirm(linkId: string): BotAuthLink | undefined {
    const link = this.links.get(linkId);
    if (!link || link.status !== "pending") return undefined;

    const ageMs = Date.now() - new Date(link.createdAt).getTime();
    if (ageMs > AUTH_LINK_TTL_MINUTES * 60 * 1_000) {
      link.status = "expired";
      return undefined;
    }

    link.status = "confirmed";
    link.confirmedAt = new Date().toISOString();
    return link;
  }

  /**
   * Revokes all links for a given userId + platform combination.
   * Відкликає всі прив'язки для заданого userId + платформи.
   */
  revoke(userId: string, platform: BotPlatform): void {
    for (const link of this.links.values()) {
      if (link.userId === userId && link.platform === platform) {
        link.status = "revoked";
      }
    }
  }

  /** Returns all links for inspection / testing */
  list(): BotAuthLink[] {
    return Array.from(this.links.values());
  }
}

/** Module-level singleton */
export const botAuthLinkStore = new BotAuthLinkStore();

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const AUTH_LINK_NOTES_EN: string[] = [
  "DM-based-verification: the user must initiate the /link command in a private DM to the bot — group-chat linking is disallowed to prevent token interception.",
  "short-TTL: auth link tokens expire after AUTH_LINK_TTL_MINUTES (15 min); expired links return status 'expired' and a new /link must be issued.",
  "one-link-per-platform: creating a new link automatically revokes any existing pending link for the same userId + platform pair, preventing accumulation of stale tokens.",
];

export const AUTH_LINK_NOTES_UK: string[] = [
  "DM-based-verification: користувач має ініціювати команду /link у приватному DM до бота — прив'язка через груповий чат заборонена для запобігання перехопленню токена.",
  "short-TTL: токени прив'язки закінчуються через AUTH_LINK_TTL_MINUTES (15 хв); прострочені посилання повертають статус 'expired', і необхідно надіслати новий /link.",
  "one-link-per-platform: створення нового посилання автоматично відкликає будь-яке наявне незавершене посилання для тієї ж пари userId + платформа, запобігаючи накопиченню застарілих токенів.",
];
