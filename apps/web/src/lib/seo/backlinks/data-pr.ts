/**
 * Data PR pipeline — planned original-data assets for earned media.
 * Model: Bellingcat (open methodology + datasets + embargoed releases → press coverage).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DataPrAsset {
  id: string;
  title_en: string;
  title_uk: string;
  type: "quarterly-report" | "public-dataset" | "data-story" | "methodology";
  /** DataCite DOI, reserved before publication */
  doiReserved?: string;
  /** ISO 8601 datetime — press embargo until this date */
  embargoUntil?: string;
  /** Names/IDs of target press outlets from PRESS_RELATIONSHIPS */
  targetOutlets: string[];
  status: "planned" | "in-progress" | "published";
}

export interface PressEmbargoPack {
  subject: string;
  pitchText_en: string;
  dataPreview: string;
}

// ── Data PR Pipeline ──────────────────────────────────────────────────────────

export const DATA_PR_PIPELINE: DataPrAsset[] = [
  {
    id: "q1-conflict-report-2026",
    title_en: "State of the Conflict: Q1 2026 — Ukraine Frontline Analysis",
    title_uk: "Стан конфлікту: Q1 2026 — Аналіз лінії фронту в Україні",
    type: "quarterly-report",
    embargoUntil: "2026-04-15T10:00:00Z",
    targetOutlets: ["Financial Times", "Reuters", "Kyiv Independent", "Deutsche Welle", "BBC News"],
    status: "published",
  },
  {
    id: "q2-conflict-report-2026",
    title_en: "State of the Conflict: Q2 2026 — Black Sea and Air Campaign Trends",
    title_uk: "Стан конфлікту: Q2 2026 — Чорне море та тенденції повітряних кампаній",
    type: "quarterly-report",
    embargoUntil: "2026-07-15T10:00:00Z",
    targetOutlets: ["Financial Times", "Reuters", "Bloomberg", "Kyiv Independent", "Politico EU"],
    status: "in-progress",
  },
  {
    id: "q3-conflict-report-2026",
    title_en: "State of the Conflict: Q3 2026 — Equipment Losses and Satellite Evidence",
    title_uk: "Стан конфлікту: Q3 2026 — Втрати техніки та супутникові докази",
    type: "quarterly-report",
    targetOutlets: ["Reuters", "AP", "The Guardian", "Der Spiegel", "Bellingcat"],
    status: "planned",
  },
  {
    id: "q4-conflict-report-2026",
    title_en: "State of the Conflict: Q4 2026 — Year in Review",
    title_uk: "Стан конфлікту: Q4 2026 — Підсумки року",
    type: "quarterly-report",
    targetOutlets: ["FT", "NYT", "BBC News", "Reuters", "Economist", "Bloomberg"],
    status: "planned",
  },
  {
    id: "dataset-ukraine-air-alerts-2024-2026",
    title_en: "Ukraine Air Alert History: 2024–2026 (Open Dataset)",
    title_uk: "Архів повітряних тривог в Україні: 2024–2026 (відкритий датасет)",
    type: "public-dataset",
    doiReserved: "10.5281/aegislens.001",
    targetOutlets: ["Bellingcat", "ACLED (blog)", "ISW", "academic-general"],
    status: "planned",
  },
  {
    id: "dataset-osint-source-registry",
    title_en: "Open OSINT Source Registry: Verified Telegram + Social Channels (v1)",
    title_uk: "Відкритий реєстр OSINT-джерел: верифіковані Telegram та соцмережі (v1)",
    type: "public-dataset",
    doiReserved: "10.5281/aegislens.002",
    targetOutlets: ["Bellingcat", "ISW", "War on the Rocks", "OCHA ReliefWeb"],
    status: "planned",
  },
  {
    id: "data-story-winter-offensive-patterns",
    title_en: "Winter Offensive Patterns: 10 Years of Cold-Weather Escalations in Eastern Europe",
    title_uk: "Зимові наступальні патерни: 10 років зимових ескалацій у Східній Європі",
    type: "data-story",
    embargoUntil: "2026-11-01T10:00:00Z",
    targetOutlets: ["Financial Times", "The Economist", "Foreign Policy", "Bloomberg"],
    status: "planned",
  },
  {
    id: "data-story-drone-density-maps",
    title_en: "Drone Density Maps: How UAV Usage Transformed Conflict Geometry (2022–2026)",
    title_uk: "Карти щільності дронів: як БПЛА трансформували геометрію конфлікту (2022–2026)",
    type: "data-story",
    embargoUntil: "2026-09-01T10:00:00Z",
    targetOutlets: ["Wired", "MIT Technology Review", "Bellingcat", "Reuters", "BBC News"],
    status: "planned",
  },
];

// ── Functions ─────────────────────────────────────────────────────────────────

/**
 * Builds a press embargo pack for pitching to journalists.
 * Generates subject line, pitch text, and data preview teaser.
 */
export function buildPressEmbargoPack(asset: DataPrAsset): PressEmbargoPack {
  const typeLabel: Record<DataPrAsset["type"], string> = {
    "quarterly-report": "Exclusive Data Report",
    "public-dataset": "Open Dataset Release",
    "data-story": "Data Investigation",
    methodology: "Methodology Publication",
  };

  const embargo = asset.embargoUntil
    ? `EMBARGO: ${new Date(asset.embargoUntil).toUTCString()}`
    : "No embargo — cleared for immediate use";

  const subject = `[${typeLabel[asset.type]}] ${asset.title_en}`;

  const pitchText_en = `
We would like to offer you advance access to our upcoming ${typeLabel[asset.type].toLowerCase()}:

"${asset.title_en}"

${embargo}

Aegis Lens tracks conflict events in real-time using verified open sources including satellite imagery, social media, wire services, ADS-B, and AIS data. This ${asset.type.replace("-", " ")} is based on our primary dataset and is available exclusively to selected press partners before public release.

We can provide:
- Full dataset / report access under embargo
- Custom analysis for your region or angle
- On-record quotes from our analyst team
- Embeddable interactive map widget

To request access or discuss a collaboration, reply to this email or contact press@aegislens.com.
  `.trim();

  const dataPreview = asset.doiReserved
    ? `Dataset DOI (reserved): ${asset.doiReserved} — will resolve on publication.`
    : `Full methodology available at aegislens.com/methodology. Data preview available on request under NDA.`;

  return { subject, pitchText_en, dataPreview };
}

/**
 * Returns only planned/in-progress assets (not yet published).
 */
export function getPendingAssets(): DataPrAsset[] {
  return DATA_PR_PIPELINE.filter((a) => a.status !== "published");
}

/**
 * Returns assets targeting a specific outlet name.
 */
export function getAssetsForOutlet(outletName: string): DataPrAsset[] {
  return DATA_PR_PIPELINE.filter((a) => a.targetOutlets.includes(outletName));
}
