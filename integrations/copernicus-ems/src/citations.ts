/**
 * Task 9 — Citation in reports + investigations.
 *
 * Copernicus EMS products are PUBLIC-DOMAIN (free, full & open Copernicus data)
 * and highly authoritative — exactly the kind of source that belongs in
 * investigation evidence bases and exported reports. This module builds the
 * mandatory Copernicus attribution + a structured, exportable citation record
 * for an activation or a specific product.
 *
 * The attribution wording follows the official Copernicus / EMS credit line.
 */

import type { EmsActivation, EmsPortfolioProduct, I18nText } from "./types";

/** Mandatory Copernicus attribution (en/uk). */
export const COPERNICUS_ATTRIBUTION: I18nText = {
  en: "Contains modified Copernicus Emergency Management Service information [2026]",
  uk: "Містить оброблену інформацію Служби управління надзвичайними ситуаціями Copernicus [2026]",
};

/** A structured citation suitable for evidence bases + report footnotes. */
export interface EmsCitation {
  /** e.g. "Copernicus EMS — EMSR700". */
  sourceId: string;
  publisher: "Copernicus Emergency Management Service";
  /** Public-domain Copernicus open data. */
  license: "copernicus-open" | "public-domain";
  url: string;
  /** Mandatory credit line (en/uk). */
  attribution: I18nText;
  /** When this citation snapshot was captured. */
  capturedAt: string;
  /** Activation code. */
  activationCode: string;
  /** Specific product, when citing one. */
  productId?: string;
  /** Human-readable reference string (en/uk) for footnotes. */
  reference: I18nText;
}

function captured(): string {
  return new Date().toISOString();
}

/** Build a citation for a whole activation. */
export function citeActivation(a: EmsActivation, capturedAt = captured()): EmsCitation {
  return {
    sourceId: `Copernicus EMS — ${a.code}`,
    publisher: "Copernicus Emergency Management Service",
    license: "public-domain",
    url: a.url,
    attribution: COPERNICUS_ATTRIBUTION,
    capturedAt,
    activationCode: a.code,
    reference: {
      en: `Copernicus Emergency Management Service (© ${new Date(a.activatedAt).getUTCFullYear()} European Union), [${a.code}] ${a.title}. ${a.url} (accessed ${capturedAt.slice(0, 10)}).`,
      uk: `Служба управління надзвичайними ситуаціями Copernicus (© ${new Date(a.activatedAt).getUTCFullYear()} Європейський Союз), [${a.code}] ${a.title}. ${a.url} (доступ ${capturedAt.slice(0, 10)}).`,
    },
  };
}

/** Build a citation for a specific product within an activation. */
export function citeProduct(p: EmsPortfolioProduct, capturedAt = captured()): EmsCitation {
  return {
    sourceId: `Copernicus EMS — ${p.productId}`,
    publisher: "Copernicus Emergency Management Service",
    license: "public-domain",
    url: p.url,
    attribution: COPERNICUS_ATTRIBUTION,
    capturedAt,
    activationCode: p.activationCode,
    productId: p.productId,
    reference: {
      en: `Copernicus Emergency Management Service (© ${new Date(p.releasedAt).getUTCFullYear()} European Union), [${p.activationCode}] ${p.title} (${p.productId}). ${p.url} (accessed ${capturedAt.slice(0, 10)}).`,
      uk: `Служба управління надзвичайними ситуаціями Copernicus (© ${new Date(p.releasedAt).getUTCFullYear()} Європейський Союз), [${p.activationCode}] ${p.title} (${p.productId}). ${p.url} (доступ ${capturedAt.slice(0, 10)}).`,
    },
  };
}

/** Render a citation as a one-line footnote string (en/uk). */
export function renderCitation(c: EmsCitation, lang: "en" | "uk" = "en"): string {
  return c.reference[lang];
}

/**
 * Build the evidence-base entry the investigation module expects (mirrors the
 * shape used by other integrations' evidence builders: claim + citation +
 * content hash).
 */
export interface EvidenceEntry {
  kind: "crisis_mapping";
  country: string;
  claimEn: string;
  claimUk: string;
  contentHash: string;
  citation: EmsCitation;
}

function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function toEvidenceEntry(a: EmsActivation): EvidenceEntry {
  const citation = citeActivation(a);
  return {
    kind: "crisis_mapping",
    country: a.countries[0] ?? "UA",
    claimEn: `Copernicus EMS activation ${a.code} mapped ${a.hazard} impact (${a.title}).`,
    claimUk: `Активація Copernicus EMS ${a.code} картографувала наслідки (${a.hazard}): ${a.title}.`,
    contentHash: fnv1a(JSON.stringify({ code: a.code, title: a.title, url: a.url })),
    citation,
  };
}
