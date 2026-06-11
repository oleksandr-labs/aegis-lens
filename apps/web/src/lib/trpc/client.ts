/**
 * tRPC React client for the browser / Next.js client components.
 *
 * Usage:
 *   import { trpc } from "@/lib/trpc/client";
 *   const { data } = trpc.events.list.useQuery({ region: "UA-30", limit: 10 });
 *
 * Install dependencies:
 *   npm install @trpc/client@11 @trpc/react-query@11 @tanstack/react-query@5
 *
 * tRPC React-клієнт для браузерних компонентів.
 */

"use client";

import {
  createTRPCReact,
  httpBatchLink,
  loggerLink,
} from "@trpc/react-query";
import { type AppRouter } from "./router";

// ── tRPC React instance ───────────────────────────────────────────────────────

export const trpc = createTRPCReact<AppRouter>();

// ── Client factory ────────────────────────────────────────────────────────────

/**
 * Creates the tRPC client with batching and optional logger.
 *
 * Call this once in your TrpcProvider component:
 *   const [trpcClient] = useState(() => createTrpcClient());
 *
 * Створює tRPC-клієнт з batching і опційним logger.
 */
export function createTrpcClient() {
  return trpc.createClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
      }),
      httpBatchLink({
        url: "/api/trpc",
        headers() {
          // Add auth token if available (client-side)
          if (typeof window === "undefined") return {};
          const token = sessionStorage.getItem("aegis_access_token");
          if (!token) return {};
          return { Authorization: `Bearer ${token}` };
        },
      }),
    ],
  });
}

// ── Type exports ──────────────────────────────────────────────────────────────

export type { AppRouter };
