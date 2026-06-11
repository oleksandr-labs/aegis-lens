/**
 * Narrative cluster tracker.
 *
 * Groups events by embedding similarity — when the same talking point
 * propagates across many sources, it forms a cluster.
 *
 * Uses cosine similarity with a centroid update strategy (online k-means style).
 * Conservative threshold: cluster assignment requires similarity ≥ 0.85.
 */

import type { NarrativeCluster } from "./types";

const ASSIGNMENT_THRESHOLD = 0.85;
const MAX_CLUSTERS = 500;

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

function updateCentroid(centroid: number[], newVector: number[], count: number): number[] {
  return centroid.map((v, i) => (v * (count - 1) + newVector[i]) / count);
}

export class NarrativeClusterTracker {
  private clusters: NarrativeCluster[] = [];

  assign(eventId: string, embedding: number[], sourceId: string): NarrativeCluster | null {
    if (embedding.length === 0) return null;

    const now = new Date().toISOString();

    // Find closest cluster
    let bestCluster: NarrativeCluster | null = null;
    let bestScore = 0;

    for (const cluster of this.clusters) {
      const sim = cosine(embedding, cluster.centroid);
      if (sim > bestScore) {
        bestScore = sim;
        bestCluster = cluster;
      }
    }

    if (bestCluster && bestScore >= ASSIGNMENT_THRESHOLD) {
      // Add to existing cluster
      bestCluster.memberIds.push(eventId);
      bestCluster.centroid = updateCentroid(bestCluster.centroid, embedding, bestCluster.memberIds.length);
      bestCluster.lastActiveAt = now;
      bestCluster.sourceCounts[sourceId] = (bestCluster.sourceCounts[sourceId] ?? 0) + 1;
      this.updateVelocity(bestCluster);
      return bestCluster;
    }

    // Create new cluster (if under limit)
    if (this.clusters.length >= MAX_CLUSTERS) {
      // Evict oldest inactive cluster
      this.clusters.sort((a, b) => a.lastActiveAt.localeCompare(b.lastActiveAt));
      this.clusters.shift();
    }

    const newCluster: NarrativeCluster = {
      id: crypto.randomUUID(),
      label: `cluster:${eventId.slice(0, 8)}`,
      centroid: [...embedding],
      memberIds: [eventId],
      firstSeenAt: now,
      lastActiveAt: now,
      sourceCounts: { [sourceId]: 1 },
      velocity: 0,
    };

    this.clusters.push(newCluster);
    return null; // New cluster = not suspicious yet
  }

  private updateVelocity(cluster: NarrativeCluster): void {
    const ageHours = (Date.now() - new Date(cluster.firstSeenAt).getTime()) / 3_600_000;
    cluster.velocity = ageHours > 0 ? cluster.memberIds.length / ageHours : cluster.memberIds.length;
  }

  getHighVelocityClusters(minVelocity = 5): NarrativeCluster[] {
    return this.clusters.filter((c) => c.velocity >= minVelocity);
  }

  getCluster(id: string): NarrativeCluster | undefined {
    return this.clusters.find((c) => c.id === id);
  }

  all(): NarrativeCluster[] {
    return [...this.clusters];
  }
}
