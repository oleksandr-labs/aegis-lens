/**
 * Open data registry — public datasets with SEO-optimised schema.org/Dataset JSON-LD.
 * Open datasets drive academic citations, dofollow backlinks, and LLMO presence.
 */

import { SITE } from "../site";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OpenDataset {
  id: string;
  title_en: string;
  title_uk: string;
  description_en: string;
  description_uk: string;
  license: string;
  format: "geojson" | "csv" | "json" | "parquet";
  updateFrequency: "realtime" | "daily" | "weekly" | "monthly";
  doiUrl?: string;
  downloadUrl?: string;
  keywordsForSeo: string[];
}

// ── Open Datasets ─────────────────────────────────────────────────────────────

export const OPEN_DATASETS: OpenDataset[] = [
  {
    id: "ukraine-event-locations",
    title_en: "Ukraine Conflict Event Locations (2022–present)",
    title_uk: "Геолокації подій конфлікту в Україні (2022 — сьогодні)",
    description_en:
      "Georeferenced verified conflict events in Ukraine from February 2022 to present. Each event includes location (lat/lon), event type, confidence score, source references, and timestamp.",
    description_uk:
      "Геопросторово прив'язані верифіковані конфліктні події в Україні з лютого 2022 року до сьогодні. Кожна подія включає координати, тип події, рівень довіри, посилання на джерела та часову мітку.",
    license: "CC BY 4.0",
    format: "geojson",
    updateFrequency: "daily",
    doiUrl: "https://doi.org/10.5281/aegislens.001",
    downloadUrl: "/data/ukraine-event-locations.geojson",
    keywordsForSeo: [
      "Ukraine conflict data",
      "war events geojson",
      "OSINT dataset",
      "Ukraine war map data",
      "open conflict data",
    ],
  },
  {
    id: "equipment-tracking",
    title_en: "Military Equipment Sightings and Losses Dataset",
    title_uk: "Датасет спостережень та втрат військової техніки",
    description_en:
      "Structured database of military equipment sightings, confirmed losses, and deployment patterns sourced from open imagery, social media, and satellite data. Covers major vehicle, artillery, and air-defence categories.",
    description_uk:
      "Структурована база даних спостережень і підтверджених втрат військової техніки. Джерела: відкриті знімки, соцмережі, супутникові дані.",
    license: "CC BY 4.0",
    format: "csv",
    updateFrequency: "daily",
    doiUrl: "https://doi.org/10.5281/aegislens.002",
    downloadUrl: "/data/equipment-tracking.csv",
    keywordsForSeo: [
      "military equipment losses",
      "tank losses Ukraine",
      "open source military data",
      "equipment sightings dataset",
    ],
  },
  {
    id: "ukraine-air-alerts",
    title_en: "Ukraine Air Alert Archive (2022–present)",
    title_uk: "Архів повітряних тривог в Україні (2022 — сьогодні)",
    description_en:
      "Complete timestamped archive of Ukrainian national air alert activations at the oblast level. Includes duration, activation/deactivation times, and cross-referenced incident events.",
    description_uk:
      "Повний архів оголошення повітряних тривог в Україні на рівні областей. Включає тривалість, час оголошення/відбою та перехресні посилання на інциденти.",
    license: "CC0 1.0 (Public Domain)",
    format: "json",
    updateFrequency: "realtime",
    doiUrl: "https://doi.org/10.5281/aegislens.003",
    downloadUrl: "/data/air-alerts.json",
    keywordsForSeo: [
      "Ukraine air alerts archive",
      "air raid siren data",
      "povitryanna tryvoga dataset",
      "Ukraine missile alert history",
    ],
  },
  {
    id: "frontline-aggregated",
    title_en: "Aggregated Frontline Position Data (Weekly Snapshots)",
    title_uk: "Агрегована позиція лінії фронту (щотижневі знімки)",
    description_en:
      "Weekly GeoJSON snapshots of estimated frontline positions aggregated from multiple OSINT sources. Methodology described at aegislens.com/methodology/frontline.",
    description_uk:
      "Щотижневі знімки GeoJSON із оціночними позиціями лінії фронту на основі кількох OSINT-джерел.",
    license: "CC BY-SA 4.0",
    format: "geojson",
    updateFrequency: "weekly",
    doiUrl: "https://doi.org/10.5281/aegislens.004",
    downloadUrl: "/data/frontline-snapshots.geojson",
    keywordsForSeo: [
      "Ukraine frontline data",
      "front line map GeoJSON",
      "war frontline shapefile",
      "Ukraine territory control data",
    ],
  },
  {
    id: "casualty-estimates",
    title_en: "Casualty Estimates Dataset (with Methodology Caveats)",
    title_uk: "Датасет оцінок втрат (з методологічними застереженнями)",
    description_en:
      "Aggregated lower-bound casualty estimates sourced from verified open reports. IMPORTANT: These are minimum confirmed figures only. True casualties are likely higher. Full methodology and uncertainty ranges included.",
    description_uk:
      "Агреговані мінімальні оцінки втрат з верифікованих відкритих джерел. ВАЖЛИВО: лише підтверджені мінімальні цифри. Реальні втрати можуть бути вищими. Повна методологія включена.",
    license: "CC BY 4.0",
    format: "csv",
    updateFrequency: "weekly",
    doiUrl: "https://doi.org/10.5281/aegislens.005",
    downloadUrl: "/data/casualty-estimates.csv",
    keywordsForSeo: [
      "Ukraine casualties data",
      "conflict casualty estimates",
      "war losses open data",
      "verified casualty dataset",
    ],
  },
  {
    id: "infrastructure-damage",
    title_en: "Civilian Infrastructure Damage Registry",
    title_uk: "Реєстр пошкоджень цивільної інфраструктури",
    description_en:
      "Georeferenced registry of documented civilian infrastructure damage: energy grid, hospitals, residential, transport, and cultural heritage sites. Source-cited with confidence scores.",
    description_uk:
      "Геопросторовий реєстр задокументованих пошкоджень цивільної інфраструктури: енергетика, лікарні, житло, транспорт, культурна спадщина.",
    license: "CC BY 4.0",
    format: "geojson",
    updateFrequency: "daily",
    doiUrl: "https://doi.org/10.5281/aegislens.006",
    downloadUrl: "/data/infrastructure-damage.geojson",
    keywordsForSeo: [
      "Ukraine infrastructure damage",
      "civilian damage map",
      "hospital attacks data",
      "energy grid damage Ukraine",
    ],
  },
  {
    id: "satellite-change-detection",
    title_en: "Satellite Change-Detection Areas of Interest (AOIs)",
    title_uk: "Зони інтересу для супутникового виявлення змін (AOI)",
    description_en:
      "Published areas of interest (bounding boxes) used by Aegis Lens for automated satellite change-detection monitoring. Enables independent verification of our change-detection events.",
    description_uk:
      "Зони інтересу (обмежувальні прямокутники), використовувані Aegis Lens для автоматичного супутникового моніторингу. Дозволяє незалежну верифікацію подій.",
    license: "CC0 1.0 (Public Domain)",
    format: "geojson",
    updateFrequency: "monthly",
    downloadUrl: "/data/satellite-aois.geojson",
    keywordsForSeo: [
      "satellite change detection Ukraine",
      "SAR imagery areas of interest",
      "Sentinel conflict monitoring",
      "open satellite monitoring zones",
    ],
  },
  {
    id: "osint-source-registry",
    title_en: "Open OSINT Source Registry — Verified Channels and Credibility Scores",
    title_uk: "Відкритий реєстр OSINT-джерел — верифіковані канали та рейтинги довіри",
    description_en:
      "Registry of Telegram channels, social media accounts, and RSS feeds monitored by Aegis Lens. Each entry includes credibility score (0–100), language, region focus, and verification notes.",
    description_uk:
      "Реєстр Telegram-каналів, акаунтів у соцмережах та RSS-стрічок, що моніторить Aegis Lens. Кожен запис включає рейтинг довіри (0–100), мову, регіон та нотатки верифікації.",
    license: "CC BY 4.0",
    format: "json",
    updateFrequency: "monthly",
    doiUrl: "https://doi.org/10.5281/aegislens.007",
    downloadUrl: "/data/source-registry.json",
    keywordsForSeo: [
      "OSINT source list",
      "Ukraine Telegram channels verified",
      "conflict news source registry",
      "open source intelligence channels",
    ],
  },
];

// ── JSON-LD Builder ───────────────────────────────────────────────────────────

/**
 * Builds a schema.org/Dataset JSON-LD object for SEO and structured data.
 * Compatible with Google Dataset Search.
 */
export function buildDatasetJsonLd(dataset: OpenDataset): object {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: dataset.title_en,
    alternateName: dataset.title_uk,
    description: dataset.description_en,
    license: `https://creativecommons.org/licenses/${dataset.license.toLowerCase().replace(/\s+/g, "-")}`,
    keywords: dataset.keywordsForSeo,
    creator: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    ...(dataset.doiUrl && {
      identifier: dataset.doiUrl,
      citation: dataset.doiUrl,
    }),
    ...(dataset.downloadUrl && {
      distribution: [
        {
          "@type": "DataDownload",
          encodingFormat: `application/${dataset.format}`,
          contentUrl: `${SITE.url}${dataset.downloadUrl}`,
        },
      ],
    }),
    temporalCoverage:
      dataset.updateFrequency === "realtime" ? "2022-02-24/.." : undefined,
    spatialCoverage:
      dataset.id.startsWith("ukraine") || dataset.id.includes("frontline")
        ? "Ukraine"
        : undefined,
    variableMeasured: dataset.id,
  };
}

// ── Citation Builders ─────────────────────────────────────────────────────────

/**
 * Builds a citation string for a dataset in APA, MLA, or Chicago style.
 */
export function buildCitationString(
  dataset: OpenDataset,
  style: "apa" | "mla" | "chicago",
): string {
  const year = new Date().getFullYear();
  const doi = dataset.doiUrl ? ` ${dataset.doiUrl}` : "";

  switch (style) {
    case "apa":
      return `Aegis Lens. (${year}). ${dataset.title_en} [Dataset].${doi}`;
    case "mla":
      return `Aegis Lens. "${dataset.title_en}." Dataset, ${year}.${doi}`;
    case "chicago":
      return `Aegis Lens. "${dataset.title_en}." Dataset. ${year}.${doi}`;
    default:
      return `Aegis Lens. ${dataset.title_en}. ${year}.${doi}`;
  }
}
