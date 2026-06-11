/**
 * @ua-map/isw — Institute for the Study of War (ISW) integration.
 *
 * Daily Russia Offensive Campaign Assessment (ROCA) ingest, control-of-terrain
 * map ingestion, heuristic entity extraction → KG enrichment, differential control
 * polygons, DeepStateMAP divergence cross-reference, and per-region product widgets.
 *
 * See COMPLIANCE.md for license / fair-use / attribution boundaries.
 */

export * from "./types";
export * from "./i18n";
export * from "./client";
export * from "./map-ingest";
export * from "./adapter";
export * from "./daily-ingest";
export * from "./entity-extraction";
export * from "./map-diff";
export * from "./divergence";
export * from "./mentions";
export * from "./widget";
export * from "./citations";
