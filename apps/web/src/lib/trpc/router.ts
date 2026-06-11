/**
 * tRPC v11 app router — Aegis Lens BFF layer.
 *
 * Architecture:
 *   - publicProcedure: unauthenticated reads (open data, public map layers)
 *   - protectedProcedure: requires valid JWT session
 *   - Sub-routers: events, regions, alerts, aois
 *
 * Install: npm install @trpc/server@11 @trpc/client@11 @trpc/react-query@11 zod
 *
 * tRPC v11 роутер: публічні та захищені процедури, підроутери для подій,
 * регіонів, сповіщень і AOI.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

// ── Context ───────────────────────────────────────────────────────────────────

export interface TrpcContext {
  /** Authenticated user ID or null for unauthenticated requests. */
  userId: string | null;
  /** Organisation ID for the authenticated user. */
  orgId: string | null;
  /** Subscription tier (free | pro | enterprise). */
  tier: string | null;
  /** Raw request object (needed for rate limiting, IP extraction). */
  req: Request;
}

/**
 * Creates the tRPC context from a Next.js App Router request.
 * Called by the tRPC Next.js handler in route.ts.
 *
 * Створює контекст tRPC з заголовків запиту (JWT).
 */
export async function createTRPCContext(
  req: Request,
): Promise<TrpcContext> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return { userId: null, orgId: null, tier: null, req };
  }

  // In production, validate JWT via apps/web/src/lib/jwt.ts
  // Lightweight stub — real validation in jwt.ts validateBearerToken()
  try {
    // Decode (no verify) just for stub context — replace with real jwt.ts call
    const [, payloadB64] = token.split(".");
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as { sub?: string; org?: string; tier?: string };
    return {
      userId: payload.sub ?? null,
      orgId: payload.org ?? null,
      tier: payload.tier ?? null,
      req,
    };
  } catch {
    return { userId: null, orgId: null, tier: null, req };
  }
}

// ── tRPC initialisation ───────────────────────────────────────────────────────

const t = initTRPC.context<TrpcContext>().create();

export const router = t.router;
export const middleware = t.middleware;

// ── Procedures ────────────────────────────────────────────────────────────────

/** Public procedure — no auth required. */
export const publicProcedure = t.procedure;

/** Protected procedure — rejects unauthenticated requests with 401. */
export const protectedProcedure = t.procedure.use(
  middleware(({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required.",
      });
    }
    return next({ ctx: { ...ctx, userId: ctx.userId } });
  }),
);

// ── Sub-routers ───────────────────────────────────────────────────────────────

const eventsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        region: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      // Stub — wire to events-store or database in production
      return {
        items: [] as Array<{
          id: string;
          type: string;
          region: string;
          timestamp: string;
        }>,
        cursor: undefined as string | undefined,
        total: 0,
        input,
      };
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return { id: input.id, type: "unknown", data: null };
    }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        region: z.string(),
        lat: z.number(),
        lon: z.number(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return {
        id: `evt_${Date.now()}`,
        createdBy: ctx.userId,
        ...input,
      };
    }),
});

const regionsRouter = router({
  list: publicProcedure.query(async () => {
    return { regions: [] as Array<{ code: string; name: string; oblastId: string }> };
  }),

  stats: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      return {
        code: input.code,
        eventCount: 0,
        alertCount: 0,
        lastUpdated: new Date().toISOString(),
      };
    }),
});

const alertsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        oblast: z.string().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        limit: z.number().min(1).max(50).default(10),
      }),
    )
    .query(async ({ input }) => {
      return {
        items: [] as Array<{
          id: string;
          severity: string;
          oblast: string;
          message: string;
          triggeredAt: string;
        }>,
        input,
      };
    }),

  subscribe: protectedProcedure
    .input(
      z.object({
        oblasts: z.array(z.string()),
        channels: z.array(z.enum(["email", "slack", "telegram", "webhook"])),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return { subscriptionId: `sub_${Date.now()}`, userId: ctx.userId, ...input };
    }),
});

const aoisRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return {
      items: [] as Array<{
        id: string;
        name: string;
        geojson: object;
        createdAt: string;
      }>,
      orgId: ctx.orgId,
    };
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        geojson: z.record(z.unknown()),
        watchCategories: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return {
        id: `aoi_${Date.now()}`,
        createdBy: ctx.userId,
        orgId: ctx.orgId,
        ...input,
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return { deleted: true, id: input.id };
    }),
});

// ── App router ────────────────────────────────────────────────────────────────

export const appRouter = router({
  events: eventsRouter,
  regions: regionsRouter,
  alerts: alertsRouter,
  aois: aoisRouter,
});

export type AppRouter = typeof appRouter;
