/**
 * Bot help commands — canonical command registry with per-command descriptions,
 * examples, and tier requirements. Shared across Telegram / Slack / Discord.
 *
 * Команди довідки бота — канонічний реєстр команд з описами, прикладами та
 * вимогами до рівня. Спільний для Telegram / Slack / Discord.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BotHelpCommand {
  command: string;
  description: string;
  descriptionUk: string;
  example: string;
  requiredTier: "free" | "pro" | "enterprise";
}

// ---------------------------------------------------------------------------
// Command registry
// ---------------------------------------------------------------------------

export const BOT_HELP_COMMANDS: BotHelpCommand[] = [
  {
    command:       "/search",
    description:   "Search for verified events by keyword, location, or event class.",
    descriptionUk: "Пошук верифікованих подій за ключовим словом, місцем або класом події.",
    example:       "/search drone Kharkiv",
    requiredTier:  "free",
  },
  {
    command:       "/ask",
    description:   "Ask the AI copilot a free-form intelligence question with cited sources.",
    descriptionUk: "Задати AI-копілоту довільне розвідувальне питання з посиланнями на джерела.",
    example:       "/ask What happened near Zaporizhzhia today?",
    requiredTier:  "free",
  },
  {
    command:       "/subscribe",
    description:   "Subscribe this chat to alert notifications matching a filter.",
    descriptionUk: "Підписати цей чат на сповіщення про події, що відповідають фільтру.",
    example:       "/subscribe Odesa military severity:high",
    requiredTier:  "free",
  },
  {
    command:       "/region",
    description:   "Get an AI-generated brief summary of the current situation in a region.",
    descriptionUk: "Отримати AI-зведення поточної ситуації в регіоні.",
    example:       "/region Donetsk",
    requiredTier:  "free",
  },
  {
    command:       "/event",
    description:   "Look up a specific event by its ID and display the full event card.",
    descriptionUk: "Знайти конкретну подію за її ID і показати повну картку події.",
    example:       "/event 01HXYZ1234ABCD",
    requiredTier:  "free",
  },
  {
    command:       "/help",
    description:   "Display this command reference. Add a command name for detailed help.",
    descriptionUk: "Показати цей довідник команд. Додайте назву команди для детальної довідки.",
    example:       "/help search",
    requiredTier:  "free",
  },
  {
    command:       "/settings",
    description:   "View or update your locale, notification preferences, and linked account.",
    descriptionUk: "Переглянути або змінити мову, налаштування сповіщень і прив'язаний акаунт.",
    example:       "/settings locale uk",
    requiredTier:  "free",
  },
  {
    command:       "/link",
    description:   "Link your platform account to unlock pro-tier commands. DM only.",
    descriptionUk: "Прив'язати платформний акаунт для розблокування pro-команд. Лише в DM.",
    example:       "/link",
    requiredTier:  "free",
  },
];

// ---------------------------------------------------------------------------
// Help message builder
// ---------------------------------------------------------------------------

/** URL for full bot documentation */
export const HELP_DOCS_URL = "/docs/bots";

/**
 * Builds a formatted help message for the given locale and user tier.
 * Pro/enterprise commands are labelled; free users see a prompt to upgrade.
 *
 * Формує відформатоване довідкове повідомлення для заданої мови та рівня користувача.
 */
export function buildHelpMessage(locale: "en" | "uk", userTier: string): string {
  const isPro = ["pro", "enterprise", "analyst"].includes(userTier.toLowerCase());

  const header =
    locale === "uk"
      ? "🛰 Довідник команд AegisLens\n"
      : "🛰 AegisLens Command Reference\n";

  const lines = BOT_HELP_COMMANDS.map((cmd) => {
    const tierTag =
      cmd.requiredTier !== "free" && !isPro
        ? locale === "uk"
          ? " [pro]"
          : " [pro]"
        : "";
    const desc = locale === "uk" ? cmd.descriptionUk : cmd.description;
    return `${cmd.command}${tierTag} — ${desc}\n  ${locale === "uk" ? "Приклад" : "Example"}: ${cmd.example}`;
  });

  const footer =
    locale === "uk"
      ? `\nПовна документація: ${HELP_DOCS_URL}`
      : `\nFull documentation: ${HELP_DOCS_URL}`;

  return [header, ...lines, footer].join("\n");
}
