/**
 * Private bot feature gating for paid (pro/enterprise/analyst) users.
 *
 * The private @AegisLensBot instance exposes advanced commands exclusively
 * to users whose subscription tier is eligible. Eligibility is verified via
 * the auth-link flow (/link command).
 *
 * Закритий бот для платних користувачів (pro / enterprise / analyst).
 * Приватний екземпляр @AegisLensBot надає розширені команди виключно
 * користувачам з відповідним рівнем підписки. Перевірка — через /link.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PrivateBotFeature =
  | "advanced_search"
  | "watchlist_alerts"
  | "full_report_preview"
  | "bulk_export"
  | "custom_aois";

// ---------------------------------------------------------------------------
// Feature list
// ---------------------------------------------------------------------------

/**
 * Features available to pro+ users through the private bot instance.
 * Функції, доступні через приватного бота для рівнів pro+.
 */
export const PRIVATE_BOT_FEATURES: PrivateBotFeature[] = [
  "advanced_search",
  "watchlist_alerts",
  "full_report_preview",
  "bulk_export",
  "custom_aois",
];

// ---------------------------------------------------------------------------
// Eligibility check
// ---------------------------------------------------------------------------

const ELIGIBLE_TIERS = new Set(["pro", "enterprise", "analyst"]);

/**
 * Returns true if the given subscription tier grants access to the private bot.
 * Повертає true, якщо рівень підписки надає доступ до приватного бота.
 */
export function isPrivateBotEligible(userTier: string): boolean {
  return ELIGIBLE_TIERS.has(userTier.toLowerCase());
}

// ---------------------------------------------------------------------------
// Welcome message builder
// ---------------------------------------------------------------------------

const WELCOME_EN =
  "Welcome to AegisLens Private — your pro-tier intelligence assistant.\n\n" +
  "Available commands:\n" +
  "/search <query> — advanced semantic search\n" +
  "/watchlist — manage your watchlist alerts\n" +
  "/report <id> — full report preview\n" +
  "/export <filter> — bulk export events\n" +
  "/aoi — manage custom areas of interest\n" +
  "/help — full command reference\n\n" +
  "Use /link to verify your account if commands are restricted.";

const WELCOME_UK =
  "Ласкаво просимо до AegisLens Private — вашого pro-помічника з розвідки.\n\n" +
  "Доступні команди:\n" +
  "/search <запит> — розширений семантичний пошук\n" +
  "/watchlist — керування сповіщеннями списку спостереження\n" +
  "/report <id> — повний перегляд звіту\n" +
  "/export <фільтр> — масовий експорт подій\n" +
  "/aoi — керування зонами інтересів\n" +
  "/help — повний довідник команд\n\n" +
  "Використайте /link для верифікації акаунту, якщо команди обмежені.";

/**
 * Returns the bilingual welcome message for the private bot.
 * Повертає двомовне привітальне повідомлення для приватного бота.
 */
export function buildPrivateBotWelcomeMessage(locale: "en" | "uk"): string {
  return locale === "uk" ? WELCOME_UK : WELCOME_EN;
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const PRIVATE_BOT_NOTES_EN: string[] = [
  "@AegisLensBot-private-commands: the private bot instance is a separate Telegram Bot Token (TELEGRAM_PRIVATE_BOT_TOKEN env var); it shares the same handler logic but gates commands behind isPrivateBotEligible().",
  "pro-subscription-required: users on the free tier who attempt private-bot commands receive a paywall nudge linking to /pricing#pro.",
  "verify-via-/link-command: all private bot commands require a confirmed BotAuthLink (status 'confirmed') — unlinked users are prompted to run /link first.",
];

export const PRIVATE_BOT_NOTES_UK: string[] = [
  "@AegisLensBot-private-commands: приватний бот використовує окремий токен (env TELEGRAM_PRIVATE_BOT_TOKEN); логіка обробника спільна, але команди блокуються через isPrivateBotEligible().",
  "pro-subscription-required: користувачі на безкоштовному рівні, які намагаються використовувати команди приватного бота, отримують paywall-підказку з посиланням на /pricing#pro.",
  "verify-via-/link-command: всі команди приватного бота вимагають підтвердженого BotAuthLink (статус 'confirmed') — незв'язаним користувачам пропонується спочатку виконати /link.",
];
