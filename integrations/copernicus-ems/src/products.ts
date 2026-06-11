/**
 * Task 2 — Risk & Recovery mapping product portfolio.
 *
 * The Risk & Recovery Mapping line (EMSN…) is portfolio-oriented: a single
 * activation yields a curated SET of analytical products (reference, exposure,
 * delineation, grading, recovery monitoring) rather than a single fast crisis
 * map. This module models that portfolio, lets you filter it, and exposes the
 * UA-relevant subset for the watcher / layer builders.
 *
 * Demo-backed and dependency-free: a `EmsClient.getPortfolio()` would, against
 * the live service, parse each activation's component list — here we promote a
 * representative public-domain fixture so the contract is usable offline.
 */

import type {
  EmsPortfolioProduct,
  EmsProductType,
  EmsHazardType,
  EmsService,
  I18nText,
} from "./types";

/** Recovery-phase grouping used to organise a portfolio for display. */
export type PortfolioPhase = "pre_event" | "impact" | "recovery";

export const PORTFOLIO_PHASE_LABELS: Record<PortfolioPhase, I18nText> = {
  pre_event: { en: "Pre-event reference & risk", uk: "Довідка та ризики (до події)" },
  impact: { en: "Impact & damage", uk: "Вплив та руйнування" },
  recovery: { en: "Recovery monitoring", uk: "Моніторинг відновлення" },
};

/** Which recovery phase a product type belongs to. */
export function phaseOf(type: EmsProductType): PortfolioPhase {
  switch (type) {
    case "reference":
      return "pre_event";
    case "first_estimate":
    case "delineation":
    case "grading":
      return "impact";
    case "monitoring":
      return "recovery";
  }
}

/** A grouped, display-ready portfolio for one activation. */
export interface ActivationPortfolio {
  activationCode: string;
  service: EmsService;
  hazard: EmsHazardType;
  groups: Array<{
    phase: PortfolioPhase;
    label: I18nText;
    products: EmsPortfolioProduct[];
  }>;
  totalProducts: number;
}

/**
 * Group a flat list of portfolio products by recovery phase, in a stable
 * pre-event → impact → recovery order.
 */
export function buildPortfolio(
  activationCode: string,
  products: EmsPortfolioProduct[],
): ActivationPortfolio | null {
  const mine = products.filter((p) => p.activationCode === activationCode);
  if (!mine.length) return null;

  const order: PortfolioPhase[] = ["pre_event", "impact", "recovery"];
  const groups = order
    .map((phase) => ({
      phase,
      label: PORTFOLIO_PHASE_LABELS[phase],
      products: mine
        .filter((p) => phaseOf(p.type) === phase)
        .sort((a, b) => Date.parse(a.releasedAt) - Date.parse(b.releasedAt)),
    }))
    .filter((g) => g.products.length > 0);

  return {
    activationCode,
    service: mine[0].service,
    hazard: mine[0].hazard,
    groups,
    totalProducts: mine.length,
  };
}

/** Filter the portfolio fixture (e.g. UA-relevant impact products only). */
export function filterProducts(
  products: EmsPortfolioProduct[],
  opts: { types?: EmsProductType[]; hazards?: EmsHazardType[]; service?: EmsService } = {},
): EmsPortfolioProduct[] {
  return products.filter((p) => {
    if (opts.types?.length && !opts.types.includes(p.type)) return false;
    if (opts.hazards?.length && !opts.hazards.includes(p.hazard)) return false;
    if (opts.service && p.service !== opts.service) return false;
    return true;
  });
}

// ── Demo portfolio fixture (public-domain Copernicus EMS — illustrative) ─────────

export const DEMO_PORTFOLIO: EmsPortfolioProduct[] = [
  // EMSR700 — conflict damage assessment (Rapid Mapping, multiple AOIs).
  {
    activationCode: "EMSR700",
    service: "rapid_mapping",
    productId: "EMSR700_AOI01_REFERENCE_v1",
    type: "reference",
    title: "Reference map — urban area before assessment",
    aoi: "AOI01",
    hazard: "conflict",
    releasedAt: "2026-05-28T12:00:00Z",
    url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR700/ALL/EMSR700_AOI01_REFERENCE",
  },
  {
    activationCode: "EMSR700",
    service: "rapid_mapping",
    productId: "EMSR700_AOI01_GRADING_v1",
    type: "grading",
    title: "Damage grading — destroyed / damaged buildings",
    aoi: "AOI01",
    hazard: "conflict",
    releasedAt: "2026-05-29T09:00:00Z",
    url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR700/ALL/EMSR700_AOI01_GRADING",
  },
  // EMSR698 — flood delineation.
  {
    activationCode: "EMSR698",
    service: "rapid_mapping",
    productId: "EMSR698_AOI01_DELINEATION_v1",
    type: "delineation",
    title: "Flood delineation — observed water extent",
    aoi: "AOI01",
    hazard: "flood",
    releasedAt: "2026-05-20T18:00:00Z",
    url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR698/ALL/EMSR698_AOI01_DELINEATION",
  },
  {
    activationCode: "EMSR698",
    service: "rapid_mapping",
    productId: "EMSR698_AOI01_MONITORING_v2",
    type: "monitoring",
    title: "Flood monitoring — extent change",
    aoi: "AOI01",
    hazard: "flood",
    releasedAt: "2026-05-23T18:00:00Z",
    url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSR698/ALL/EMSR698_AOI01_MONITORING",
  },
  // EMSN-line Risk & Recovery example (post-event recovery analysis).
  {
    activationCode: "EMSN200",
    service: "risk_recovery",
    productId: "EMSN200_AOI01_REFERENCE_v1",
    type: "reference",
    title: "Exposure & reference — recovery planning baseline",
    aoi: "AOI01",
    hazard: "conflict",
    releasedAt: "2026-04-10T10:00:00Z",
    url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSN200/ALL/EMSN200_AOI01_REFERENCE",
  },
  {
    activationCode: "EMSN200",
    service: "risk_recovery",
    productId: "EMSN200_AOI01_GRADING_v1",
    type: "grading",
    title: "Recovery damage grading — building-level assessment",
    aoi: "AOI01",
    hazard: "conflict",
    releasedAt: "2026-04-18T10:00:00Z",
    url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSN200/ALL/EMSN200_AOI01_GRADING",
  },
  {
    activationCode: "EMSN200",
    service: "risk_recovery",
    productId: "EMSN200_AOI01_MONITORING_v1",
    type: "monitoring",
    title: "Recovery monitoring — reconstruction progress",
    aoi: "AOI01",
    hazard: "conflict",
    releasedAt: "2026-05-30T10:00:00Z",
    url: "https://emergency.copernicus.eu/mapping/list-of-components/EMSN200/ALL/EMSN200_AOI01_MONITORING",
  },
];
