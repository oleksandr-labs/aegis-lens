/**
 * Slack slash-command handler for AegisLens.
 *
 * Supported commands: /aegis-search /aegis-region /aegis-event /aegis-ask
 *                     /aegis-subscribe /aegis-help
 *
 * Responses use Slack Block Kit for rich formatting.
 * Long operations post to response_url (delayed responses, 30-min window).
 */

import { SlackBoltClient, type SlackSlashCommand, type SlackBlock, type SlackMessage } from "./bolt-client";

export type BotLocale = "en" | "uk";

export interface SlackBotDependencies {
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

const HELP_EN: SlackMessage = {
  response_type: "ephemeral",
  blocks: [
    SlackBoltClient.headerBlock("AegisLens Commands"),
    SlackBoltClient.sectionBlock(
      "*`/aegis-search <query>`* — Find recent conflict events\n" +
      "*`/aegis-region <name>`* — Regional situation brief\n" +
      "*`/aegis-event <id>`* — Single event details\n" +
      "*`/aegis-ask <question>`* — AI copilot answer\n" +
      "*`/aegis-subscribe <filter>`* — Alert this channel\n" +
      "*`/aegis-help`* — Show this message",
    ),
  ],
};

const HELP_UK: SlackMessage = {
  response_type: "ephemeral",
  blocks: [
    SlackBoltClient.headerBlock("Команди AegisLens"),
    SlackBoltClient.sectionBlock(
      "*`/aegis-search <запит>`* — Знайти нещодавні події\n" +
      "*`/aegis-region <назва>`* — Зведення по регіону\n" +
      "*`/aegis-event <id>`* — Деталі події\n" +
      "*`/aegis-ask <питання>`* — Відповідь ШІ\n" +
      "*`/aegis-subscribe <фільтр>`* — Сповіщення в цей канал\n" +
      "*`/aegis-help`* — Ця довідка",
    ),
  ],
};

function inferLocale(text: string): BotLocale {
  const cyrillicRatio = [...text].filter((c) => /[Ѐ-ӿ]/.test(c)).length / (text.length || 1);
  if (cyrillicRatio > 0.3) return "uk";
  return "en";
}

function dangerEmoji(danger: number): string {
  if (danger >= 80) return "🔴";
  if (danger >= 50) return "🟠";
  if (danger >= 30) return "🟡";
  return "🟢";
}

function eventBlocks(events: EventBrief[]): SlackBlock[] {
  const blocks: SlackBlock[] = [SlackBoltClient.headerBlock("Search Results")];
  for (const ev of events.slice(0, 5)) {
    blocks.push(SlackBoltClient.dividerBlock());
    blocks.push(
      SlackBoltClient.sectionBlock(
        `${dangerEmoji(ev.danger)} *[${ev.class}]* ${ev.summary.slice(0, 100)}\n` +
        `📅 ${ev.occurredAt.slice(0, 10)} · Danger: ${ev.danger}/100 · ID: \`${ev.eventId}\``,
      ),
    );
  }
  return blocks;
}

type CommandFn = (
  cmd: SlackSlashCommand,
  locale: BotLocale,
  deps: SlackBotDependencies,
) => Promise<SlackMessage>;

const COMMANDS: Record<string, CommandFn> = {
  "/aegis-help": async (_cmd, locale) => (locale === "uk" ? HELP_UK : HELP_EN),

  "/aegis-search": async (cmd, locale, deps) => {
    const query = cmd.text.trim();
    if (!query) {
      return {
        response_type: "ephemeral",
        text: locale === "uk"
          ? "Вкажіть запит: `/aegis-search ракета харків`"
          : "Provide a query: `/aegis-search drone kharkiv`",
      };
    }
    const results = await deps.searchEvents(query, locale);
    if (results.length === 0) {
      return {
        response_type: "ephemeral",
        text: locale === "uk" ? "Нічого не знайдено." : "No results found.",
      };
    }
    return { response_type: "in_channel", blocks: eventBlocks(results) };
  },

  "/aegis-region": async (cmd, locale, deps) => {
    const region = cmd.text.trim();
    if (!region) {
      return {
        response_type: "ephemeral",
        text: locale === "uk"
          ? "Вкажіть регіон: `/aegis-region Харків`"
          : "Specify a region: `/aegis-region Kharkiv`",
      };
    }
    const brief = await deps.getRegionBrief(region, locale);
    return {
      response_type: "in_channel",
      blocks: [
        SlackBoltClient.headerBlock(region),
        SlackBoltClient.sectionBlock(brief),
      ],
    };
  },

  "/aegis-event": async (cmd, locale, deps) => {
    const eventId = cmd.text.trim();
    if (!eventId) {
      return {
        response_type: "ephemeral",
        text: locale === "uk"
          ? "Вкажіть ID події: `/aegis-event 01HX...`"
          : "Provide event ID: `/aegis-event 01HX...`",
      };
    }
    const ev = await deps.getEvent(eventId, locale);
    if (!ev) {
      return {
        response_type: "ephemeral",
        text: locale === "uk" ? "Подію не знайдено." : "Event not found.",
      };
    }
    return {
      response_type: "in_channel",
      blocks: [
        SlackBoltClient.headerBlock(`${dangerEmoji(ev.danger)} ${ev.class}`),
        SlackBoltClient.sectionBlock(
          `${ev.summary}\n📅 ${ev.occurredAt.slice(0, 16)} · Danger: *${ev.danger}/100*\nID: \`${ev.eventId}\``,
        ),
      ],
    };
  },

  "/aegis-ask": async (cmd, locale, deps) => {
    const question = cmd.text.trim();
    if (!question) {
      return {
        response_type: "ephemeral",
        text: locale === "uk"
          ? "Задайте питання: `/aegis-ask Що відбувається у Харкові?`"
          : "Ask a question: `/aegis-ask What is happening in Kharkiv?`",
      };
    }
    const answer = await deps.askCopilot(question, locale);
    return {
      response_type: "in_channel",
      blocks: [
        SlackBoltClient.headerBlock(locale === "uk" ? "ШІ-відповідь" : "AI Answer"),
        SlackBoltClient.sectionBlock(`> ${question}`),
        SlackBoltClient.dividerBlock(),
        SlackBoltClient.sectionBlock(answer),
      ],
    };
  },

  "/aegis-subscribe": async (cmd, locale, deps) => {
    const filter = cmd.text.trim();
    if (!filter) {
      return {
        response_type: "ephemeral",
        text: locale === "uk"
          ? "Вкажіть фільтр: `/aegis-subscribe Харків military`"
          : "Provide filter: `/aegis-subscribe Kharkiv military`",
      };
    }
    const confirmation = await deps.subscribe(cmd.channel_id, filter, locale);
    return {
      response_type: "in_channel",
      text: confirmation,
    };
  },
};

export class AegisLensSlackBot {
  constructor(
    private readonly client: SlackBoltClient,
    private readonly deps: SlackBotDependencies,
  ) {}

  async handleSlashCommand(cmd: SlackSlashCommand): Promise<SlackMessage> {
    const locale = inferLocale(cmd.text);
    const handler = COMMANDS[cmd.command];

    if (!handler) {
      return {
        response_type: "ephemeral",
        text: locale === "uk"
          ? "Невідома команда. Спробуйте `/aegis-help`."
          : "Unknown command. Try `/aegis-help`.",
      };
    }

    try {
      return await handler(cmd, locale, this.deps);
    } catch {
      return {
        response_type: "ephemeral",
        text: locale === "uk"
          ? "Виникла помилка. Спробуйте пізніше."
          : "An error occurred. Please try again.",
      };
    }
  }

  /** Post an event alert to a channel (called by alert routing) */
  buildAlertMessage(
    events: EventBrief[],
    channelFilter: string,
    locale: BotLocale,
  ): SlackMessage {
    return {
      response_type: "in_channel",
      blocks: [
        SlackBoltClient.headerBlock(
          locale === "uk" ? `Сповіщення: ${channelFilter}` : `Alert: ${channelFilter}`,
        ),
        ...eventBlocks(events),
      ],
    };
  }

  getClient(): SlackBoltClient {
    return this.client;
  }
}
