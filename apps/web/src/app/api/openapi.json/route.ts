import { NextResponse } from "next/server";

export const SPEC = {
  openapi: "3.1.0",
  info: {
    title: "Aegis Lens Public API",
    version: "0.1.0",
    description:
      "Public read-only JSON API for Aegis Lens — an OSINT situational awareness platform covering Ukraine, Poland, and Germany. Exposes events, sources, reports, and an alert-subscription endpoint.\n\n**Locale prefixing**: paths flagged with `x-locale-prefixed: true` (the feed endpoints) also exist under `/{locale}/...` for every active non-EN locale (currently `uk`). EN is canonical and unprefixed.",
    contact: {
      name: "Aegis Lens API",
      email: "api@aegislens.io",
    },
  },
  servers: [{ url: "https://aegislens.io" }],
  tags: [
    { name: "events", description: "Canonical OSINT events feed." },
    { name: "sources", description: "Registered public OSINT sources." },
    { name: "reports", description: "Editorial reports and dossiers." },
    { name: "alerts", description: "Alert subscription management." },
    { name: "ops", description: "Operational endpoints — health, uptime probes." },
    { name: "reference", description: "Static reference data — topics, glossary, equipment, regions." },
    { name: "search", description: "Lightweight search-suggest autocomplete." },
    { name: "copilot", description: "LLM-backed analyst Q&A over the events corpus." },
    {
      name: "feeds",
      description:
        "Syndication feeds: RSS 2.0, Atom 1.0, JSON Feed 1.1. Every operation in this tag carries `x-locale-prefixed: true` — meaning each path also exists under `/{locale}/...` for every active non-EN locale (currently `uk`). EN is canonical and unprefixed.",
    },
  ],
  paths: {
    "/api/events": {
      get: {
        tags: ["events"],
        summary: "List events",
        operationId: "listEvents",
        parameters: [
          {
            name: "country",
            in: "query",
            required: false,
            description: "Filter by ISO2 country code.",
            schema: { type: "string", enum: ["UA", "PL", "DE"] },
          },
          {
            name: "class",
            in: "query",
            required: false,
            description: "Filter by event class (repeatable).",
            style: "form",
            explode: true,
            schema: {
              type: "array",
              items: { $ref: "#/components/schemas/EventClass" },
            },
          },
          {
            name: "since",
            in: "query",
            required: false,
            description: "ISO 8601 date-time lower bound for occurredAt.",
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Maximum events to return per page.",
            schema: { type: "integer", minimum: 1, maximum: 200, default: 50 },
          },
          {
            name: "cursor",
            in: "query",
            required: false,
            description:
              "Opaque pagination cursor returned as `meta.nextCursor` on the previous page. Omit for the first page. Order is `occurredAt` desc, `eventId` desc.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Paged event list.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data", "meta"],
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Event" },
                    },
                    meta: {
                      type: "object",
                      required: ["count", "total", "hasMore"],
                      properties: {
                        count: { type: "integer", minimum: 0 },
                        total: { type: "integer", minimum: 0 },
                        hasMore: { type: "boolean" },
                        nextCursor: {
                          type: "string",
                          nullable: true,
                          description:
                            "Pass back as `cursor` to fetch the next page. `null` when no more results.",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/sources": {
      get: {
        tags: ["sources"],
        summary: "List public OSINT sources",
        operationId: "listSources",
        responses: {
          "200": {
            description: "Source registry.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Source" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/reports": {
      get: {
        tags: ["reports"],
        summary: "List editorial reports",
        operationId: "listReports",
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Maximum reports to return.",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          "200": {
            description: "Most-recent reports first.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Report" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/subscribe": {
      post: {
        tags: ["alerts"],
        summary: "Subscribe to alert digests",
        operationId: "subscribe",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email" },
                  topics: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Subscription queued.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["ok", "queued"],
                  properties: {
                    ok: { type: "boolean", const: true },
                    queued: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid email address.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "429": {
            description: "Rate-limited.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/health": {
      get: {
        tags: ["ops"],
        summary: "Service health probe",
        operationId: "getHealth",
        description:
          "Returns a structured liveness/readiness payload with current seed-data counts and the LLM-key presence flag. Always 200 by design (probe pattern); consumers should treat `status !== \"ok\"` or a non-2xx HTTP code as a failure. `Cache-Control: no-store` is set so monitors always see fresh state.",
        responses: {
          "200": {
            description: "Health payload.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status", "service", "version", "ts", "data", "llm"],
                  properties: {
                    status: { type: "string", const: "ok" },
                    service: { type: "string", example: "aegis-web" },
                    version: { type: "string", example: "0.0.1" },
                    ts: { type: "string", format: "date-time" },
                    region: { type: ["string", "null"] },
                    runtime: { type: "string", example: "nodejs" },
                    data: {
                      type: "object",
                      required: [
                        "events",
                        "sources",
                        "investigations",
                        "reports",
                        "threats",
                      ],
                      properties: {
                        events: {
                          type: "object",
                          required: ["total", "last24h", "last7d"],
                          properties: {
                            total: { type: "integer", minimum: 0 },
                            last24h: { type: "integer", minimum: 0 },
                            last7d: { type: "integer", minimum: 0 },
                          },
                        },
                        sources: { type: "integer", minimum: 0 },
                        investigations: { type: "integer", minimum: 0 },
                        reports: { type: "integer", minimum: 0 },
                        threats: { type: "integer", minimum: 0 },
                      },
                    },
                    llm: {
                      type: "object",
                      required: ["anthropic"],
                      properties: {
                        anthropic: { type: "boolean" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/topics": {
      get: {
        tags: ["reference"],
        summary: "List event-class topics with counts",
        operationId: "listTopics",
        description: "Returns each event class with a current event-count. Rate-limited 60/min/IP.",
        responses: {
          "200": {
            description: "Topic list.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["id", "label", "count"],
                        properties: {
                          id: { $ref: "#/components/schemas/EventClass" },
                          label: { type: "string" },
                          count: { type: "integer", minimum: 0 },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "429": {
            description: "Rate-limited.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/glossary": {
      get: {
        tags: ["reference"],
        summary: "List or search glossary terms",
        operationId: "listGlossary",
        description: "Returns glossary terms; pass `q` to filter by case-insensitive substring on term or definition.",
        parameters: [
          {
            name: "q",
            in: "query",
            required: false,
            description: "Substring filter.",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Glossary entries.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["slug", "term", "definition"],
                        properties: {
                          slug: { type: "string" },
                          term: { type: "object", additionalProperties: { type: "string" } },
                          definition: { type: "object", additionalProperties: { type: "string" } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "429": {
            description: "Rate-limited.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/equipment": {
      get: {
        tags: ["reference"],
        summary: "List equipment catalogue",
        operationId: "listEquipment",
        description: "Returns the full equipment catalogue. Rate-limited 60/min/IP.",
        responses: {
          "200": {
            description: "Equipment list.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["slug", "name", "type", "origin"],
                        properties: {
                          slug: { type: "string" },
                          name: { type: "object", additionalProperties: { type: "string" } },
                          type: { type: "string" },
                          origin: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "429": {
            description: "Rate-limited.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/regions": {
      get: {
        tags: ["reference"],
        summary: "List regions or oblasts",
        operationId: "listRegions",
        description: "Without `country`: lists supported countries. With `country=ua|pl|de`: lists oblasts for that country.",
        parameters: [
          {
            name: "country",
            in: "query",
            required: false,
            description: "ISO2 country code.",
            schema: { type: "string", enum: ["ua", "pl", "de"] },
          },
        ],
        responses: {
          "200": {
            description: "Regions or oblasts.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          },
          "429": {
            description: "Rate-limited.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/search/suggest": {
      get: {
        tags: ["search"],
        summary: "Autocomplete suggestions across the indexed corpus",
        operationId: "searchSuggest",
        description: "Ranked suggestions across glossary, equipment, conflicts, investigations, events, regions, sources, threats, reports, companies, tools. Rate-limited 60/min/IP.",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            description: "Query string.",
            schema: { type: "string", minLength: 1 },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Max suggestions returned.",
            schema: { type: "integer", minimum: 1, maximum: 25, default: 8 },
          },
        ],
        responses: {
          "200": {
            description: "Suggestion list.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["kind", "label", "href"],
                        properties: {
                          kind: { type: "string" },
                          label: { type: "string" },
                          href: { type: "string" },
                          sub: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "429": {
            description: "Rate-limited.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/api/copilot": {
      post: {
        tags: ["copilot"],
        summary: "Analyst Q&A over the events corpus (single-shot)",
        operationId: "copilot",
        description: "Returns a deterministic stats block plus an LLM-generated answer that cites event IDs in brackets. Rate-limited 20/min/IP. Falls back to fake-mode text if `ANTHROPIC_API_KEY` is unset.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["prompt"],
                properties: {
                  prompt: { type: "string", minLength: 1 },
                  country: { type: "string", enum: ["UA", "PL", "DE"] },
                  hours: { type: "integer", minimum: 1, maximum: 720 },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Answer payload.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["answer", "stats"],
                  properties: {
                    answer: { type: "string" },
                    stats: {
                      type: "object",
                      properties: {
                        count: { type: "integer" },
                        topClass: { type: "string" },
                        avgDanger: { type: "number" },
                      },
                    },
                    citations: { type: "array", items: { type: "string" } },
                    provider: { type: "string", example: "anthropic" },
                    model: { type: "string" },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid body.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
          "429": {
            description: "Rate-limited.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/news/feed.xml": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "News events as RSS 2.0",
        operationId: "newsRssFeed",
        description: "50 most recent events. Per-locale equivalents at `/[locale]/news/feed.xml`.",
        responses: {
          "200": {
            description: "RSS 2.0 XML.",
            content: {
              "application/rss+xml": {
                schema: { type: "string", format: "xml" },
              },
            },
          },
        },
      },
    },
    "/news/atom.xml": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "News events as Atom 1.0",
        operationId: "newsAtomFeed",
        description: "50 most recent events. Per-locale equivalents at `/[locale]/news/atom.xml`.",
        responses: {
          "200": {
            description: "Atom 1.0 XML.",
            content: {
              "application/atom+xml": { schema: { type: "string", format: "xml" } },
            },
          },
        },
      },
    },
    "/news/feed.json": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "News events as JSON Feed 1.1",
        operationId: "newsJsonFeed",
        description: "Returns the 50 most recent events in JSON Feed 1.1 shape with an `_aegis` extension object per item carrying structured event metadata. Also available as RSS 2.0 (`/news/feed.xml`) and Atom 1.0 (`/news/atom.xml`). Per-locale equivalents live under `/[locale]/news/feed.json`.",
        responses: {
          "200": {
            description: "JSON Feed body.",
            content: {
              "application/feed+json": {
                schema: { $ref: "#/components/schemas/JsonFeed" },
              },
            },
          },
        },
      },
    },
    "/topics/{slug}/feed.xml": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "Per-topic events as RSS 2.0",
        operationId: "topicRssFeed",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { $ref: "#/components/schemas/EventClass" } },
        ],
        responses: {
          "200": { description: "RSS 2.0 XML.", content: { "application/rss+xml": { schema: { type: "string", format: "xml" } } } },
          "404": { description: "Topic not found." },
        },
      },
    },
    "/topics/{slug}/atom.xml": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "Per-topic events as Atom 1.0",
        operationId: "topicAtomFeed",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { $ref: "#/components/schemas/EventClass" } },
        ],
        responses: {
          "200": { description: "Atom 1.0 XML.", content: { "application/atom+xml": { schema: { type: "string", format: "xml" } } } },
          "404": { description: "Topic not found." },
        },
      },
    },
    "/topics/{slug}/feed.json": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "Per-topic events as JSON Feed 1.1",
        operationId: "topicJsonFeed",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { $ref: "#/components/schemas/EventClass" } },
        ],
        responses: {
          "200": { description: "JSON Feed body.", content: { "application/feed+json": { schema: { $ref: "#/components/schemas/JsonFeed" } } } },
          "404": { description: "Topic not found." },
        },
      },
    },
    "/entities/{slug}/feed.xml": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "Per-entity events + investigations as RSS 2.0",
        operationId: "entityRssFeed",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "RSS 2.0 XML.", content: { "application/rss+xml": { schema: { type: "string", format: "xml" } } } },
          "404": { description: "Entity not found." },
        },
      },
    },
    "/entities/{slug}/atom.xml": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "Per-entity events + investigations as Atom 1.0",
        operationId: "entityAtomFeed",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Atom 1.0 XML.", content: { "application/atom+xml": { schema: { type: "string", format: "xml" } } } },
          "404": { description: "Entity not found." },
        },
      },
    },
    "/entities/{slug}/feed.json": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "Per-entity events + investigations as JSON Feed 1.1",
        operationId: "entityJsonFeed",
        description: "Items carry either `JsonFeedAegisEvent` or `JsonFeedAegisInvestigation` shapes in the `_aegis` extension.",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "JSON Feed body.", content: { "application/feed+json": { schema: { $ref: "#/components/schemas/JsonFeed" } } } },
          "404": { description: "Entity not found." },
        },
      },
    },
    "/investigations/{slug}/feed.xml": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "Per-investigation cited events as RSS 2.0",
        operationId: "investigationRssFeed",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "RSS 2.0 XML.", content: { "application/rss+xml": { schema: { type: "string", format: "xml" } } } },
          "404": { description: "Investigation not found or has no cited events." },
        },
      },
    },
    "/investigations/{slug}/atom.xml": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "Per-investigation cited events as Atom 1.0",
        operationId: "investigationAtomFeed",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Atom 1.0 XML.", content: { "application/atom+xml": { schema: { type: "string", format: "xml" } } } },
          "404": { description: "Investigation not found or has no cited events." },
        },
      },
    },
    "/investigations/{slug}/feed.json": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "Per-investigation cited events as JSON Feed 1.1",
        operationId: "investigationJsonFeed",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "JSON Feed body.", content: { "application/feed+json": { schema: { $ref: "#/components/schemas/JsonFeed" } } } },
          "404": { description: "Investigation not found or has no cited events." },
        },
      },
    },
    "/regions/{country}/{oblast}/feed.xml": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "Per-oblast bbox-filtered events as RSS 2.0",
        operationId: "regionRssFeed",
        parameters: [
          { name: "country", in: "path", required: true, schema: { type: "string", enum: ["ua", "pl", "de"] } },
          { name: "oblast", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "RSS 2.0 XML.", content: { "application/rss+xml": { schema: { type: "string", format: "xml" } } } },
          "404": { description: "Oblast not found." },
        },
      },
    },
    "/regions/{country}/{oblast}/atom.xml": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "Per-oblast bbox-filtered events as Atom 1.0",
        operationId: "regionAtomFeed",
        parameters: [
          { name: "country", in: "path", required: true, schema: { type: "string", enum: ["ua", "pl", "de"] } },
          { name: "oblast", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Atom 1.0 XML.", content: { "application/atom+xml": { schema: { type: "string", format: "xml" } } } },
          "404": { description: "Oblast not found." },
        },
      },
    },
    "/regions/{country}/{oblast}/feed.json": {
      get: {
        tags: ["feeds"],
        "x-locale-prefixed": true,
        summary: "Per-oblast bbox-filtered events as JSON Feed 1.1",
        operationId: "regionJsonFeed",
        parameters: [
          { name: "country", in: "path", required: true, schema: { type: "string", enum: ["ua", "pl", "de"] } },
          { name: "oblast", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "JSON Feed body.", content: { "application/feed+json": { schema: { $ref: "#/components/schemas/JsonFeed" } } } },
          "404": { description: "Oblast not found." },
        },
      },
    },
    "/api/copilot/stream": {
      post: {
        tags: ["copilot"],
        summary: "Analyst Q&A streamed as Server-Sent Events",
        operationId: "copilotStream",
        description: "Same body as /api/copilot. Returns text/event-stream with event types `stats`, `delta`, `citation`, `done`. Rate-limited 10/min/IP. Header `x-accel-buffering: no` is set to prevent reverse-proxy buffering.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["prompt"],
                properties: {
                  prompt: { type: "string", minLength: 1 },
                  country: { type: "string", enum: ["UA", "PL", "DE"] },
                  hours: { type: "integer", minimum: 1, maximum: 720 },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "SSE stream.",
            content: {
              "text/event-stream": {
                schema: { type: "string", description: "Series of SSE events: stats, delta, citation, done." },
              },
            },
          },
          "429": {
            description: "Rate-limited.",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      EventClass: {
        type: "string",
        enum: [
          "military_action",
          "infrastructure",
          "civilian_alert",
          "humanitarian",
          "cyber",
          "maritime",
          "aviation",
          "environmental",
          "political",
          "economic",
        ],
      },
      VerificationState: {
        type: "string",
        enum: [
          "unverified",
          "corroborated",
          "verified",
          "disputed",
          "retracted",
        ],
      },
      GeoPoint: {
        type: "object",
        required: ["lat", "lon"],
        properties: {
          lat: { type: "number", minimum: -90, maximum: 90 },
          lon: { type: "number", minimum: -180, maximum: 180 },
          precisionM: {
            type: ["number", "null"],
            description: "Precision radius in meters; null if unknown.",
          },
        },
      },
      EventSource: {
        type: "object",
        required: ["url", "archiveUrl", "fetchedAt", "language", "contentHash"],
        properties: {
          url: { type: "string", format: "uri" },
          archiveUrl: { type: ["string", "null"], format: "uri" },
          fetchedAt: { type: "string", format: "date-time" },
          language: { type: "string" },
          contentHash: { type: "string", description: "SHA-256 hex." },
        },
      },
      EventMedia: {
        type: "object",
        required: ["id", "type", "url", "thumbnailUrl", "verificationState"],
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: ["image", "video"] },
          url: { type: "string", format: "uri" },
          thumbnailUrl: { type: ["string", "null"], format: "uri" },
          verificationState: { $ref: "#/components/schemas/VerificationState" },
        },
      },
      LocalizedString: {
        type: "object",
        required: ["en"],
        additionalProperties: { type: "string" },
        properties: { en: { type: "string" } },
      },
      Event: {
        type: "object",
        required: [
          "eventId",
          "occurredAt",
          "reportedAt",
          "ingestedAt",
          "location",
          "class",
          "subclass",
          "severity",
          "dangerScore",
          "confidence",
          "verificationState",
          "sources",
          "media",
          "summary",
          "originalText",
        ],
        properties: {
          eventId: { type: "string", description: "ULID." },
          occurredAt: { type: "string", format: "date-time" },
          reportedAt: { type: "string", format: "date-time" },
          ingestedAt: { type: "string", format: "date-time" },
          location: { $ref: "#/components/schemas/GeoPoint" },
          class: { $ref: "#/components/schemas/EventClass" },
          subclass: { type: ["string", "null"] },
          severity: { type: "integer", minimum: 0, maximum: 5 },
          dangerScore: { type: "number", minimum: 0, maximum: 100 },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          verificationState: { $ref: "#/components/schemas/VerificationState" },
          sources: {
            type: "array",
            items: { $ref: "#/components/schemas/EventSource" },
          },
          media: {
            type: "array",
            items: { $ref: "#/components/schemas/EventMedia" },
          },
          summary: { $ref: "#/components/schemas/LocalizedString" },
          originalText: { type: ["string", "null"] },
        },
      },
      Source: {
        type: "object",
        required: [
          "slug",
          "name",
          "kind",
          "country",
          "language",
          "description",
          "reliability",
          "homepageUrl",
        ],
        properties: {
          slug: { type: "string" },
          name: { type: "string" },
          kind: {
            type: "string",
            enum: [
              "telegram",
              "satellite",
              "news",
              "official_gov",
              "ova_telegram",
              "cyber",
              "academic",
              "milblogger",
            ],
          },
          country: { type: "string", description: "ISO2 country code." },
          language: { type: "string" },
          description: { type: "string" },
          reliability: { type: "number", minimum: 0, maximum: 1 },
          homepageUrl: { type: "string", format: "uri" },
        },
      },
      Report: {
        type: "object",
        required: [
          "slug",
          "title",
          "kind",
          "publishedAt",
          "author",
          "summary",
          "body",
          "citations",
        ],
        properties: {
          slug: { type: "string" },
          title: { $ref: "#/components/schemas/LocalizedString" },
          kind: {
            type: "string",
            enum: ["regional", "incident", "weekly", "trend", "methodology"],
          },
          publishedAt: { type: "string", format: "date-time" },
          author: { type: "string" },
          summary: { $ref: "#/components/schemas/LocalizedString" },
          body: { $ref: "#/components/schemas/LocalizedString" },
          citations: {
            type: "array",
            items: { type: "string", description: "Event ID." },
          },
        },
      },
      Error: {
        type: "object",
        required: ["ok", "error"],
        properties: {
          ok: { type: "boolean", const: false },
          error: { type: "string" },
        },
      },
      JsonFeedAegisEvent: {
        type: "object",
        description:
          "Aegis Lens extension fields attached to JSON Feed event items. Underscore-prefixed key is reserved by the JSON Feed 1.1 spec for extensions, so unaware consumers ignore it.",
        properties: {
          eventId: { type: "string" },
          eventClass: { $ref: "#/components/schemas/EventClass" },
          subclass: { type: ["string", "null"] },
          dangerScore: { type: "number", minimum: 0, maximum: 100 },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          verificationState: { $ref: "#/components/schemas/VerificationState" },
          location: { $ref: "#/components/schemas/GeoPoint" },
        },
      },
      JsonFeedAegisInvestigation: {
        type: "object",
        description:
          "Aegis Lens extension fields attached to JSON Feed investigation items (appears on per-entity feeds where investigations are interleaved with events).",
        properties: {
          analyst: { type: "string" },
          investigationSlug: { type: "string" },
        },
      },
      JsonFeedItem: {
        type: "object",
        required: ["id", "url", "title"],
        properties: {
          id: { type: "string" },
          url: { type: "string", format: "uri" },
          title: { type: "string" },
          content_text: { type: "string" },
          summary: { type: "string" },
          date_published: { type: "string", format: "date-time" },
          tags: { type: "array", items: { type: "string" } },
          language: { type: "string" },
          _aegis: {
            oneOf: [
              { $ref: "#/components/schemas/JsonFeedAegisEvent" },
              { $ref: "#/components/schemas/JsonFeedAegisInvestigation" },
            ],
          },
        },
      },
      JsonFeed: {
        type: "object",
        description: "JSON Feed 1.1 envelope. https://www.jsonfeed.org/version/1.1/",
        required: ["version", "title", "items"],
        properties: {
          version: { type: "string", const: "https://jsonfeed.org/version/1.1" },
          title: { type: "string" },
          description: { type: "string" },
          home_page_url: { type: "string", format: "uri" },
          feed_url: { type: "string", format: "uri" },
          language: { type: "string" },
          authors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                url: { type: "string", format: "uri" },
              },
            },
          },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/JsonFeedItem" },
          },
        },
      },
    },
  },
} as const;

export function GET(): NextResponse {
  return NextResponse.json(SPEC, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=900",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
