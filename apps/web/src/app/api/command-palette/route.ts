/**
 * GET /api/command-palette?q=<query> — fuzzy search for palette commands
 *
 * Returns a ranked list of commands, navigation items, and saved searches
 * matching the query. Used by the ⌘K command palette.
 *
 * Categories: navigate | search | filter | layer | action | ai
 * Rate: 120/min/IP (low-latency path, results should be <50ms in prod).
 */

import { NextResponse } from "next/server";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type CommandCategory = "navigate" | "search" | "filter" | "layer" | "action" | "ai";

interface PaletteCommand {
  id: string;
  category: CommandCategory;
  title: string;
  subtitle?: string;
  shortcut?: string;
  href?: string;
  action?: string;
  icon?: string;
}

const STATIC_COMMANDS: PaletteCommand[] = [
  // Navigate
  { id: "nav-home",      category: "navigate", title: "Go to Home",      shortcut: "g h", href: "/" },
  { id: "nav-map",       category: "navigate", title: "Go to Map",       shortcut: "g m", href: "/map" },
  { id: "nav-search",    category: "navigate", title: "Go to Search",    shortcut: "g s", href: "/search" },
  { id: "nav-dashboard", category: "navigate", title: "Go to Dashboard", shortcut: "g d", href: "/dashboard" },
  { id: "nav-cases",     category: "navigate", title: "Go to Cases",     shortcut: "g c", href: "/cases" },
  { id: "nav-alerts",    category: "navigate", title: "Go to Alerts",    shortcut: "g a", href: "/alerts" },
  { id: "nav-aois",      category: "navigate", title: "Go to AOIs",      href: "/aois" },
  { id: "nav-reports",   category: "navigate", title: "Go to Reports",   href: "/reports" },
  { id: "nav-settings",  category: "navigate", title: "Settings",        href: "/settings" },
  { id: "nav-review",    category: "navigate", title: "Review Queue",    href: "/review" },

  // Search
  { id: "search-events",     category: "search", title: "Search Events",      subtitle: "Full-text + semantic", shortcut: "/" },
  { id: "search-cases",      category: "search", title: "Search Cases",       href: "/cases?q=" },
  { id: "search-sources",    category: "search", title: "Search Sources",     href: "/sources?q=" },
  { id: "search-regions",    category: "search", title: "Search Regions",     href: "/regions?q=" },

  // Filter
  { id: "filter-24h",        category: "filter", title: "Last 24 hours",       action: "set-filter-24h" },
  { id: "filter-7d",         category: "filter", title: "Last 7 days",         action: "set-filter-7d" },
  { id: "filter-military",   category: "filter", title: "Military actions only", action: "set-class-military_action" },
  { id: "filter-civilian",   category: "filter", title: "Civilian alerts only", action: "set-class-civilian_alert" },
  { id: "filter-high-danger", category: "filter", title: "High danger (≥70)",  action: "set-min-danger-70" },
  { id: "filter-clear",      category: "filter", title: "Clear all filters",   shortcut: "Esc", action: "clear-filters" },

  // Layer
  { id: "layer-events",      category: "layer", title: "Toggle Events layer",          action: "toggle-layer-events" },
  { id: "layer-drones",      category: "layer", title: "Toggle Drones layer",          action: "toggle-layer-drones" },
  { id: "layer-missiles",    category: "layer", title: "Toggle Missiles layer",        action: "toggle-layer-missiles" },
  { id: "layer-infra",       category: "layer", title: "Toggle Infrastructure layer",  action: "toggle-layer-infrastructure" },
  { id: "layer-alerts",      category: "layer", title: "Toggle Civilian Alerts layer", action: "toggle-layer-civilian_alerts" },
  { id: "layer-satellite",   category: "layer", title: "Toggle Satellite imagery",     action: "toggle-layer-satellite" },
  { id: "layer-heatmap",     category: "layer", title: "Toggle Activity heatmap",      action: "toggle-layer-heatmap" },

  // Action
  { id: "action-new-case",    category: "action", title: "New Case File",      action: "create-case" },
  { id: "action-new-aoi",     category: "action", title: "Draw new AOI",       action: "create-aoi" },
  { id: "action-new-alert",   category: "action", title: "Create Alert Rule",  action: "create-alert" },
  { id: "action-export-csv",  category: "action", title: "Export events (CSV)", action: "export-csv" },
  { id: "action-export-geo",  category: "action", title: "Export events (GeoJSON)", action: "export-geojson" },
  { id: "action-share",       category: "action", title: "Share current view", shortcut: "⌘ ⇧ S", action: "share-view" },
  { id: "action-screenshot",  category: "action", title: "Screenshot map",     action: "screenshot-map" },

  // AI
  { id: "ai-copilot",         category: "ai", title: "Ask AI Copilot…",      shortcut: "?", action: "open-copilot" },
  { id: "ai-brief",           category: "ai", title: "Generate region brief", action: "generate-brief" },
  { id: "ai-create-rule",     category: "ai", title: "Create alert rule with AI", action: "open-rule-builder" },
  { id: "ai-summarize",       category: "ai", title: "Summarize selected events", action: "summarize-events" },
];

/** Simple fuzzy score: term match in title + category bonus */
function fuzzyScore(command: PaletteCommand, query: string): number {
  const q = query.toLowerCase();
  const title = command.title.toLowerCase();
  const category = command.category.toLowerCase();
  const subtitle = (command.subtitle ?? "").toLowerCase();

  if (title === q) return 100;
  if (title.startsWith(q)) return 80;
  if (title.includes(q)) return 60;
  if (subtitle.includes(q)) return 40;
  if (category.includes(q)) return 20;

  // Fuzzy: all chars present in order
  let pos = 0;
  for (const char of q) {
    const idx = title.indexOf(char, pos);
    if (idx === -1) return 0;
    pos = idx + 1;
  }
  return 10;
}

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`palette:${ip}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const url = new URL(req.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  const category = url.searchParams.get("category") as CommandCategory | null;
  const limitRaw = url.searchParams.get("limit");
  const limit = Math.min(Number(limitRaw) || 20, 50);

  let commands = STATIC_COMMANDS;

  if (category) {
    commands = commands.filter((c) => c.category === category);
  }

  if (query) {
    const scored = commands
      .map((c) => ({ command: c, score: fuzzyScore(c, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ command }) => command);

    commands = scored;
  }

  const data = commands.slice(0, limit);

  return NextResponse.json(
    { data, meta: { count: data.length, query } },
    {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
