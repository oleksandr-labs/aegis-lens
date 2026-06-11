/**
 * Provenance chain builder.
 *
 * Records the full attribution trail for an event:
 * original source → ingest → normalise → enrich → verify → publish.
 *
 * Used for STIX-style reporting, corrections, and audit transparency.
 */

export type ProvenanceStage =
  | "source_original"
  | "ingested"
  | "normalised"
  | "enriched_nlp"
  | "enriched_geo"
  | "corroborated"
  | "verified"
  | "published"
  | "retracted"
  | "corrected";

export interface ProvenanceNode {
  stage: ProvenanceStage;
  actor: string;
  timestamp: string;
  notes?: string;
  /** Hash of the artifact at this stage (content-addressable) */
  content_hash?: string;
  /** External reference (source URL, S3 key, etc.) */
  ref?: string;
}

export interface ProvenanceChain {
  event_id: string;
  nodes: ProvenanceNode[];
  /** ISO timestamp of most recent modification */
  updated_at: string;
}

/** Append a new stage to an existing chain (immutable — returns new chain) */
export function appendNode(
  chain: ProvenanceChain,
  node: ProvenanceNode,
): ProvenanceChain {
  return {
    ...chain,
    nodes: [...chain.nodes, node],
    updated_at: new Date().toISOString(),
  };
}

/** Build a fresh chain from the initial source reference */
export function initChain(
  event_id: string,
  sourceRef: {
    actor: string;
    url: string;
    fetchedAt: string;
    contentHash?: string;
  },
): ProvenanceChain {
  return {
    event_id,
    nodes: [
      {
        stage: "source_original",
        actor: sourceRef.actor,
        timestamp: sourceRef.fetchedAt,
        ref: sourceRef.url,
        content_hash: sourceRef.contentHash,
      },
    ],
    updated_at: sourceRef.fetchedAt,
  };
}

/** Format chain as human-readable summary for citations */
export function formatCitation(chain: ProvenanceChain): string {
  const src = chain.nodes.find((n) => n.stage === "source_original");
  const ver = chain.nodes.find(
    (n) => n.stage === "verified" || n.stage === "corroborated",
  );
  const pub = chain.nodes.find((n) => n.stage === "published");

  const parts: string[] = [`Event ${chain.event_id}`];
  if (src) parts.push(`Source: ${src.actor} (${src.ref ?? "unknown"})`);
  if (ver) parts.push(`Verified: ${ver.timestamp.slice(0, 10)}`);
  if (pub) parts.push(`Published: ${pub.timestamp.slice(0, 10)}`);

  return parts.join(" · ");
}

/** Check if a chain has been retracted or corrected */
export function isRetracted(chain: ProvenanceChain): boolean {
  return chain.nodes.some((n) => n.stage === "retracted");
}

export function isCorrected(chain: ProvenanceChain): boolean {
  return chain.nodes.some((n) => n.stage === "corrected");
}

// ── In-memory store (replace with DB-backed store in production) ──────────────

export class InMemoryProvenanceStore {
  private readonly chains = new Map<string, ProvenanceChain>();

  set(chain: ProvenanceChain): void {
    this.chains.set(chain.event_id, chain);
  }

  get(event_id: string): ProvenanceChain | null {
    return this.chains.get(event_id) ?? null;
  }

  append(event_id: string, node: ProvenanceNode): ProvenanceChain | null {
    const chain = this.chains.get(event_id);
    if (!chain) return null;
    const updated = appendNode(chain, node);
    this.chains.set(event_id, updated);
    return updated;
  }

  all(): ProvenanceChain[] {
    return [...this.chains.values()];
  }
}
