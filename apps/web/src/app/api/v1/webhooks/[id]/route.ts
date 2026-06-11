/**
 * GET    /api/v1/webhooks/:id — get webhook endpoint details
 * PATCH  /api/v1/webhooks/:id — update webhook endpoint
 * DELETE /api/v1/webhooks/:id — delete webhook endpoint
 *
 * Versioned (v1) alias — delegates to the canonical handler.
 * Enterprise webhook management per-endpoint operations.
 *
 * Версіонований аліас для CRUD-операцій над окремим webhook-ендпоінтом.
 */
export { GET, PATCH, DELETE, dynamic } from "@/app/api/webhooks/[id]/route";
