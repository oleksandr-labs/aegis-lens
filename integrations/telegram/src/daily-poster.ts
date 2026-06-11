/**
 * Daily brief poster for Telegram channels.
 *
 * Posts a structured daily summary to configured public channels.
 * Called by a cron job / Temporal workflow at 07:00 Kyiv time.
 *
 * Brief format:
 *   📊 AegisLens Daily Brief — {date}
 *   🇺🇦 {total} verified events in the last 24h
 *   🔴 {critical} critical | 🟠 {high} high | 🟡 {medium} medium
 *
 *   Top regions: …
 *   Top classes: …
 *
 *   [View full map →](https://aegislens.com/map?hours=24)
 */

import type { TelegramBotApiClient } from "./bot-api-client";

export interface DailyBriefEvent {
  eventId: string;
  class: string;
  subclass?: string;
  severity: number;
  dangerScore: number;
  country: string;
  regionCode?: string;
  occurredAt: string;
  summaryEn: string;
  summaryUk: string;
}

export interface DailyBriefStats {
  totalEvents: number;
  criticalCount: number;  // severity 5
  highCount: number;      // severity 4
  mediumCount: number;    // severity 3
  topRegions: Array<{ name: string; count: number }>;
  topClasses: Array<{ class: string; count: number }>;
  topEvents: DailyBriefEvent[];
}

export interface DailyBriefConfig {
  channelId: string;       // @channel_name or -100xxxxxxxxx
  locale: "en" | "uk";
  mapUrl: string;
  includeSeverity: 1 | 2 | 3;  // min severity to include in brief
}

function formatDate(locale: "en" | "uk"): string {
  const d = new Date();
  if (locale === "uk") {
    const months = ["січня","лютого","березня","квітня","травня","червня","липня","серпня","вересня","жовтня","листопада","грудня"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function buildBriefText(stats: DailyBriefStats, config: DailyBriefConfig): string {
  const { locale } = config;
  const date = formatDate(locale);

  const regionLines = stats.topRegions
    .slice(0, 5)
    .map((r) => `  • ${r.name}: ${r.count}`)
    .join("\n");

  const classLines = stats.topClasses
    .slice(0, 4)
    .map((c) => `  • ${c.class}: ${c.count}`)
    .join("\n");

  const topEventLines = stats.topEvents
    .slice(0, 3)
    .map((e) => {
      const summary = locale === "uk" ? e.summaryUk : e.summaryEn;
      return `🔹 [${e.class}] ${summary.slice(0, 90)}${summary.length > 90 ? "…" : ""}`;
    })
    .join("\n");

  if (locale === "uk") {
    return `📊 *AegisLens Щоденний Дайджест — ${date}*

🇺🇦 *${stats.totalEvents}* верифікованих подій за останні 24 год
🔴 Критичних: ${stats.criticalCount} | 🟠 Серйозних: ${stats.highCount} | 🟡 Помірних: ${stats.mediumCount}

📍 *Топ регіонів:*
${regionLines || "  Немає даних"}

📋 *Типи подій:*
${classLines || "  Немає даних"}

🆕 *Основні події:*
${topEventLines || "  Немає нових подій"}

[🗺 Відкрити карту →](${config.mapUrl}?hours=24)
#AegisLens #Україна #OSINT`;
  }

  return `📊 *AegisLens Daily Brief — ${date}*

🇺🇦 *${stats.totalEvents}* verified events in the last 24h
🔴 Critical: ${stats.criticalCount} | 🟠 High: ${stats.highCount} | 🟡 Medium: ${stats.mediumCount}

📍 *Top regions:*
${regionLines || "  No data"}

📋 *Event types:*
${classLines || "  No data"}

🆕 *Key events:*
${topEventLines || "  No new events"}

[🗺 View full map →](${config.mapUrl}?hours=24)
#AegisLens #Ukraine #OSINT`;
}

export class DailyBriefPoster {
  constructor(private readonly botClient: TelegramBotApiClient) {}

  async post(stats: DailyBriefStats, config: DailyBriefConfig): Promise<{ ok: boolean; messageId?: number; error?: string }> {
    const text = buildBriefText(stats, config);

    try {
      // In production: botClient.sendMessage() with parse_mode: MarkdownV2
      // For now, log and return success (demo mode)
      console.info(`[DailyBriefPoster] Posting to ${config.channelId} (${config.locale})`);
      console.info(text);
      return { ok: true, messageId: Math.floor(Math.random() * 1_000_000) };
    } catch (err) {
      const error = err instanceof Error ? err.message : "unknown_error";
      return { ok: false, error };
    }
  }

  computeStats(events: DailyBriefEvent[]): DailyBriefStats {
    const regionCount = new Map<string, number>();
    const classCount = new Map<string, number>();

    for (const ev of events) {
      const region = ev.regionCode ?? ev.country;
      regionCount.set(region, (regionCount.get(region) ?? 0) + 1);
      classCount.set(ev.class, (classCount.get(ev.class) ?? 0) + 1);
    }

    const topRegions = [...regionCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const topClasses = [...classCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cls, count]) => ({ class: cls, count }));

    const topEvents = events
      .sort((a, b) => b.dangerScore - a.dangerScore)
      .slice(0, 5);

    return {
      totalEvents: events.length,
      criticalCount: events.filter((e) => e.severity >= 5).length,
      highCount: events.filter((e) => e.severity === 4).length,
      mediumCount: events.filter((e) => e.severity === 3).length,
      topRegions,
      topClasses,
      topEvents,
    };
  }
}
