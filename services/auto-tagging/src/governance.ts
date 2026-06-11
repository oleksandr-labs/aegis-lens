/**
 * Tag governance: rename, merge, deprecate, per-locale display names.
 */

import { TAXONOMY, TaxonomyNode, getNode } from "./taxonomy";

export interface TagRenameOp {
  type: "rename";
  fromId: string;
  toId: string;
  reason: string;
}

export interface TagMergeOp {
  type: "merge";
  sourceIds: string[];
  targetId: string;
  reason: string;
}

export interface TagDeprecateOp {
  type: "deprecate";
  tagId: string;
  reason: string;
  successor?: string;
}

export type TagGovernanceOp = TagRenameOp | TagMergeOp | TagDeprecateOp;

const _pendingOps: TagGovernanceOp[] = [];

export function proposeOp(op: TagGovernanceOp): void {
  // In production: write to a governance DB table for review
  _pendingOps.push(op);
}

export function pendingOps(): TagGovernanceOp[] {
  return [..._pendingOps];
}

/** Analytics: tag application frequency (stub — replace with DB query) */
export interface TagCoverageStats {
  tagId: string;
  applicationCount: number;
  lastAppliedAt?: string;
  coveragePct: number; // % of events in last 7d that have this tag
}

export function getTagCoverage(): TagCoverageStats[] {
  // Stub: return empty analytics — wire to Postgres in production
  return TAXONOMY.map((node) => ({
    tagId: node.id,
    applicationCount: 0,
    coveragePct: 0,
  }));
}

/** Validate that a tag ID exists and is not deprecated. */
export function validateTagId(id: string): { valid: boolean; reason?: string } {
  const node = getNode(id);
  if (!node) return { valid: false, reason: `Tag "${id}" does not exist in taxonomy` };
  if (node.deprecated) return { valid: false, reason: `Tag "${id}" is deprecated` };
  return { valid: true };
}

/** Get per-locale display name for a tag ID. */
export function getTagDisplayName(id: string, locale: "en" | "uk" = "en"): string {
  const node = getNode(id);
  if (!node) return id;
  return node.displayName[locale] ?? node.displayName.en ?? id;
}
