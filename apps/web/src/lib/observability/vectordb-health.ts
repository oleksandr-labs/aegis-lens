import "server-only";

// ---------------------------------------------------------------------------
// Qdrant Vector DB Health Metrics
// Calls /health and /cluster/status on the configured Qdrant instance.
// ---------------------------------------------------------------------------

export interface QdrantHealthStatus {
  status: "ok" | "degraded" | "error";
  collectionsCount: number;
  totalVectors: number;
  diskUsageMb: number;
  ramUsageMb: number;
  latencyP95Ms: number;
  lastCheckedAt: string;
}

interface QdrantHealthResponse {
  title?: string;
  version?: string;
  commit?: string;
}

interface QdrantCollectionsResponse {
  result?: {
    collections?: Array<{ name: string }>;
  };
}

interface QdrantCollectionInfo {
  result?: {
    vectors_count?: number;
    disk_data_size?: number;
    ram_data_size?: number;
    optimizer_status?: { ok?: boolean; error?: string };
  };
}

const DEFAULT_QDRANT_URL = "http://qdrant:6333";

/**
 * Probe Qdrant and return a structured health status.
 * Never throws — returns `{ status: 'error', ... }` on network / parse failure.
 */
export async function checkQdrantHealth(
  endpoint: string = process.env.QDRANT_URL ?? DEFAULT_QDRANT_URL,
): Promise<QdrantHealthStatus> {
  const lastCheckedAt = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);

    let healthOk = false;
    let collectionsCount = 0;
    let totalVectors = 0;
    let diskUsageMb = 0;
    let ramUsageMb = 0;
    const latencySamples: number[] = [];

    try {
      // 1. Basic health ping
      const t0 = Date.now();
      const healthRes = await fetch(`${endpoint}/health`, {
        signal: controller.signal,
      });
      latencySamples.push(Date.now() - t0);

      if (healthRes.ok) {
        const body = (await healthRes.json()) as QdrantHealthResponse;
        healthOk = !!body.title || !!body.version;
      }

      // 2. List collections
      const t1 = Date.now();
      const colRes = await fetch(`${endpoint}/collections`, {
        signal: controller.signal,
      });
      latencySamples.push(Date.now() - t1);

      if (colRes.ok) {
        const colBody = (await colRes.json()) as QdrantCollectionsResponse;
        const collections = colBody.result?.collections ?? [];
        collectionsCount = collections.length;

        // 3. Aggregate vectors + disk/RAM per collection (parallel)
        const infoResults = await Promise.allSettled(
          collections.map(async ({ name }) => {
            const t2 = Date.now();
            const r = await fetch(`${endpoint}/collections/${encodeURIComponent(name)}`, {
              signal: controller.signal,
            });
            latencySamples.push(Date.now() - t2);
            return r.ok ? ((await r.json()) as QdrantCollectionInfo) : null;
          }),
        );

        for (const r of infoResults) {
          if (r.status === "fulfilled" && r.value?.result) {
            totalVectors += r.value.result.vectors_count ?? 0;
            diskUsageMb += (r.value.result.disk_data_size ?? 0) / (1024 * 1024);
            ramUsageMb += (r.value.result.ram_data_size ?? 0) / (1024 * 1024);
          }
        }
      }
    } finally {
      clearTimeout(timer);
    }

    // p95 latency from samples
    const sorted = [...latencySamples].sort((a, b) => a - b);
    const p95Index = Math.ceil(sorted.length * 0.95) - 1;
    const latencyP95Ms = sorted[Math.max(0, p95Index)] ?? 0;

    const status: QdrantHealthStatus["status"] = !healthOk
      ? "error"
      : collectionsCount === 0
        ? "degraded"
        : "ok";

    return {
      status,
      collectionsCount,
      totalVectors,
      diskUsageMb: Math.round(diskUsageMb * 100) / 100,
      ramUsageMb: Math.round(ramUsageMb * 100) / 100,
      latencyP95Ms,
      lastCheckedAt,
    };
  } catch (err: unknown) {
    return {
      status: "error",
      collectionsCount: 0,
      totalVectors: 0,
      diskUsageMb: 0,
      ramUsageMb: 0,
      latencyP95Ms: 0,
      lastCheckedAt,
    };
  }
}

export type { QdrantHealthStatus as QdrantHealthStatusType };
