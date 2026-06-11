import { NextResponse } from "next/server";

type PostmanQuery = { key: string; value: string; description?: string };

type PostmanRequest = {
  name: string;
  request: {
    method: "GET" | "POST";
    header: { key: string; value: string }[];
    url: {
      raw: string;
      host: string[];
      path: string[];
      query?: PostmanQuery[];
    };
    description?: string;
    body?: {
      mode: "raw";
      raw: string;
      options: { raw: { language: "json" } };
    };
  };
};

const BASE_HOST = ["{{base_url}}"];

function getRequest(
  name: string,
  path: string[],
  description: string,
  query?: PostmanQuery[],
): PostmanRequest {
  const queryString =
    query && query.length
      ? "?" + query.map((q) => `${q.key}=${encodeURIComponent(q.value)}`).join("&")
      : "";
  return {
    name,
    request: {
      method: "GET",
      header: [{ key: "Accept", value: "application/json" }],
      url: {
        raw: `{{base_url}}/${path.join("/")}${queryString}`,
        host: BASE_HOST,
        path,
        ...(query && query.length ? { query } : {}),
      },
      description,
    },
  };
}

function postRequest(
  name: string,
  path: string[],
  description: string,
  body: unknown,
): PostmanRequest {
  return {
    name,
    request: {
      method: "POST",
      header: [
        { key: "Accept", value: "application/json" },
        { key: "Content-Type", value: "application/json" },
      ],
      url: {
        raw: `{{base_url}}/${path.join("/")}`,
        host: BASE_HOST,
        path,
      },
      description,
      body: {
        mode: "raw",
        raw: JSON.stringify(body, null, 2),
        options: { raw: { language: "json" } },
      },
    },
  };
}

const COLLECTION = {
  info: {
    name: "Aegis Lens Public API",
    description:
      "Public read-only JSON API for Aegis Lens — events, sources, reports, regions, equipment, glossary, topics, and POST endpoints for subscribe and copilot. Set the `base_url` variable to point at a different environment if needed.",
    schema: "https://schema.postman.com/json/collection/v2.1.0/collection.json",
    _postman_id: "aegis-lens-public-api",
  },
  variable: [
    {
      key: "base_url",
      value: "https://aegislens.io",
      type: "string",
    },
  ],
  item: [
    getRequest(
      "List events",
      ["api", "events"],
      "List published OSINT events ordered by occurrence time, most recent first.",
      [
        { key: "country", value: "ua", description: "ISO2 country code." },
        { key: "class", value: "military_action", description: "Event class filter (repeatable)." },
        { key: "since", value: "2026-05-01T00:00:00Z", description: "ISO 8601 lower bound." },
        { key: "limit", value: "10", description: "Max items (1-200)." },
      ],
    ),
    getRequest(
      "List sources",
      ["api", "sources"],
      "Catalogue of monitored public OSINT sources.",
      [
        { key: "tier", value: "1", description: "Source tier (1-3)." },
        { key: "country", value: "ua", description: "ISO2 country code." },
        { key: "limit", value: "100", description: "Max items (1-500)." },
      ],
    ),
    getRequest(
      "List reports",
      ["api", "reports"],
      "Published analytical reports ordered by publication time, most recent first.",
      [
        { key: "topic", value: "ukraine", description: "Topic slug filter." },
        { key: "country", value: "ua", description: "ISO2 country code." },
        { key: "limit", value: "20", description: "Max items (1-100)." },
      ],
    ),
    getRequest(
      "List regions",
      ["api", "regions"],
      "Administrative regions covered by Aegis Lens.",
      [
        { key: "country", value: "ua", description: "ISO2 country code." },
        { key: "limit", value: "100", description: "Max items." },
      ],
    ),
    getRequest(
      "List equipment",
      ["api", "equipment"],
      "Catalogue of military equipment referenced by events.",
      [
        { key: "kind", value: "drone", description: "Equipment kind filter." },
        { key: "limit", value: "50", description: "Max items." },
      ],
    ),
    getRequest(
      "Glossary",
      ["api", "glossary"],
      "Glossary terms used across the platform.",
      [
        { key: "locale", value: "en", description: "Locale code." },
        { key: "limit", value: "100", description: "Max items." },
      ],
    ),
    getRequest(
      "List topics",
      ["api", "topics"],
      "Editorial topics and dossiers.",
      [
        { key: "limit", value: "50", description: "Max items." },
      ],
    ),
    postRequest(
      "Subscribe",
      ["api", "subscribe"],
      "Subscribe an email address to digest alerts for specified topics.",
      { email: "you@example.com", topics: ["ukraine", "cyber"] },
    ),
    postRequest(
      "Copilot",
      ["api", "copilot"],
      "Ask the Aegis Lens copilot a natural-language question grounded in published events.",
      {
        question: "What kinetic activity was reported in Kharkiv this week?",
        locale: "en",
        context: { country: "ua", since: "2026-05-17T00:00:00Z" },
      },
    ),
  ],
} as const;

export function GET(): NextResponse {
  return NextResponse.json(COLLECTION, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "Content-Disposition": 'inline; filename="aegis-lens.postman_collection.json"',
    },
  });
}
