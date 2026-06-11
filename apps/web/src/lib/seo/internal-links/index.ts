/**
 * Internal Linking Engine — barrel.
 *
 * Automated, smart internal linking at programmatic scale. Core model:
 * `link-graph`. Engine: embeddings + KG traversal + editorial overrides +
 * per-template rules + link budget + anchor variety + orphan detection.
 * Crawl-shape: hub-spoke + cluster audit. Monitoring: link counts, link
 * density, internal PageRank.
 *
 * All modules are locale-preserving (no cross-locale links) and pure
 * (no network/DB) — real metrics sources plug in by constructing the graph.
 */

export * from "./link-graph";
export * from "./related-embeddings";
export * from "./kg-traversal";
export * from "./overrides";
export * from "./link-rules";
export * from "./link-budget";
export * from "./anchor-variety";
export * from "./orphans";
export * from "./hub-spoke";
export * from "./cluster-audit";
export * from "./link-counts";
export * from "./link-density";
export * from "./internal-pagerank";
