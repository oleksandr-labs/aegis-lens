/**
 * Next.js App Router handler for tRPC v11.
 *
 * Mounts all tRPC procedures at /api/trpc/[procedure].
 * Supports both GET (queries) and POST (mutations + queries via POST).
 *
 * Обробник Next.js для tRPC v11: GET і POST для запитів і мутацій.
 */

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter, createTRPCContext } from "@/lib/trpc/router";

export const dynamic = "force-dynamic";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: ({ req }) => createTRPCContext(req),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(`tRPC error on ${path}:`, error);
          }
        : undefined,
  });

export { handler as GET, handler as POST };
