/**
 * STIX 2.1 object types, bundle builder, and event-to-indicator mapper.
 * Типи об'єктів STIX 2.1, побудова бандлів та маппінг подій на індикатори.
 */

import { randomUUID } from "crypto";

// ── Types ─────────────────────────────────────────────────────────────────────

export type StixObjectType =
  | "indicator"
  | "threat-actor"
  | "attack-pattern"
  | "location"
  | "report"
  | "relationship"
  | "bundle";

export interface StixObject {
  type: StixObjectType;
  /** STIX 2.1 identifier format: '<type>--<uuid>' */
  id: string;
  spec_version: "2.1";
  created: string;
  modified: string;
  name?: string;
  description?: string;
  labels?: string[];
  [key: string]: unknown;
}

export interface StixBundle {
  type: "bundle";
  id: string;
  objects: StixObject[];
}

// ── Notes ─────────────────────────────────────────────────────────────────────

/** TAXII 2.1 endpoint is planned — will expose collections per severity and region */
export const TAXII_NOTE_ENDPOINT_EN =
  "TAXII 2.1 endpoint planned — will expose collections per severity level and region; supports automated threat-intelligence sharing with SIEM/SOAR platforms.";
export const TAXII_NOTE_ENDPOINT_UK =
  "Ендпоінт TAXII 2.1 заплановано — надаватиме колекції за рівнем серйозності та регіоном; підтримує автоматизований обмін розвідданими з SIEM/SOAR-платформами.";

/** MISP-compatible — STIX 2.1 bundles can be imported directly into MISP instances */
export const TAXII_NOTE_MISP_EN =
  "MISP-compatible — STIX 2.1 bundles can be imported directly into MISP threat-intelligence platform instances via the standard MISP STIX import module.";
export const TAXII_NOTE_MISP_UK =
  "Сумісний з MISP — бандли STIX 2.1 можна безпосередньо імпортувати в екземпляри платформи аналізу загроз MISP через стандартний модуль імпорту STIX.";

/** STIX 2.1 only — legacy STIX 1.x / TAXII 1.x not supported */
export const TAXII_NOTE_VERSION_EN =
  "STIX 2.1 only — legacy STIX 1.x and TAXII 1.x formats are not supported; all bundles conform to the OASIS STIX 2.1 specification (CS02).";
export const TAXII_NOTE_VERSION_UK =
  "Тільки STIX 2.1 — застарілі формати STIX 1.x та TAXII 1.x не підтримуються; всі бандли відповідають специфікації OASIS STIX 2.1 (CS02).";

export const TAXII_NOTES_EN = [
  TAXII_NOTE_ENDPOINT_EN,
  TAXII_NOTE_MISP_EN,
  TAXII_NOTE_VERSION_EN,
];
export const TAXII_NOTES_UK = [
  TAXII_NOTE_ENDPOINT_UK,
  TAXII_NOTE_MISP_UK,
  TAXII_NOTE_VERSION_UK,
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function stixId(type: StixObjectType): string {
  return `${type}--${randomUUID()}`;
}

// ── Event → STIX indicator ────────────────────────────────────────────────────

/**
 * Map a raw Aegis Lens event to a STIX 2.1 indicator object.
 * Маппінг сирої події Aegis Lens на об'єкт-індикатор STIX 2.1.
 */
export function eventToStixIndicator(event: any): StixObject {
  const now = new Date().toISOString();
  const occurred = event.occurredAt ?? event.createdAt ?? now;
  const labels: string[] = [];

  if (event.class) labels.push(String(event.class).toLowerCase());
  if (event.severity) labels.push(`severity:${String(event.severity).toLowerCase()}`);
  if (event.country) labels.push(`country:${String(event.country).toUpperCase()}`);

  return {
    type: "indicator",
    id: stixId("indicator"),
    spec_version: "2.1",
    created: occurred,
    modified: now,
    name: event.title ?? event.name ?? event.eventId ?? "Aegis Lens Event",
    description: event.description ?? event.summary ?? undefined,
    labels: labels.length > 0 ? labels : ["osint"],
    pattern: `[location:lat = '${event.lat ?? 0}' AND location:lng = '${event.lng ?? 0}']`,
    pattern_type: "stix",
    valid_from: occurred,
    source_event_id: event.eventId ?? event.id ?? null,
  };
}

// ── Bundle builder ────────────────────────────────────────────────────────────

/**
 * Wrap STIX objects into a STIX 2.1 bundle.
 * Обгортання об'єктів STIX у бандл STIX 2.1.
 */
export function buildStixBundle(objects: StixObject[]): StixBundle {
  return {
    type: "bundle",
    id: stixId("bundle"),
    objects,
  };
}
