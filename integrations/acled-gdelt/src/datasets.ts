/**
 * Dataset catalog metadata — datasets page (cross-referenced). (TODO task 11)
 *
 * Single source of truth for the three academic datasets: provenance, coverage,
 * licence tier, update cadence and cross-references. Localized en/uk. The
 * datasets page and citation builder both read from this catalog.
 */

import type { DatasetId, L10nText, LicenseTier } from "./types";

export interface DatasetCatalogEntry {
  id: DatasetId;
  name: L10nText;
  publisher: L10nText;
  description: L10nText;
  /** Earliest year of usable coverage. */
  coverageSinceYear: number;
  /** Geographic scope. */
  scope: L10nText;
  /** How often the dataset updates. */
  updateCadence: L10nText;
  licenseTier: LicenseTier;
  /** Whether RAW rows may be republished publicly (vs derived-only). */
  rawRepublishable: boolean;
  /** Mandatory attribution string (English; uk via `attributionUk`). */
  attribution: string;
  attributionUk: string;
  homepageUrl: string;
  docsUrl: string;
  /** Other datasets this one is commonly cross-referenced with. */
  crossReference: DatasetId[];
}

export const DATASET_CATALOG: Record<DatasetId, DatasetCatalogEntry> = {
  acled: {
    id: "acled",
    name: {
      en: "ACLED — Armed Conflict Location & Event Data",
      uk: "ACLED — дані про місця та події збройних конфліктів",
    },
    publisher: {
      en: "ACLED (Armed Conflict Location & Event Data Project)",
      uk: "Проєкт ACLED (Armed Conflict Location & Event Data)",
    },
    description: {
      en: "Curated, geocoded records of political violence, demonstrations and strategic developments, hand-coded from media and reports.",
      uk: "Курований, геокодований реєстр політичного насильства, демонстрацій та стратегічних подій, закодований вручну з медіа та звітів.",
    },
    coverageSinceYear: 2018,
    scope: { en: "Global (rolling rollout; UA from 2018)", uk: "Глобально (поетапно; Україна з 2018 р.)" },
    updateCadence: { en: "Weekly", uk: "Щотижня" },
    licenseTier: "attribution",
    rawRepublishable: false,
    attribution: "Source: ACLED (acleddata.com). Used under ACLED's terms of use; raw events not redistributed.",
    attributionUk: "Джерело: ACLED (acleddata.com). Використано згідно з умовами ACLED; необроблені події не поширюються.",
    homepageUrl: "https://acleddata.com",
    docsUrl: "https://acleddata.com/resources/general-guides/",
    crossReference: ["ucdp", "gdelt"],
  },
  gdelt: {
    id: "gdelt",
    name: {
      en: "GDELT — Global Database of Events, Language, and Tone",
      uk: "GDELT — глобальна база подій, мови та тональності",
    },
    publisher: {
      en: "The GDELT Project",
      uk: "Проєкт GDELT",
    },
    description: {
      en: "Machine-coded global news events using CAMEO coding, updated every 15 minutes; queryable as a BigQuery public dataset.",
      uk: "Машинно-закодовані світові новинні події (кодування CAMEO), оновлення кожні 15 хвилин; доступні як публічний набір BigQuery.",
    },
    coverageSinceYear: 2015, // GDELT 2.0; v1 series extends to 1979
    scope: { en: "Global", uk: "Глобально" },
    updateCadence: { en: "Every 15 minutes", uk: "Кожні 15 хвилин" },
    licenseTier: "open",
    rawRepublishable: true,
    attribution: "Source: The GDELT Project (gdeltproject.org), CC-BY. Evidence links republished with attribution.",
    attributionUk: "Джерело: проєкт GDELT (gdeltproject.org), CC-BY. Посилання-докази опубліковано з атрибуцією.",
    homepageUrl: "https://www.gdeltproject.org",
    docsUrl: "https://www.gdeltproject.org/data.html#documentation",
    crossReference: ["acled", "ucdp"],
  },
  ucdp: {
    id: "ucdp",
    name: {
      en: "UCDP — Uppsala Conflict Data Program",
      uk: "UCDP — програма даних про конфлікти Уппсальського університету",
    },
    publisher: {
      en: "Uppsala Conflict Data Program, Uppsala University",
      uk: "Програма даних про конфлікти, Уппсальський університет",
    },
    description: {
      en: "Conservative, vetted academic record of organised violence with long annual time-series (GED back to 1989); the citation-grade historical baseline.",
      uk: "Консервативний, перевірений академічний реєстр організованого насильства з довгими річними рядами (GED з 1989 р.); еталонна історична база.",
    },
    coverageSinceYear: 1989,
    scope: { en: "Global", uk: "Глобально" },
    updateCadence: { en: "Annual (with monthly candidate releases)", uk: "Щорічно (з місячними попередніми випусками)" },
    licenseTier: "open",
    rawRepublishable: true,
    attribution: "Source: UCDP Georeferenced Event Dataset (ucdp.uu.se). Cite the UCDP GED dataset and codebook.",
    attributionUk: "Джерело: UCDP Georeferenced Event Dataset (ucdp.uu.se). Цитуйте набір UCDP GED та кодбук.",
    homepageUrl: "https://ucdp.uu.se",
    docsUrl: "https://ucdp.uu.se/apidocs/",
    crossReference: ["acled", "gdelt"],
  },
};

export function listDatasets(): DatasetCatalogEntry[] {
  return Object.values(DATASET_CATALOG);
}

export function getDataset(id: DatasetId): DatasetCatalogEntry {
  return DATASET_CATALOG[id];
}

/** Datasets whose RAW rows may be exposed publicly. */
export function publiclyRepublishableDatasets(): DatasetId[] {
  return listDatasets().filter((d) => d.rawRepublishable).map((d) => d.id);
}
