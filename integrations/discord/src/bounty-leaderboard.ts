/**
 * Discord bounty leaderboard integration.
 * Renders a Discord Embed with top contributors ranked by QA accuracy and credits earned.
 *
 * Інтеграція таблиці лідерів бонусів Discord.
 * Рендерить Discord Embed з топ-контриб'юторами за точністю QA та зароблені кредити.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  totalDecisions: number;
  qaAccuracy: number;
  creditsEarned: number;
  rank: number;
}

export interface BountyLeaderboard {
  channelId: string;
  entries: LeaderboardEntry[];
  updatedAt: string;
  periodLabel: string;
  periodLabelUk: string;
}

// ---------------------------------------------------------------------------
// Embed builder
// ---------------------------------------------------------------------------

type DiscordEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

type DiscordEmbed = {
  title: string;
  description: string;
  color: number;
  fields: DiscordEmbedField[];
  footer: { text: string };
  timestamp: string;
};

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

/**
 * Builds a Discord Embed JSON payload for the bounty leaderboard.
 * Формує JSON Discord Embed для таблиці лідерів бонусів.
 */
export function buildLeaderboardEmbed(
  board: BountyLeaderboard,
  locale: "en" | "uk",
): DiscordEmbed {
  const title =
    locale === "uk"
      ? `🏆 Таблиця лідерів OSINT — ${board.periodLabelUk}`
      : `🏆 OSINT Bounty Leaderboard — ${board.periodLabel}`;

  const description =
    locale === "uk"
      ? "Топ контриб'юторів за точністю перевірки та заробленими кредитами цього тижня."
      : "Top contributors ranked by verification accuracy and credits earned this period.";

  const fields: DiscordEmbedField[] = board.entries.slice(0, 10).map((entry) => {
    const medal  = RANK_MEDALS[entry.rank] ?? `#${entry.rank}`;
    const accuracy = (entry.qaAccuracy * 100).toFixed(1);
    const name = `${medal} ${entry.displayName}`;
    const value =
      locale === "uk"
        ? `Рішень: **${entry.totalDecisions}** | Точність: **${accuracy}%** | Кредити: **${entry.creditsEarned}**`
        : `Decisions: **${entry.totalDecisions}** | Accuracy: **${accuracy}%** | Credits: **${entry.creditsEarned}**`;
    return { name, value, inline: false };
  });

  const footer =
    locale === "uk"
      ? { text: `Оновлено: ${new Date(board.updatedAt).toUTCString()} • Opt-in через /bounty join` }
      : { text: `Updated: ${new Date(board.updatedAt).toUTCString()} • Opt in with /bounty join` };

  return {
    title,
    description,
    // AegisLens brand orange: #F97316
    color:     0xf97316,
    fields,
    footer,
    timestamp: board.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const LEADERBOARD_NOTES_EN: string[] = [
  "weekly-update: the leaderboard embed is posted to the configured channelId every Monday at 09:00 UTC by a scheduled job; if the channel already has a pinned leaderboard message, it is edited in-place rather than sending a new message.",
  "opt-in-display: display names are only shown for users who have run /bounty join in the server; all others appear as 'Anonymous Analyst' in the embed to preserve privacy.",
];

export const LEADERBOARD_NOTES_UK: string[] = [
  "weekly-update: embed таблиці лідерів публікується у налаштований channelId щопонеділка о 09:00 UTC запланованим завданням; якщо в каналі вже є закріплене повідомлення таблиці — воно редагується на місці, а не надсилається нове.",
  "opt-in-display: імена відображаються лише для користувачів, які виконали /bounty join на сервері; всі інші відображаються як 'Anonymous Analyst' в embed для захисту приватності.",
];
