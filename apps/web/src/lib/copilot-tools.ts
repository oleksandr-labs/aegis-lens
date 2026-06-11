/**
 * Copilot tool-calling contract.
 *
 * Defines typed tool definitions for the AI copilot.
 * Each tool maps to an API action the copilot can invoke.
 *
 * Used with Claude's tool_use feature:
 *   https://docs.anthropic.com/claude/docs/tool-use
 */

export interface CopilotToolDef {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[]; items?: object }>;
    required: string[];
  };
}

export const COPILOT_TOOLS: CopilotToolDef[] = [
  // ── map.filter ──────────────────────────────────────────────────────────
  {
    name: "map_filter",
    description:
      "Filter map events by class, region, severity, time range, or geographic area. " +
      "Use when the user asks to 'show', 'display', or 'filter' events on the map.",
    input_schema: {
      type: "object",
      properties: {
        class: {
          type: "array",
          description: "Event classes to include (e.g. drone, missile, power_outage)",
          items: { type: "string" },
        },
        region_code: {
          type: "string",
          description: "ISO 3166-2 oblast code, e.g. 'UA-63' for Kharkiv",
        },
        severity_min: {
          type: "number",
          description: "Minimum severity 1-5",
        },
        hours: {
          type: "number",
          description: "Look back N hours from now",
        },
        lat: { type: "number", description: "Center latitude for radius search" },
        lon: { type: "number", description: "Center longitude for radius search" },
        radius_km: { type: "number", description: "Radius in kilometers for geo search" },
      },
      required: [],
    },
  },

  // ── events.search ────────────────────────────────────────────────────────
  {
    name: "events_search",
    description:
      "Search events using free text + filters. Returns up to 20 matching events with citations. " +
      "Use when the user asks about specific events, wants to find events, or asks 'what happened'.",
    input_schema: {
      type: "object",
      properties: {
        q: {
          type: "string",
          description: "Free text search query",
        },
        class: {
          type: "string",
          description: "Event class filter",
          enum: ["drone", "missile", "airstrike", "artillery", "explosion", "power_outage", "fire", "other"],
        },
        region_code: { type: "string", description: "Oblast code e.g. UA-63" },
        since: { type: "string", description: "ISO-8601 start time" },
        until: { type: "string", description: "ISO-8601 end time" },
        limit: { type: "number", description: "Max results (default 10, max 20)" },
      },
      required: ["q"],
    },
  },

  // ── reports.generate ────────────────────────────────────────────────────
  {
    name: "reports_generate",
    description:
      "Generate an intelligence report draft for a region or incident. " +
      "Use when the user asks to 'generate a report', 'write a briefing', or 'summarize' for a region.",
    input_schema: {
      type: "object",
      properties: {
        report_type: {
          type: "string",
          description: "Type of report",
          enum: ["regional", "incident", "weekly", "custom"],
        },
        region_code: { type: "string", description: "Target region code" },
        hours: { type: "number", description: "Time window in hours (default 24)" },
        locale: {
          type: "string",
          description: "Output locale",
          enum: ["en", "uk"],
        },
      },
      required: ["report_type"],
    },
  },

  // ── alerts.create ────────────────────────────────────────────────────────
  {
    name: "alerts_create",
    description:
      "Create a new alert rule matching the user's description. " +
      "Use when the user says 'alert me', 'notify me', or 'set up an alert'.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Alert name" },
        description: { type: "string", description: "What triggers this alert" },
        class: { type: "string", description: "Event class to watch" },
        region_code: { type: "string", description: "Region to watch" },
        severity_min: { type: "number", description: "Minimum severity 1-5" },
        channel: {
          type: "string",
          description: "Preferred notification channel",
          enum: ["email", "telegram", "slack", "in_app"],
        },
      },
      required: ["name"],
    },
  },

  // ── aoi.check ────────────────────────────────────────────────────────────
  {
    name: "aoi_check",
    description:
      "Check if an area of interest has been triggered recently. " +
      "Use when the user asks about their watchlist, AOI, or monitored areas.",
    input_schema: {
      type: "object",
      properties: {
        aoi_id: { type: "string", description: "AOI ID to check (optional; lists all if omitted)" },
        hours: { type: "number", description: "Look back N hours" },
      },
      required: [],
    },
  },

  // ── geo.lookup ───────────────────────────────────────────────────────────
  {
    name: "geo_lookup",
    description:
      "Look up a geographic place name and return coordinates. " +
      "Use when the user mentions a place name and needs coordinates for the map.",
    input_schema: {
      type: "object",
      properties: {
        place: { type: "string", description: "Place name in any language" },
        country: { type: "string", description: "Country code hint e.g. UA" },
      },
      required: ["place"],
    },
  },
];

/** Map tool names to handler functions. */
export type CopilotToolName =
  | "map_filter"
  | "events_search"
  | "reports_generate"
  | "alerts_create"
  | "aoi_check"
  | "geo_lookup";

export interface CopilotToolResult {
  toolName: CopilotToolName;
  /** Structured result to embed in assistant context */
  result: unknown;
  /** Event IDs referenced in the result (for citation tracking) */
  citedEventIds: string[];
  error?: string;
}

/**
 * Execute a copilot tool call.
 * Called by the copilot route when Claude returns a tool_use block.
 */
export async function executeCopilotTool(
  name: CopilotToolName,
  input: Record<string, unknown>,
  baseUrl: string,
  apiKey?: string,
): Promise<CopilotToolResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const base: Omit<CopilotToolResult, "result"> = { toolName: name, citedEventIds: [] };

  try {
    switch (name) {
      case "events_search": {
        const params = new URLSearchParams();
        if (input.q) params.set("q", String(input.q));
        if (input.class) params.set("class", String(input.class));
        if (input.region_code) params.set("region", String(input.region_code));
        if (input.since) params.set("from", String(input.since));
        if (input.until) params.set("to", String(input.until));
        params.set("limit", String(Math.min(Number(input.limit ?? 10), 20)));
        const res = await fetch(`${baseUrl}/api/search?${params}`, { headers });
        const data = await res.json();
        const ids = (data.data ?? []).map((r: { event?: { event_id?: string } }) => r.event?.event_id).filter(Boolean);
        return { ...base, result: data, citedEventIds: ids };
      }

      case "map_filter": {
        return { ...base, result: { action: "map_filter", params: input } };
      }

      case "reports_generate": {
        const res = await fetch(`${baseUrl}/api/reports`, {
          method: "POST",
          headers,
          body: JSON.stringify({ ...input, isDraft: true }),
        });
        const data = await res.json();
        return { ...base, result: data };
      }

      case "alerts_create": {
        const res = await fetch(`${baseUrl}/api/alerts`, {
          method: "POST",
          headers,
          body: JSON.stringify(input),
        });
        const data = await res.json();
        return { ...base, result: data };
      }

      case "aoi_check": {
        const url = input.aoi_id
          ? `${baseUrl}/api/aois/${input.aoi_id}`
          : `${baseUrl}/api/aois`;
        const res = await fetch(url, { headers });
        const data = await res.json();
        return { ...base, result: data };
      }

      case "geo_lookup": {
        const params = new URLSearchParams({ q: String(input.place) });
        if (input.country) params.set("country", String(input.country));
        const res = await fetch(`${baseUrl}/api/geo/geocode?${params}`, { headers });
        const data = await res.json();
        return { ...base, result: data };
      }

      default:
        return { ...base, result: null, error: `Unknown tool: ${name}` };
    }
  } catch (err: unknown) {
    return { ...base, result: null, error: err instanceof Error ? err.message : String(err) };
  }
}
