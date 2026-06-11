import { TileKey, TileRecord, TileStatus, CacheTag } from "./types";
import { tileCdnPath, tileToQuadkey } from "./tile-math";

function keyToString(key: TileKey): string {
  const { layerId, timeBucket, orgId, coord } = key;
  return `${layerId}|${timeBucket}|${orgId ?? "_pub"}|${coord.z}/${coord.x}/${coord.y}`;
}

/** In-memory tile cache — replace with Redis + S3 in production. */
class TileCache {
  private store = new Map<string, TileRecord>();

  get(key: TileKey): TileRecord | undefined {
    const rec = this.store.get(keyToString(key));
    if (!rec) return undefined;
    if (rec.expiresAt && new Date(rec.expiresAt) < new Date()) {
      this.store.set(keyToString(key), { ...rec, status: "stale" });
      return { ...rec, status: "stale" };
    }
    return rec;
  }

  set(record: TileRecord): void {
    this.store.set(keyToString(record.key), record);
  }

  markStatus(key: TileKey, status: TileStatus, error?: string): void {
    const existing = this.store.get(keyToString(key));
    this.store.set(keyToString(key), {
      key,
      status,
      format: existing?.format ?? "mvt",
      error,
      generatedAt: existing?.generatedAt,
      expiresAt: existing?.expiresAt,
      cdnUrl: existing?.cdnUrl,
      sizeBytes: existing?.sizeBytes,
    });
  }

  /** Invalidate all tiles matching the cache tag. */
  invalidate(tag: CacheTag): number {
    let count = 0;
    for (const [k, rec] of this.store) {
      if (
        rec.key.layerId === tag.layerId &&
        rec.key.timeBucket === tag.timeBucket &&
        (tag.orgId === undefined || rec.key.orgId === tag.orgId)
      ) {
        this.store.set(k, { ...rec, status: "stale" });
        count++;
      }
    }
    return count;
  }

  /** Return stats: total, ready, stale, pending, error counts. */
  stats(layerId?: string): { total: number; ready: number; stale: number; pending: number; error: number } {
    let total = 0, ready = 0, stale = 0, pending = 0, error = 0;
    for (const rec of this.store.values()) {
      if (layerId && rec.key.layerId !== layerId) continue;
      total++;
      switch (rec.status) {
        case "ready": ready++; break;
        case "stale": stale++; break;
        case "pending": case "generating": pending++; break;
        case "error": error++; break;
      }
    }
    return { total, ready, stale, pending, error };
  }

  /** Generate a signed CDN URL (HMAC stub — wire to real signing in prod). */
  signedUrl(key: TileKey, secret: string, ttlSeconds: number): string {
    const { layerId, coord: { z, x, y }, timeBucket } = key;
    const ext = "mvt";
    const path = tileCdnPath(layerId, z, x, y, ext);
    const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
    // Production: use crypto.createHmac('sha256', secret).update(path + expires).digest('hex')
    const sig = Buffer.from(`${path}:${expires}:${secret}`).toString("base64url").slice(0, 32);
    return `https://tiles.aegislens.com/${path}?expires=${expires}&sig=${sig}`;
  }
}

export const tileCache = new TileCache();
