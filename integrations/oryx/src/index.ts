/**
 * @ua-map/oryx — Oryx visually-confirmed equipment-loss integration.
 *
 * Ingests the Oryx OSINT loss dataset, normalises it into the canonical
 * Aegis event/entity model, and provides product surfaces (equipment widget,
 * loss-trend charts, region × time aggregation for the equipment-loss layer).
 *
 * Oryx is volunteer-maintained; attribution.ts is the single source of truth
 * for crediting it everywhere derived. See COMPLIANCE.md for ToS/license terms.
 */

export * from "./types";
export * from "./i18n";
export * from "./parser";
export * from "./client";
export * from "./sync";
export * from "./kg-mapping";
export * from "./event-mapping";
export * from "./widget";
export * from "./trends";
export * from "./attribution";
