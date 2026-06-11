/**
 * Press Embed Kit — iframes and hotlinkable chart assets for newsrooms.
 *
 * Provides ready-to-paste embed codes for 6 key widget types, plus a
 * machine-readable README for automated press-kit consumers.
 *
 * Набір вбудованих компонентів для редакцій (iframes + графіки).
 */

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface PressEmbedKitAsset {
  /** Unique slug for this embed type. / Унікальний slug типу вставки. */
  id: string;
  /** Human-readable title. / Назва для відображення. */
  title: string;
  /** Endpoint path (relative to base URL). / Шлях ендпоінту. */
  path: string;
  /** Embed method. / Метод вбудування. */
  embedType: "iframe" | "image" | "script";
  /** Recommended iframe width (px). / Рекомендована ширина iframe (px). */
  defaultWidth: number;
  /** Recommended iframe height (px). / Рекомендована висота (px). */
  defaultHeight: number;
  /** Whether hotlinking the asset URL is permitted. / Чи дозволено хотлінкінг. */
  hotlinkAllowed: boolean;
  /** Short description for the README. / Короткий опис для README. */
  description: string;
}

// ── Assets ────────────────────────────────────────────────────────────────────

/**
 * Six press-kit embed assets available to journalists.
 *
 * Шість вбудованих компонентів для журналістів.
 */
export const PRESS_KIT_ASSETS: readonly PressEmbedKitAsset[] = [
  {
    id: "live-map",
    title: "Live Conflict Map",
    path: "/embeds/map/live",
    embedType: "iframe",
    defaultWidth: 800,
    defaultHeight: 500,
    hotlinkAllowed: true,
    description:
      "Full-featured live map with configurable AOI and event filters.",
  },
  {
    id: "event-counter",
    title: "Event Counter Widget",
    path: "/embeds/widgets/event-counter",
    embedType: "iframe",
    defaultWidth: 320,
    defaultHeight: 120,
    hotlinkAllowed: true,
    description:
      "Running total of verified events today / this week / this month.",
  },
  {
    id: "heatmap",
    title: "Incident Heatmap",
    path: "/embeds/charts/heatmap",
    embedType: "iframe",
    defaultWidth: 700,
    defaultHeight: 420,
    hotlinkAllowed: true,
    description:
      "Geographic heatmap of incident density, exportable as PNG.",
  },
  {
    id: "compare-chart",
    title: "Week-over-Week Comparison Chart",
    path: "/embeds/charts/compare",
    embedType: "iframe",
    defaultWidth: 640,
    defaultHeight: 360,
    hotlinkAllowed: true,
    description:
      "Automated period-over-period bar chart with configurable period.",
  },
  {
    id: "timeline-playback",
    title: "Timeline Playback Player",
    path: "/embeds/timeline/player",
    embedType: "iframe",
    defaultWidth: 800,
    defaultHeight: 480,
    hotlinkAllowed: false,
    description:
      "Interactive timeline playback for a specified date range.",
  },
  {
    id: "daily-brief-card",
    title: "Daily Brief Card",
    path: "/embeds/briefs/latest",
    embedType: "iframe",
    defaultWidth: 480,
    defaultHeight: 280,
    hotlinkAllowed: true,
    description:
      "Today's AI-generated situational brief, updated at 06:00 UTC.",
  },
] as const;

// ── Notes ─────────────────────────────────────────────────────────────────────

/** Press kit usage note (English). */
export const PRESS_KIT_NOTE_EN =
  "All embeds are free for editorial use with attribution. " +
  "Hotlinkable image charts are served from a CDN and update automatically. " +
  "Add ?locale=uk to any URL for Ukrainian-language output.";

/** Press kit usage note (Ukrainian). / Примітка до набору вбудованих компонентів (Українська). */
export const PRESS_KIT_NOTE_UK =
  "Усі вбудовані компоненти безкоштовні для редакційного використання з атрибуцією. " +
  "Зображення графіків автоматично оновлюються з CDN. " +
  "Додайте ?locale=uk до будь-якого URL для виводу українською мовою.";

// ── README builder ────────────────────────────────────────────────────────────

/**
 * Build a Markdown README string for the press embed kit.
 *
 * Генерує Markdown README для набору вбудованих компонентів.
 */
export function buildPressKitReadme(baseUrl = "https://aegislens.uk"): string {
  const assetDocs = PRESS_KIT_ASSETS.map((a) => {
    const iframeCode =
      a.embedType === "iframe"
        ? `\`\`\`html\n<iframe\n  src="${baseUrl}${a.path}"\n  width="${a.defaultWidth}"\n  height="${a.defaultHeight}"\n  frameborder="0"\n  allowfullscreen\n></iframe>\n\`\`\``
        : `Direct URL: \`${baseUrl}${a.path}\``;
    const hotlink = a.hotlinkAllowed
      ? "Hotlinking permitted."
      : "Hotlinking not permitted — use the iframe embed.";
    return `### ${a.title}\n\n${a.description}\n\n${hotlink}\n\n${iframeCode}`;
  }).join("\n\n---\n\n");

  return `# Aegis Lens — Press Embed Kit

${PRESS_KIT_NOTE_EN}

---

${assetDocs}

---

*For access credentials or custom integration requests, contact press@aegislens.uk.*
`;
}
