export type ChangeType =
  | "feature"
  | "improvement"
  | "fix"
  | "breaking"
  | "security"
  | "deprecation";

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  highlight?: string; // one-line marketing summary
  changes: {
    type: ChangeType;
    text: string;
    link?: string;
  }[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.57.0",
    date: "2026-06-03",
    title: "Command Palette, Streaming Copilot & Analyst Dashboard",
    highlight:
      "⌘K command palette, streaming AI responses, and Bloomberg Terminal-style analyst dashboard.",
    changes: [
      {
        type: "feature",
        text: "Command Palette (⌘K) — 37 commands across 6 categories, global keyboard shortcut",
        link: "/map",
      },
      {
        type: "feature",
        text: "Streaming AI Copilot — real-time SSE streaming responses with inline citations",
      },
      {
        type: "feature",
        text: "Analyst Dashboard — KPI widgets, event feed, AI Morning Brief, alert rules panel",
      },
      {
        type: "feature",
        text: "Map Top Bar — LIVE indicator, country quick-jump, alerts bell, search",
      },
      {
        type: "feature",
        text: "Layer Carousel — animated showcase of all 5 intelligence layers on home page",
      },
      {
        type: "improvement",
        text: "FilterBar — severity (0-5) and confidence (0-100%) sliders + verification state filter",
      },
    ],
  },
  {
    version: "2.43.0",
    date: "2026-05-24",
    title: "Live Map Sprint — MapLibre Integration",
    highlight:
      "Real map engine with clustering, event markers, and geolocation engine.",
    changes: [
      {
        type: "feature",
        text: "MapLibre GL JS integration — desaturated tactical basemap",
      },
      {
        type: "feature",
        text: "Supercluster event clustering at all zoom levels",
      },
      {
        type: "feature",
        text: "Event inspector — click marker for class, severity, confidence, verification",
      },
      {
        type: "feature",
        text: "FilterBar — country, time window, event class filters synced to URL",
      },
      {
        type: "feature",
        text: "Live ticker on home page — last 10 verified events",
      },
      {
        type: "improvement",
        text: "NewsletterSignup — connected to /api/subscribe",
      },
    ],
  },
  {
    version: "2.0.0",
    date: "2026-05-01",
    title: "Platform Launch — Open Beta",
    highlight:
      "Aegis Lens launches in open beta with full Next.js App Router stack.",
    changes: [
      {
        type: "feature",
        text: "Next.js 15 App Router with i18n (EN + UK locales)",
      },
      {
        type: "feature",
        text: "Map placeholder with layer toggles and AI Copilot panel",
      },
      {
        type: "feature",
        text: "140+ page routes including programmatic SEO templates",
      },
      {
        type: "feature",
        text: "Event schema v1.0 with confidence + danger scoring",
      },
      {
        type: "feature",
        text: "RSS, Atom, and JSON Feed for all topics and regions",
      },
      {
        type: "feature",
        text: "PWA manifest + sitemap + robots.txt",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "2026-03-01",
    title: "Private Alpha",
    highlight: "First internal release for team testing.",
    changes: [
      { type: "feature", text: "Initial concept and architecture" },
      { type: "feature", text: "Seed data pipeline" },
    ],
  },
];

export const LATEST_VERSION = CHANGELOG[0]!.version;
