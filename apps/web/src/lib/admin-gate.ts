import "server-only";
import { cookies } from "next/headers";

/**
 * Sprint 1.5 placeholder gate. Real auth (WorkOS / Clerk / Auth.js) wires up
 * in a follow-up sprint.
 *
 * Mechanism: an env var `ADMIN_TOKEN` must match the `aegis_admin` cookie.
 * Without `ADMIN_TOKEN` set on the server, admin pages are blocked entirely.
 */

export const ADMIN_COOKIE = "aegis_admin";

export async function isAdminAuthenticated(): Promise<boolean> {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const c = await cookies();
  const got = c.get(ADMIN_COOKIE)?.value;
  return Boolean(got) && got === expected;
}
