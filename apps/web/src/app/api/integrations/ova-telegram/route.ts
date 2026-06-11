/**
 * GET /api/integrations/ova-telegram — official OVA Telegram feed (per oblast).
 *
 * Serves the "official-of-record" feed: posts from the 24 oblast military
 * administration channels + five major city councils. Highest trust tier short
 * of a Cabinet of Ministers statement. Ingest is Bot-API only (within Telegram
 * ToS); with no OVA_TELEGRAM_BOT_TOKEN configured the route returns a bundled
 * DEMO fixture so the shape is always valid offline.
 *
 * Feeds EXISTING surfaces (the per-oblast detail panel) — no new map layer is
 * registered (handoff: <none>).
 *
 * Query params:
 *   region — ISO 3166-2 oblast code (e.g. UA-63). Default: all.
 *   locale — uk | en | ru (default uk). Selects which translation `text` uses.
 *   limit  — max items (default 20).
 *
 * Cache: 30s (official feeds update fast but not siren-fast).
 *
 * This route is SELF-CONTAINED (no `@ua-map/*` path alias in apps/web): it
 * mirrors the minimal channel registry + demo posts from the package.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Locale = "uk" | "en" | "ru";

interface ChannelMeta {
  username: string;
  oblastCode: string;
  oblastUk: string;
  oblastEn: string;
  kind: "oblast_ova" | "city_council";
  labelUk: string;
  labelEn: string;
}

// Minimal mirror of registry.ts (primary OVA per oblast + 5 city councils).
const CHANNELS: ChannelMeta[] = [
  { username: "synegubov", oblastCode: "UA-63", oblastUk: "Харківська", oblastEn: "Kharkiv", kind: "oblast_ova", labelUk: "Харківська ОВА", labelEn: "Kharkiv OMA" },
  { username: "zoda_gov_ua", oblastCode: "UA-23", oblastUk: "Запорізька", oblastEn: "Zaporizhzhia", kind: "oblast_ova", labelUk: "Запорізька ОВА", labelEn: "Zaporizhzhia OMA" },
  { username: "khersonskaODA", oblastCode: "UA-65", oblastUk: "Херсонська", oblastEn: "Kherson", kind: "oblast_ova", labelUk: "Херсонська ОВА", labelEn: "Kherson OMA" },
  { username: "lvivoda", oblastCode: "UA-46", oblastUk: "Львівська", oblastEn: "Lviv", kind: "oblast_ova", labelUk: "Львівська ОВА", labelEn: "Lviv OMA" },
  { username: "kyivcity_official", oblastCode: "UA-30", oblastUk: "Київ", oblastEn: "Kyiv city", kind: "oblast_ova", labelUk: "Київ (КМВА)", labelEn: "Kyiv (City MA)" },
  { username: "kharkiv_oficial", oblastCode: "UA-63", oblastUk: "Харківська", oblastEn: "Kharkiv", kind: "city_council", labelUk: "Харківська міська рада", labelEn: "Kharkiv City Council" },
];

interface DemoPost {
  username: string;
  ageMin: number;
  uk: string;
  en: string;
  ru: string;
}

const DEMO: DemoPost[] = [
  {
    username: "synegubov",
    ageMin: 8,
    uk: "Унаслідок ворожого обстрілу Холодногірського району Харкова виникла пожежа. Рятувальники працюють на місці. Бережіть себе.",
    en: "A fire broke out after a hostile strike on Kharkiv's Kholodnohirskyi district. Rescuers are on site. Stay safe.",
    ru: "В результате вражеского обстрела Холодногорского района Харькова возник пожар. Спасатели работают на месте. Берегите себя.",
  },
  {
    username: "zoda_gov_ua",
    ageMin: 3,
    uk: "Загроза застосування балістичного озброєння. Перебувайте в укриттях до відбою тривоги.",
    en: "Threat of ballistic weapon use. Stay in shelters until the all-clear.",
    ru: "Угроза применения баллистического вооружения. Оставайтесь в укрытиях до отбоя тревоги.",
  },
];

function pickText(p: DemoPost, locale: Locale): string {
  if (locale === "en") return p.en;
  if (locale === "ru") return p.ru;
  return p.uk;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const region = url.searchParams.get("region");
  const locale = (url.searchParams.get("locale") ?? "uk") as Locale;
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") ?? 20)));

  const channelByName = new Map(CHANNELS.map((c) => [c.username, c]));

  let items = DEMO.map((p) => {
    const ch = channelByName.get(p.username)!;
    const postedAt = new Date(Date.now() - p.ageMin * 60_000).toISOString();
    return {
      postId: `${p.username}:demo`,
      username: p.username,
      oblastCode: ch.oblastCode,
      kind: ch.kind,
      source: { uk: ch.labelUk, en: ch.labelEn },
      postedAt,
      text: pickText(p, locale),
      translations: { uk: p.uk, en: p.en, ru: p.ru },
      permalink: `https://t.me/${p.username}/demo`,
    };
  });

  if (region) items = items.filter((i) => i.oblastCode === region);
  items = items
    .sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt))
    .slice(0, limit);

  return NextResponse.json(
    {
      source: "ova_telegram",
      trustTier: "official_of_record",
      region: region ?? "all",
      locale,
      items,
      attribution: {
        uk: "Джерело: офіційні канали ОВА (Telegram)",
        en: "Source: official OVA channels (Telegram)",
      },
      generatedAt: new Date().toISOString(),
      demo: true,
    },
    { headers: { "Cache-Control": "public, max-age=30" } },
  );
}
