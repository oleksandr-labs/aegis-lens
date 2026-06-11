/**
 * RFC 7807 Problem Details for HTTP APIs.
 * https://www.rfc-editor.org/rfc/rfc7807
 *
 * Every API error response uses this format:
 *   Content-Type: application/problem+json
 *   {
 *     "type":     "https://aegislens.com/errors/rate-limited",
 *     "title":    "Too Many Requests",
 *     "status":   429,
 *     "detail":   "You have exceeded the limit of 60 requests per minute.",
 *     "instance": "/api/events?country=UA"
 *   }
 */

import { NextResponse } from "next/server";

const ERROR_BASE = "https://aegislens.com/errors";

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  /** Extension fields */
  [key: string]: unknown;
}

// ── Pre-defined error types ───────────────────────────────────────────────────

export const ErrorTypes = {
  rateLimited:       `${ERROR_BASE}/rate-limited`,
  unauthorized:      `${ERROR_BASE}/unauthorized`,
  forbidden:         `${ERROR_BASE}/forbidden`,
  notFound:          `${ERROR_BASE}/not-found`,
  methodNotAllowed:  `${ERROR_BASE}/method-not-allowed`,
  unprocessable:     `${ERROR_BASE}/unprocessable`,
  guardrailBlocked:  `${ERROR_BASE}/guardrail-blocked`,
  internalError:     `${ERROR_BASE}/internal-error`,
  badRequest:        `${ERROR_BASE}/bad-request`,
  gone:              `${ERROR_BASE}/gone`,
  conflict:          `${ERROR_BASE}/conflict`,
} as const;

// ── Factory helpers ───────────────────────────────────────────────────────────

function problem(
  status: number,
  type: string,
  title: string,
  detail?: string,
  extensions?: Record<string, unknown>,
  headers?: HeadersInit,
): NextResponse {
  const body: ProblemDetail = { type, title, status, ...(detail ? { detail } : {}), ...extensions };
  return NextResponse.json(body, {
    status,
    headers: { "Content-Type": "application/problem+json", ...headers },
  });
}

export function problemRateLimit(
  detail?: string,
  retryAfter?: number,
  headers?: HeadersInit,
): NextResponse {
  return problem(
    429,
    ErrorTypes.rateLimited,
    "Too Many Requests",
    detail ?? "You have exceeded the rate limit. Please retry after the indicated interval.",
    retryAfter ? { retryAfter } : undefined,
    { "Retry-After": String(retryAfter ?? 60), ...headers },
  );
}

export function problemUnauthorized(detail?: string): NextResponse {
  return problem(401, ErrorTypes.unauthorized, "Unauthorized", detail ?? "Authentication credentials are missing or invalid.");
}

export function problemForbidden(detail?: string): NextResponse {
  return problem(403, ErrorTypes.forbidden, "Forbidden", detail ?? "You do not have permission to access this resource.");
}

export function problemNotFound(resource?: string, detail?: string): NextResponse {
  return problem(
    404,
    ErrorTypes.notFound,
    "Not Found",
    detail ?? (resource ? `${resource} was not found.` : "The requested resource was not found."),
  );
}

export function problemBadRequest(detail: string, extensions?: Record<string, unknown>): NextResponse {
  return problem(400, ErrorTypes.badRequest, "Bad Request", detail, extensions);
}

export function problemUnprocessable(
  detail: string,
  violations?: Array<{ field: string; message: string }>,
): NextResponse {
  return problem(422, ErrorTypes.unprocessable, "Unprocessable Entity", detail, violations ? { violations } : undefined);
}

export function problemGuardrail(
  category: string,
  messageEn: string,
  messageUk: string,
): NextResponse {
  return problem(422, ErrorTypes.guardrailBlocked, "Guardrail Blocked", messageEn, {
    category,
    messageUk,
    error: "guardrail_blocked",
  });
}

export function problemInternal(detail?: string): NextResponse {
  return problem(
    500,
    ErrorTypes.internalError,
    "Internal Server Error",
    detail ?? "An unexpected error occurred. Please try again later.",
  );
}

export function problemGone(detail?: string, sunsetDate?: string): NextResponse {
  return problem(
    410,
    ErrorTypes.gone,
    "Gone",
    detail ?? "This resource has been permanently removed.",
    sunsetDate ? { sunsetDate } : undefined,
  );
}

// ── Deprecation / Sunset headers ──────────────────────────────────────────────

export function addDeprecationHeaders(
  headers: Headers,
  opts: {
    deprecatedAt?: string;  // ISO-8601 date
    sunsetAt?: string;      // ISO-8601 date
    successor?: string;     // URL of the replacement endpoint
    link?: string;          // Migration guide URL
  },
): void {
  if (opts.deprecatedAt) {
    headers.set("Deprecation", opts.deprecatedAt);
  }
  if (opts.sunsetAt) {
    headers.set("Sunset", opts.sunsetAt);
  }
  const links: string[] = [];
  if (opts.successor) links.push(`<${opts.successor}>; rel="successor-version"`);
  if (opts.link) links.push(`<${opts.link}>; rel="deprecation"`);
  if (links.length) headers.set("Link", links.join(", "));
}
