import "server-only";
import { cookies } from "next/headers";

/**
 * Sprint stub account module. No real auth — presence of the `aegis_session`
 * cookie returns a hardcoded user. Real auth (WorkOS / Clerk / Auth.js) lands
 * in a follow-up sprint.
 */

export const SESSION_COOKIE = "aegis_session";

export type ApiKey = {
  id: string;
  label: string;
  prefix: string;
  createdAt: string;
};

export type Plan = "free" | "pro";

export type Usage = {
  requestsToday: number;
  requestsLimit: number;
};

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  plan: Plan;
  memberSince: string;
  apiKeys: ApiKey[];
  usage: Usage;
};

const SAMPLE_USER: CurrentUser = {
  id: "usr_01HXSAMPLE",
  email: "analyst@aegislens.dev",
  name: "Sample Analyst",
  plan: "free",
  memberSince: "2026-01-12",
  apiKeys: [
    {
      id: "key_01HXAAAA",
      label: "Local dev",
      prefix: "ak_live_a1b2c3d4",
      createdAt: "2026-02-03T10:14:00Z",
    },
    {
      id: "key_01HXBBBB",
      label: "CI runner",
      prefix: "ak_live_9f8e7d6c",
      createdAt: "2026-04-18T08:22:00Z",
    },
  ],
  usage: {
    requestsToday: 142,
    requestsLimit: 1000,
  },
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const c = await cookies();
  const has = c.get(SESSION_COOKIE)?.value;
  if (!has) return null;
  return SAMPLE_USER;
}

export function randomHex(bytes: number): string {
  let out = "";
  for (let i = 0; i < bytes; i++) {
    out += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0");
  }
  return out;
}
