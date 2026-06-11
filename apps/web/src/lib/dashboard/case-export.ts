'use server';
/**
 * Case export utilities: serialize a case file as JSON, STIX 2.1, or PDF manifest.
 * PDF rendering is deferred to a headless renderer (Puppeteer / Playwright);
 * this module provides the data model and STIX bundle builder.
 *
 * Утиліти експорту кейсів: JSON, STIX 2.1, PDF-маніфест.
 * PDF-рендеринг делегується headless-рендереру (Puppeteer / Playwright);
 * цей модуль надає модель даних та конструктор STIX-bundle.
 */

import type { Case, CaseNote } from "@/lib/cases-store";

// ── Export format types ───────────────────────────────────────────────────────

export type CaseExportFormat = "json" | "stix2.1" | "pdf";

// ── Flat JSON export ──────────────────────────────────────────────────────────

export interface CaseExportJson {
  exportFormat: "json";
  exportedAt: string;
  schemaVersion: "1.0";
  case: Case;
  notes: CaseNote[];
  /** Resolved event summaries (populated by caller from event store) */
  events: Array<{
    eventId: string;
    class: string;
    occurred_at: string;
    danger_score: number;
    summary_en: string;
  }>;
}

export function buildJsonExport(
  caseData: Case,
  notes: CaseNote[],
  events: CaseExportJson["events"],
): CaseExportJson {
  return {
    exportFormat: "json",
    exportedAt: new Date().toISOString(),
    schemaVersion: "1.0",
    case: caseData,
    notes,
    events,
  };
}

// ── STIX 2.1 bundle export ────────────────────────────────────────────────────

/**
 * Build a minimal STIX 2.1 bundle representing a case as a Report object
 * with linked Indicator and Sighting objects.
 * Spec: https://docs.oasis-open.org/cti/stix/v2.1/stix-v2.1.html
 *
 * Будує мінімальний STIX 2.1 bundle для кейсу як об'єкт Report.
 */
export interface StixBundle {
  type: "bundle";
  id: string;
  spec_version: "2.1";
  objects: StixObject[];
}

export interface StixObject {
  type: string;
  spec_version: "2.1";
  id: string;
  created: string;
  modified: string;
  [key: string]: unknown;
}

export function buildStixBundle(
  caseData: Case,
  events: CaseExportJson["events"],
): StixBundle {
  const now = new Date().toISOString();
  const bundleId = `bundle--${caseData.caseId}`;

  // Report object (the case itself)
  const reportObj: StixObject = {
    type: "report",
    spec_version: "2.1",
    id: `report--${caseData.caseId}`,
    created: caseData.createdAt,
    modified: caseData.updatedAt,
    name: caseData.title,
    description: caseData.description ?? "",
    published: caseData.createdAt,
    report_types: ["threat-report"],
    object_refs: events.map((e) => `observed-data--${e.eventId}`),
    labels: ["aegis-lens-case-export"],
  };

  // Observed-data objects (one per event)
  const observedDataObjects: StixObject[] = events.map((e) => ({
    type: "observed-data",
    spec_version: "2.1",
    id: `observed-data--${e.eventId}`,
    created: e.occurred_at,
    modified: e.occurred_at,
    first_observed: e.occurred_at,
    last_observed: e.occurred_at,
    number_observed: 1,
    event_class: e.class,
    danger_score: e.danger_score,
    description: e.summary_en,
    object_refs: [],
  }));

  // Identity object for Aegis Lens as the source
  const identityObj: StixObject = {
    type: "identity",
    spec_version: "2.1",
    id: "identity--aegis-lens",
    created: now,
    modified: now,
    name: "Aegis Lens",
    identity_class: "system",
    description: "Ukrainian MAP / Aegis Lens OSINT platform",
  };

  return {
    type: "bundle",
    id: bundleId,
    spec_version: "2.1",
    objects: [identityObj, reportObj, ...observedDataObjects],
  };
}

// ── PDF manifest (metadata for renderer) ─────────────────────────────────────

/**
 * Metadata passed to the headless PDF renderer.
 * The renderer consumes this to generate the cover page, table of contents,
 * and event detail sections.
 *
 * Метадані для headless PDF-рендерера.
 */
export interface CasePdfManifest {
  exportFormat: "pdf";
  title: string;
  caseId: string;
  orgId: string;
  exportedAt: string;
  /** URL path of the case dashboard page to screenshot as cover */
  dashboardUrl: string;
  sections: Array<{
    heading: string;
    content: string;
  }>;
  eventCount: number;
  noteCount: number;
}

export function buildPdfManifest(
  caseData: Case,
  notes: CaseNote[],
  events: CaseExportJson["events"],
  baseUrl: string,
): CasePdfManifest {
  return {
    exportFormat: "pdf",
    title: caseData.title,
    caseId: caseData.caseId,
    orgId: caseData.orgId,
    exportedAt: new Date().toISOString(),
    dashboardUrl: `${baseUrl}/cases/${caseData.caseId}`,
    sections: [
      {
        heading: "Case Summary",
        content: caseData.description ?? "No description provided.",
      },
      {
        heading: "Events",
        content: events
          .map(
            (e) =>
              `[${e.occurred_at.slice(0, 10)}] ${e.class} — Danger ${e.danger_score}/100: ${e.summary_en}`,
          )
          .join("\n"),
      },
      {
        heading: "Analyst Notes",
        content: notes.map((n) => `${n.createdAt.slice(0, 10)}: ${n.content}`).join("\n"),
      },
    ],
    eventCount: events.length,
    noteCount: notes.length,
  };
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const CASE_EXPORT_NOTES_EN = [
  "JSON export: full case data including events and notes; suitable for programmatic consumption and archival.",
  "STIX 2.1 export: produces a valid Bundle with Report + Observed-Data objects; import directly into OpenCTI, MISP, or any STIX-aware platform.",
  "PDF export: passes a manifest to the headless renderer; the PDF includes a cover screenshot, event timeline, and analyst notes.",
  "All exports embed an Aegis Lens identity object and exportedAt timestamp for provenance tracking.",
];

export const CASE_EXPORT_NOTES_UK = [
  "JSON-експорт: повні дані кейсу, включаючи події та нотатки; підходить для програмного використання та архівування.",
  "STIX 2.1 експорт: формує валідний Bundle з об'єктами Report + Observed-Data; імпортуйте безпосередньо в OpenCTI, MISP або будь-яку STIX-сумісну платформу.",
  "PDF-експорт: передає маніфест headless-рендереру; PDF містить обкладинку-скріншот, часову шкалу подій та нотатки аналітика.",
  "Всі експорти містять об'єкт ідентичності Aegis Lens та часову мітку exportedAt для відстеження походження.",
];
