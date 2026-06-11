/**
 * GET /api/integrations/milbloggers — curated milblogger allow-list + side-by-side
 * narrative comparison.
 *
 * Backs the editorial allow-list widget and the "UA vs RU framing of the same
 * event" comparison surface. Mirrors `integrations/milbloggers/src/` (registry,
 * side-label invariant, narrative-compare). Ships a DEMO payload so it renders
 * without live ingest.
 *
 * NO FALSE EQUIVALENCE: RU-side entries always carry a mandatory opposition
 * label, the comparison view always carries a disclaimer, and RU material is
 * never presented as equally credible to UA/INT reporting.
 *
 * Query params:
 *   side    — ua | ru | int   (filter the allow-list)
 *   view    — list | compare  (default list)
 *
 * Self-contained (no @ua-map alias in apps/web).
 *
 * Cache: dynamic (curated list changes rarely; comparison is per-event).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type Side = "ua" | "ru" | "int";
interface L10n { en: string; uk: string; ru?: string }

interface AccountView {
  id: string;
  handle: string;
  platform: string;
  name: string;
  side: Side;
  oppositionLabel?: L10n;
  reputation: number;
  tags: string[];
}

const SIDE_LABELS: Record<Side, L10n> = {
  ua: { en: "Ukrainian side", uk: "Українська сторона", ru: "Украинская сторона" },
  int: { en: "International OSINT", uk: "Міжнародний OSINT", ru: "Международный OSINT" },
  ru: {
    en: "Russian side (opposing narrative — analysis only)",
    uk: "Російська сторона (протилежний наратив — лише для аналізу)",
    ru: "Российская сторона (противоположный нарратив — только для анализа)",
  },
};

const RU_OPPOSITION_LABEL: L10n = {
  en: "OPPOSING NARRATIVE — tracked for analysis only; not a trusted source.",
  uk: "ПРОТИЛЕЖНИЙ НАРАТИВ — відстежується лише для аналізу; не є надійним джерелом.",
  ru: "ПРОТИВОПОЛОЖНЫЙ НАРРАТИВ — отслеживается только для анализа; не является надёжным источником.",
};

const DISCLAIMER: L10n = {
  en: "Both framings are shown for analysis. They are NOT equally credible: the Russian-side column is opposing-narrative material tracked for comparison only, not verified reporting.",
  uk: "Обидва трактування показані для аналізу. Вони НЕ є однаково достовірними: колонка російської сторони — це матеріали протилежного наративу, що відстежуються лише для порівняння, а не перевірена інформація.",
  ru: "Оба трактования показаны для анализа. Они НЕ равнодостоверны: колонка российской стороны — это материалы противоположного нарратива, отслеживаемые только для сравнения, а не проверенная информация.",
};

const DEMO_ACCOUNTS: AccountView[] = [
  { id: "telegram:khorne_group", handle: "khorne_group", platform: "telegram", name: "Khorne Group", side: "ua", reputation: 0.82, tags: ["geolocation", "frontline", "drones"] },
  { id: "telegram:tryzub_osint", handle: "tryzub_osint", platform: "telegram", name: "Tryzub", side: "ua", reputation: 0.78, tags: ["frontline", "analysis"] },
  { id: "x:DeepStateUA", handle: "DeepStateUA", platform: "x", name: "DeepState UA", side: "ua", reputation: 0.8, tags: ["frontline", "geolocation"] },
  { id: "x:bellingcat", handle: "bellingcat", platform: "x", name: "Bellingcat", side: "int", reputation: 0.88, tags: ["investigative", "geolocation", "war_crimes"] },
  { id: "x:GeoConfirmed", handle: "GeoConfirmed", platform: "x", name: "GeoConfirmed", side: "int", reputation: 0.85, tags: ["geolocation", "equipment_id"] },
  { id: "x:Conflicts", handle: "Conflicts", platform: "x", name: "ConflictNews", side: "int", reputation: 0.7, tags: ["frontline", "analysis"] },
  { id: "telegram:ru_milblogger_a", handle: "ru_milblogger_a", platform: "telegram", name: "RU Milblogger A (opposition-tracked)", side: "ru", oppositionLabel: RU_OPPOSITION_LABEL, reputation: 0.25, tags: ["propaganda_analysis", "frontline"] },
  { id: "telegram:ru_milblogger_b", handle: "ru_milblogger_b", platform: "telegram", name: "RU Milblogger B (opposition-tracked)", side: "ru", oppositionLabel: RU_OPPOSITION_LABEL, reputation: 0.22, tags: ["propaganda_analysis", "air_defense"] },
];

/** A demo event framed by both camps for the comparison view. */
const DEMO_COMPARISON = {
  eventKey: "strike:pokrovsk:2026-06-06",
  title: {
    en: "Reported strike near Pokrovsk, 2026-06-06",
    uk: "Повідомлення про удар біля Покровська, 2026-06-06",
    ru: "Сообщения об ударе у Покровска, 2026-06-06",
  },
  aligned: {
    camp: "aligned",
    label: {
      en: `${SIDE_LABELS.ua.en} / ${SIDE_LABELS.int.en}`,
      uk: `${SIDE_LABELS.ua.uk} / ${SIDE_LABELS.int.uk}`,
      ru: `${SIDE_LABELS.ua.ru} / ${SIDE_LABELS.int.ru}`,
    },
    avgReputation: 0.84,
    posts: [
      { accountId: "telegram:khorne_group", text: "Geolocated strike on logistics node; BDA pending.", url: "https://example.invalid/khorne_group/1" },
      { accountId: "x:GeoConfirmed", text: "Confirmed coordinates; imagery matches terrain.", url: "https://example.invalid/GeoConfirmed/1" },
    ],
  },
  ru: {
    camp: "ru",
    label: SIDE_LABELS.ru,
    oppositionLabel: RU_OPPOSITION_LABEL,
    avgReputation: 0.24,
    posts: [
      { accountId: "telegram:ru_milblogger_a", text: "Заявляется об отражении удара ПВО.", url: "https://example.invalid/ru_milblogger_a/1" },
    ],
  },
  disclaimer: DISCLAIMER,
};

export async function GET(req: Request): Promise<NextResponse> {
  const rl = rateLimit(`milbloggers:${identifyRequest(req)}`, 60);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: rateLimitHeaders(rl) },
    );
  }

  const url = new URL(req.url);
  const view = url.searchParams.get("view") ?? "list";
  const side = url.searchParams.get("side") as Side | null;

  if (view === "compare") {
    return NextResponse.json(
      {
        methodology: "Editorially curated, not algorithmic. No false equivalence between sides.",
        sideLabels: SIDE_LABELS,
        comparison: DEMO_COMPARISON,
      },
      { headers: rateLimitHeaders(rl) },
    );
  }

  let accounts = DEMO_ACCOUNTS;
  if (side === "ua" || side === "ru" || side === "int") {
    accounts = accounts.filter((a) => a.side === side);
  }

  return NextResponse.json(
    {
      methodology: "Editorially curated allow-list. RU-side accounts are tracked for opposite-narrative analysis only and carry a mandatory opposition label.",
      sideLabels: SIDE_LABELS,
      count: accounts.length,
      accounts,
    },
    { headers: rateLimitHeaders(rl) },
  );
}
