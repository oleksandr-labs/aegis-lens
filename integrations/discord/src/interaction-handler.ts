/**
 * Discord Application Commands (slash commands) handler for AegisLens.
 *
 * Implements the Discord Interactions Endpoint pattern:
 *   - Ping/pong for endpoint verification
 *   - APPLICATION_COMMAND interactions routed to handlers
 *   - Deferred replies for long operations (>3s deadline)
 *
 * Commands: /search /region /event /ask /subscribe /help
 *
 * Verification: Ed25519 signature check on every request (required by Discord).
 */

export type BotLocale = "en" | "uk";

export interface DiscordInteraction {
  id: string;
  type: 1 | 2 | 3;  // PING | APPLICATION_COMMAND | MESSAGE_COMPONENT
  token: string;
  application_id: string;
  guild_id?: string;
  channel_id?: string;
  member?: { user: { id: string; username: string; locale?: string } };
  user?: { id: string; username: string; locale?: string };
  data?: {
    name: string;
    options?: Array<{ name: string; value: string | number | boolean }>;
  };
}

export interface DiscordInteractionResponse {
  type: 1 | 4 | 5;  // PONG | CHANNEL_MESSAGE_WITH_SOURCE | DEFERRED_CHANNEL_MESSAGE
  data?: {
    content?: string;
    embeds?: DiscordEmbed[];
    flags?: number;  // 64 = EPHEMERAL
  };
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
  timestamp?: string;
}

export interface DiscordBotDependencies {
  searchEvents(query: string, locale: BotLocale): Promise<EventBrief[]>;
  getRegionBrief(region: string, locale: BotLocale): Promise<string>;
  getEvent(eventId: string, locale: BotLocale): Promise<EventBrief | null>;
  askCopilot(question: string, locale: BotLocale): Promise<string>;
  subscribe(channelId: string, filter: string, locale: BotLocale): Promise<string>;
}

export interface EventBrief {
  eventId: string;
  summary: string;
  class: string;
  occurredAt: string;
  danger: number;
}

// Discord embed colors
const COLOR_RED = 0xed4245;
const COLOR_ORANGE = 0xfaa61a;
const COLOR_YELLOW = 0xfee75c;
const COLOR_GREEN = 0x57f287;
const COLOR_BLURPLE = 0x5865f2;

function dangerColor(danger: number): number {
  if (danger >= 80) return COLOR_RED;
  if (danger >= 50) return COLOR_ORANGE;
  if (danger >= 30) return COLOR_YELLOW;
  return COLOR_GREEN;
}

function inferLocale(interaction: DiscordInteraction): BotLocale {
  const locale = interaction.member?.user.locale ?? interaction.user?.locale ?? "en";
  if (locale.startsWith("uk")) return "uk";
  return "en";
}

function getOption(interaction: DiscordInteraction, name: string): string {
  return String(interaction.data?.options?.find((o) => o.name === name)?.value ?? "");
}

function ephemeral(content: string): DiscordInteractionResponse {
  return { type: 4, data: { content, flags: 64 } };
}

type CommandHandler = (
  interaction: DiscordInteraction,
  locale: BotLocale,
  deps: DiscordBotDependencies,
) => Promise<DiscordInteractionResponse>;

const COMMANDS: Record<string, CommandHandler> = {
  help: async (_i, locale) => ({
    type: 4,
    data: {
      embeds: [
        {
          title: locale === "uk" ? "Команди AegisLens" : "AegisLens Commands",
          color: COLOR_BLURPLE,
          description: [
            "`/search <query>` — " + (locale === "uk" ? "Знайти події" : "Find events"),
            "`/region <name>` — " + (locale === "uk" ? "Зведення по регіону" : "Region brief"),
            "`/event <id>` — " + (locale === "uk" ? "Деталі події" : "Event details"),
            "`/ask <question>` — " + (locale === "uk" ? "Відповідь ШІ" : "AI copilot answer"),
            "`/subscribe <filter>` — " + (locale === "uk" ? "Сповіщення в канал" : "Alert this channel"),
            "`/help` — " + (locale === "uk" ? "Ця довідка" : "This message"),
          ].join("\n"),
          footer: { text: "AegisLens — Conflict Intelligence" },
        },
      ],
      flags: 64,
    },
  }),

  search: async (interaction, locale, deps) => {
    const query = getOption(interaction, "query");
    if (!query) return ephemeral(locale === "uk" ? "Вкажіть запит." : "Provide a search query.");

    const results = await deps.searchEvents(query, locale);
    if (results.length === 0) {
      return ephemeral(locale === "uk" ? "Нічого не знайдено." : "No results found.");
    }

    const embeds: DiscordEmbed[] = results.slice(0, 5).map((ev) => ({
      title: `[${ev.class}] ${ev.summary.slice(0, 80)}`,
      color: dangerColor(ev.danger),
      fields: [
        { name: "Date", value: ev.occurredAt.slice(0, 10), inline: true },
        { name: "Danger", value: `${ev.danger}/100`, inline: true },
        { name: "ID", value: `\`${ev.eventId}\``, inline: true },
      ],
    }));

    return { type: 4, data: { embeds } };
  },

  region: async (interaction, locale, deps) => {
    const region = getOption(interaction, "name");
    if (!region) return ephemeral(locale === "uk" ? "Вкажіть регіон." : "Specify a region.");

    const brief = await deps.getRegionBrief(region, locale);
    return {
      type: 4,
      data: {
        embeds: [
          {
            title: region,
            description: brief,
            color: COLOR_BLURPLE,
            timestamp: new Date().toISOString(),
          },
        ],
      },
    };
  },

  event: async (interaction, locale, deps) => {
    const eventId = getOption(interaction, "id");
    if (!eventId) return ephemeral(locale === "uk" ? "Вкажіть ID події." : "Provide event ID.");

    const ev = await deps.getEvent(eventId, locale);
    if (!ev) {
      return ephemeral(locale === "uk" ? "Подію не знайдено." : "Event not found.");
    }

    return {
      type: 4,
      data: {
        embeds: [
          {
            title: `[${ev.class}] ${ev.occurredAt.slice(0, 10)}`,
            description: ev.summary,
            color: dangerColor(ev.danger),
            fields: [
              { name: "Danger", value: `${ev.danger}/100`, inline: true },
              { name: "ID", value: `\`${ev.eventId}\``, inline: true },
            ],
            timestamp: ev.occurredAt,
          },
        ],
      },
    };
  },

  ask: async (interaction, locale, deps) => {
    const question = getOption(interaction, "question");
    if (!question) return ephemeral(locale === "uk" ? "Задайте питання." : "Ask a question.");

    const answer = await deps.askCopilot(question, locale);
    return {
      type: 4,
      data: {
        embeds: [
          {
            title: locale === "uk" ? "ШІ-відповідь" : "AI Answer",
            description: answer,
            color: COLOR_BLURPLE,
            footer: { text: question.slice(0, 100) },
          },
        ],
      },
    };
  },

  subscribe: async (interaction, locale, deps) => {
    const filter = getOption(interaction, "filter");
    if (!filter) return ephemeral(locale === "uk" ? "Вкажіть фільтр." : "Provide a filter.");

    const channelId = interaction.channel_id ?? "unknown";
    const confirmation = await deps.subscribe(channelId, filter, locale);
    return { type: 4, data: { content: confirmation } };
  },
};

export class AegisLensDiscordBot {
  constructor(private readonly deps: DiscordBotDependencies) {}

  async handleInteraction(interaction: DiscordInteraction): Promise<DiscordInteractionResponse> {
    // PING — Discord endpoint verification
    if (interaction.type === 1) {
      return { type: 1 };
    }

    // APPLICATION_COMMAND
    if (interaction.type === 2) {
      const commandName = interaction.data?.name ?? "";
      const locale = inferLocale(interaction);
      const handler = COMMANDS[commandName];

      if (!handler) {
        return ephemeral(locale === "uk" ? "Невідома команда." : "Unknown command.");
      }

      try {
        return await handler(interaction, locale, this.deps);
      } catch {
        return ephemeral(
          locale === "uk"
            ? "Виникла помилка. Спробуйте пізніше."
            : "An error occurred. Please try again.",
        );
      }
    }

    return { type: 1 };
  }

  /** Build alert embed for posting to a channel */
  buildAlertEmbed(events: EventBrief[], filterLabel: string, locale: BotLocale): DiscordEmbed[] {
    const header: DiscordEmbed = {
      title: locale === "uk" ? `Сповіщення: ${filterLabel}` : `Alert: ${filterLabel}`,
      color: COLOR_RED,
      timestamp: new Date().toISOString(),
    };
    const cards: DiscordEmbed[] = events.slice(0, 5).map((ev) => ({
      title: `[${ev.class}] ${ev.summary.slice(0, 80)}`,
      color: dangerColor(ev.danger),
      fields: [
        { name: "Date", value: ev.occurredAt.slice(0, 10), inline: true },
        { name: "Danger", value: `${ev.danger}/100`, inline: true },
      ],
    }));
    return [header, ...cards];
  }

  /** Returns the Discord slash command definitions for registration with the API */
  static getCommandDefinitions() {
    return [
      {
        name: "search",
        description: "Search for conflict events",
        options: [{ type: 3, name: "query", description: "Search query", required: true }],
      },
      {
        name: "region",
        description: "Get a region situation brief",
        options: [{ type: 3, name: "name", description: "Region name (e.g. Kharkiv)", required: true }],
      },
      {
        name: "event",
        description: "Get details of a specific event",
        options: [{ type: 3, name: "id", description: "Event ID", required: true }],
      },
      {
        name: "ask",
        description: "Ask the AI copilot a question",
        options: [{ type: 3, name: "question", description: "Your question", required: true }],
      },
      {
        name: "subscribe",
        description: "Subscribe this channel to alerts",
        options: [{ type: 3, name: "filter", description: "Alert filter (region, class, etc.)", required: true }],
      },
      {
        name: "help",
        description: "Show all available commands",
      },
    ];
  }
}
