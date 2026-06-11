/**
 * POST /api/integrations/telegram/daily-brief — trigger a daily brief post
 *
 * Called by a cron job at 07:00 Kyiv time (UTC+3 → 04:00 UTC).
 * Requires a bearer token matching CRON_SECRET env var.
 *
 * Body (optional):
 *   { "channelId": "@my_channel", "locale": "uk", "dryRun": true }
 *
 * In dry-run mode: returns the brief text without actually posting.
 */

import { NextResponse } from "next/server";
import { listEvents } from "@/lib/events-seed";

export const dynamic = "force-dynamic";

type Locale = "en" | "uk";

function formatDate(locale: Locale): string {
  const d = new Date();
  if (locale === "uk") {
    const months = ["січня","лютого","березня","квітня","травня","червня","липня","серпня","вересня","жовтня","листопада","грудня"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === "production" && cronSecret && token !== cronSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { channelId?: string; locale?: Locale; dryRun?: boolean } = {};
  try { body = await req.json(); } catch { /* optional */ }

  const locale = body.locale ?? "uk";
  const dryRun = body.dryRun ?? false;

  // Gather last 24h events
  const cutoff = Date.now() - 24 * 3600_000;
  const events = listEvents().filter((e) => Date.parse(e.occurredAt) >= cutoff);

  const criticalCount = events.filter((e) => (e.severity ?? 1) >= 5).length;
  const highCount = events.filter((e) => (e.severity ?? 1) === 4).length;
  const mediumCount = events.filter((e) => (e.severity ?? 1) === 3).length;

  const classCounts = new Map<string, number>();
  for (const ev of events) classCounts.set(ev.class, (classCounts.get(ev.class) ?? 0) + 1);
  const topClasses = [...classCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);

  const date = formatDate(locale);
  const mapUrl = "https://aegislens.com/map";

  const classLines = topClasses.map(([c, n]) => `  • ${c}: ${n}`).join("\n");
  const topEventLines = events
    .sort((a, b) => b.dangerScore - a.dangerScore)
    .slice(0, 3)
    .map((e) => `🔹 [${e.class}] ${(locale === "uk" ? e.summary?.uk : e.summary?.en) ?? e.summary?.en ?? ""}`.slice(0, 120))
    .join("\n");

  const text = locale === "uk"
    ? `📊 *AegisLens Щоденний Дайджест — ${date}*\n\n🇺🇦 *${events.length}* верифікованих подій за 24 год\n🔴 ${criticalCount} крит. | 🟠 ${highCount} серйоз. | 🟡 ${mediumCount} помірних\n\n📋 *Типи подій:*\n${classLines}\n\n🆕 *Ключові події:*\n${topEventLines}\n\n[🗺 Відкрити карту →](${mapUrl}?hours=24)\n#AegisLens #Україна`
    : `📊 *AegisLens Daily Brief — ${date}*\n\n🇺🇦 *${events.length}* verified events in 24h\n🔴 ${criticalCount} critical | 🟠 ${highCount} high | 🟡 ${mediumCount} medium\n\n📋 *Event types:*\n${classLines}\n\n🆕 *Key events:*\n${topEventLines}\n\n[🗺 Open map →](${mapUrl}?hours=24)\n#AegisLens #Ukraine`;

  if (dryRun) {
    return NextResponse.json({ data: { text, dryRun: true, eventCount: events.length } });
  }

  // In production: call Telegram Bot API sendMessage
  // For demo: just return the text
  return NextResponse.json({
    data: {
      posted: true,
      channelId: body.channelId ?? "@aegislens_alerts",
      locale,
      text,
      eventCount: events.length,
      isDemo: true,
    },
  });
}
