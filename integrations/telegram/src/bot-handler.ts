/**
 * Telegram outbound bot command handler.
 *
 * Handles commands sent to the @AegisLens bot by linked users.
 * Commands: /search /region /event /subscribe /ask /help
 *
 * All responses are in the user's linked locale (default: en).
 * Formatting uses MarkdownV2 (same escaping as alert channel).
 */

import { TelegramBotApiClient, type TelegramMessage } from "./bot-api-client";

export type BotLocale = "en" | "uk" | "ru";

export interface BotContext {
  chatId: number;
  userId?: number;
  locale: BotLocale;
  /** Linked Aegis account ID if user authenticated */
  aegisUserId?: string;
}

export interface BotDependencies {
  /** Search events by query string — returns brief summaries */
  searchEvents(query: string, locale: BotLocale): Promise<EventBrief[]>;
  /** Get region brief — returns text summary */
  getRegionBrief(region: string, locale: BotLocale): Promise<string>;
  /** Get single event by ID */
  getEvent(eventId: string, locale: BotLocale): Promise<EventBrief | null>;
  /** Copilot answer */
  askCopilot(question: string, locale: BotLocale): Promise<string>;
  /** Subscribe chat to alert filter */
  subscribe(chatId: number, filter: string, locale: BotLocale): Promise<string>;
}

export interface EventBrief {
  eventId: string;
  summary: string;
  class: string;
  occurredAt: string;
  danger: number;
}

function escapeMarkdownV2(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

type CommandHandler = (args: string, ctx: BotContext) => Promise<string>;

const HELP_TEXT: Record<BotLocale, string> = {
  en: [
    "🛰 *AegisLens Bot Commands*",
    "",
    "/search \\<query\\> — find events",
    "/region \\<name\\> — region brief",
    "/event \\<id\\> — event detail",
    "/subscribe \\<filter\\> — set up alerts",
    "/ask \\<question\\> — AI copilot",
    "/help — this message",
  ].join("\n"),
  uk: [
    "🛰 *Команди AegisLens*",
    "",
    "/search \\<запит\\> — знайти події",
    "/region \\<назва\\> — зведення по регіону",
    "/event \\<id\\> — деталі події",
    "/subscribe \\<фільтр\\> — налаштувати сповіщення",
    "/ask \\<питання\\> — ШІ помічник",
    "/help — ця довідка",
  ].join("\n"),
  ru: [
    "🛰 *Команды AegisLens*",
    "",
    "/search \\<запрос\\> — найти события",
    "/region \\<название\\> — сводка по региону",
    "/event \\<id\\> — детали события",
    "/subscribe \\<фильтр\\> — настроить уведомления",
    "/ask \\<вопрос\\> — ИИ помощник",
    "/help — эта справка",
  ].join("\n"),
};

export class AegisLensBot {
  private readonly commands = new Map<string, CommandHandler>();

  constructor(
    private readonly client: TelegramBotApiClient,
    private readonly deps: BotDependencies,
  ) {
    this.registerCommands();
  }

  private registerCommands(): void {
    this.commands.set("help", async (_args, ctx) => HELP_TEXT[ctx.locale]);
    this.commands.set("start", async (_args, ctx) => HELP_TEXT[ctx.locale]);

    this.commands.set("search", async (args, ctx) => {
      if (!args.trim()) {
        return ctx.locale === "uk"
          ? "Вкажіть запит: /search ракета харків"
          : "Provide a query: /search drone kharkiv";
      }
      const results = await this.deps.searchEvents(args, ctx.locale);
      if (results.length === 0) {
        return ctx.locale === "uk" ? "Нічого не знайдено\\." : "No results found\\.";
      }
      return results
        .slice(0, 5)
        .map((e) =>
          `• [${escapeMarkdownV2(e.class)}] ${escapeMarkdownV2(e.summary.slice(0, 80))} \\(${escapeMarkdownV2(e.occurredAt.slice(0, 10))}\\)`,
        )
        .join("\n");
    });

    this.commands.set("region", async (args, ctx) => {
      if (!args.trim()) {
        return ctx.locale === "uk"
          ? "Вкажіть регіон: /region Харків"
          : "Specify a region: /region Kharkiv";
      }
      const brief = await this.deps.getRegionBrief(args.trim(), ctx.locale);
      return escapeMarkdownV2(brief);
    });

    this.commands.set("event", async (args, ctx) => {
      const eventId = args.trim();
      if (!eventId) {
        return ctx.locale === "uk"
          ? "Вкажіть ID події: /event 01HX\\.\\.\\."
          : "Provide event ID: /event 01HX\\.\\.\\.";
      }
      const ev = await this.deps.getEvent(eventId, ctx.locale);
      if (!ev) {
        return ctx.locale === "uk"
          ? "Подію не знайдено\\."
          : "Event not found\\.";
      }
      return [
        `*${escapeMarkdownV2(ev.class)}* — ${escapeMarkdownV2(ev.occurredAt.slice(0, 16))}`,
        escapeMarkdownV2(ev.summary),
        `Danger: ${ev.danger}/100`,
        `ID: \`${escapeMarkdownV2(ev.eventId)}\``,
      ].join("\n");
    });

    this.commands.set("ask", async (args, ctx) => {
      if (!args.trim()) {
        return ctx.locale === "uk"
          ? "Задайте питання: /ask Що відбувається у Харкові?"
          : "Ask a question: /ask What is happening in Kharkiv?";
      }
      const answer = await this.deps.askCopilot(args, ctx.locale);
      return escapeMarkdownV2(answer);
    });

    this.commands.set("subscribe", async (args, ctx) => {
      if (!args.trim()) {
        return ctx.locale === "uk"
          ? "Вкажіть фільтр: /subscribe Харків военный"
          : "Provide filter: /subscribe Kharkiv military";
      }
      const confirmation = await this.deps.subscribe(ctx.chatId, args, ctx.locale);
      return escapeMarkdownV2(confirmation);
    });
  }

  async handleUpdate(msg: TelegramMessage): Promise<void> {
    const text = msg.text ?? "";
    if (!text.startsWith("/")) return;

    const [rawCmd, ...rest] = text.split(" ");
    const cmd = (rawCmd ?? "").slice(1).toLowerCase().replace(/@.*$/, "");
    const args = rest.join(" ");

    const ctx: BotContext = {
      chatId: msg.chat.id,
      userId: undefined,
      locale: this.inferLocale(msg),
    };

    const handler = this.commands.get(cmd);
    const replyText = handler
      ? await handler(args, ctx).catch(() =>
          ctx.locale === "uk"
            ? "Виникла помилка\\. Спробуйте пізніше\\."
            : "An error occurred\\. Please try again\\.",
        )
      : ctx.locale === "uk"
        ? "Невідома команда\\. Введіть /help для довідки\\."
        : "Unknown command\\. Type /help for assistance\\.";

    await this.sendMessage(msg.chat.id, replyText);
  }

  private inferLocale(msg: TelegramMessage): BotLocale {
    // Prefer language from user settings if available
    // Fall back to chat language heuristic (Cyrillic detection)
    const text = msg.text ?? "";
    const cyrillicRatio = [...text].filter((c) => /[Ѐ-ӿ]/.test(c)).length / (text.length || 1);
    if (cyrillicRatio > 0.3) {
      // Distinguish UA vs RU: check for UA-specific letters
      const uaSpecific = /[іїєґ]/i.test(text);
      return uaSpecific ? "uk" : "ru";
    }
    return "en";
  }

  async sendMessage(chatId: number, text: string): Promise<void> {
    const base = `https://api.telegram.org/bot`;
    // The bot token is encapsulated in the client; reach it via the send method
    // In production, add sendMessage to TelegramBotApiClient
    void chatId;
    void text;
    // Placeholder — TelegramBotApiClient.sendMessage() to be called here
  }

  /** Poll for updates and process commands */
  async pollOnce(offset?: number): Promise<number | undefined> {
    const updates = await this.client.getUpdates(offset);
    let nextOffset = offset;
    for (const update of updates) {
      nextOffset = update.update_id + 1;
      const msg = update.message;
      if (msg) await this.handleUpdate(msg).catch(() => {});
    }
    return nextOffset;
  }
}
