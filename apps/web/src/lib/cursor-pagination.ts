/**
 * Cursor-based pagination utilities.
 *
 * Cursors are opaque base64url-encoded JSON objects:
 *   { id: string; ts: string; dir: "asc" | "desc" }
 *
 * They encode the last-seen item's ID + timestamp, enabling stable
 * keyset pagination that survives inserts/deletes between pages.
 */

export interface CursorPayload {
  id: string;
  ts: string;
  dir: "asc" | "desc";
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.id === "string" && typeof parsed.ts === "string") {
      return parsed as CursorPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export interface PaginationOptions {
  cursor?: string | null;
  limit?: number;
  /** Max allowed limit. Default: 200 */
  maxLimit?: number;
  /** Default limit. Default: 20 */
  defaultLimit?: number;
  dir?: "asc" | "desc";
}

export interface PaginationParams {
  limit: number;
  cursor: CursorPayload | null;
  dir: "asc" | "desc";
}

export function parsePaginationParams(opts: PaginationOptions): PaginationParams {
  const maxLimit = opts.maxLimit ?? 200;
  const defaultLimit = opts.defaultLimit ?? 20;
  const rawLimit = opts.limit ?? defaultLimit;
  const limit = Math.min(Math.max(1, rawLimit), maxLimit);
  const cursor = opts.cursor ? decodeCursor(opts.cursor) : null;
  const dir = opts.dir ?? "desc";
  return { limit, cursor, dir };
}

export interface PaginatedResult<T extends { id?: string; eventId?: string; occurredAt?: string; createdAt?: string }> {
  data: T[];
  meta: {
    count: number;
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
    dir: "asc" | "desc";
  };
}

/**
 * Apply cursor-based pagination to an already-sorted in-memory array.
 * Production: use this to generate WHERE clauses for Postgres (keyset pagination).
 */
export function paginateArray<T extends Record<string, unknown>>(
  items: T[],
  params: PaginationParams,
  idKey: keyof T = "id" as keyof T,
  tsKey: keyof T = "occurredAt" as keyof T,
): PaginatedResult<T & { id?: string; occurredAt?: string }> {
  let filtered = items;

  if (params.cursor) {
    const { id, ts, dir } = params.cursor;
    const cursorTs = new Date(ts).getTime();
    filtered = items.filter((item) => {
      const itemTs = new Date(String(item[tsKey] ?? "")).getTime();
      if (dir === "desc") {
        return itemTs < cursorTs || (itemTs === cursorTs && String(item[idKey]) < id);
      }
      return itemTs > cursorTs || (itemTs === cursorTs && String(item[idKey]) > id);
    });
  }

  const page = filtered.slice(0, params.limit);
  const hasMore = filtered.length > params.limit;

  let nextCursor: string | null = null;
  if (hasMore && page.length > 0) {
    const last = page[page.length - 1];
    nextCursor = encodeCursor({
      id: String(last[idKey] ?? ""),
      ts: String(last[tsKey] ?? ""),
      dir: params.dir,
    });
  }

  return {
    data: page as any,
    meta: {
      count: page.length,
      limit: params.limit,
      nextCursor,
      hasMore,
      dir: params.dir,
    },
  };
}

/**
 * Extract pagination query params from a URL.
 */
export function extractPaginationParams(url: URL, maxLimit = 200): PaginationParams {
  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
  const cursor = url.searchParams.get("cursor");
  const dir = (url.searchParams.get("dir") as "asc" | "desc") ?? "desc";
  return parsePaginationParams({ limit, cursor, maxLimit, dir });
}
