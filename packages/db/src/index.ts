import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export { schema };
export * from "./schema";

/**
 * Lazy-init Drizzle client. Reads `DATABASE_URL` from env.
 *
 * Sprint 1.4: package scaffold + types only. The web app still reads from
 * in-memory seed; switch reads here in Sprint 2 once docker-compose is run.
 *
 * Usage:
 *   import { db } from "@aegis/db";
 *   const rows = await db.select().from(events).limit(10);
 */
let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function db() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL not set. Set it in apps/web/.env.local or skip @aegis/db.",
    );
  }
  _client = postgres(url, { prepare: false });
  _db = drizzle(_client, { schema });
  return _db;
}

export async function closeDb() {
  if (_client) {
    await _client.end();
    _client = null;
    _db = null;
  }
}
