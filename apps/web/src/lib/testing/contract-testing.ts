/**
 * API contract definitions for Aegis Lens.
 * Used by Pact / OpenAPI diff tooling to validate API surface.
 */

export interface ApiContract {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  schemaVersion: string;
  requestSchema?: object;
  responseSchema?: object;
  statusCodes: number[];
  examples: object[];
}

export const API_CONTRACTS: ApiContract[] = [
  {
    endpoint: "/api/v1/events",
    method: "GET",
    schemaVersion: "1.0.0",
    requestSchema: {
      type: "object",
      properties: {
        region: { type: "string" },
        from: { type: "string", format: "date-time" },
        to: { type: "string", format: "date-time" },
        severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
        limit: { type: "integer", minimum: 1, maximum: 500 },
        cursor: { type: "string" },
      },
    },
    responseSchema: {
      type: "object",
      required: ["data", "meta"],
      properties: {
        data: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "lat", "lng", "severity", "timestamp", "title_en"],
            properties: {
              id: { type: "string" },
              lat: { type: "number" },
              lng: { type: "number" },
              severity: { type: "string" },
              timestamp: { type: "string", format: "date-time" },
              title_en: { type: "string" },
              title_uk: { type: "string" },
            },
          },
        },
        meta: {
          type: "object",
          properties: {
            total: { type: "integer" },
            cursor: { type: "string" },
          },
        },
      },
    },
    statusCodes: [200, 400, 401, 403, 429],
    examples: [
      {
        request: { region: "UA-43", limit: 10 },
        response: {
          data: [
            {
              id: "evt_01HX",
              lat: 47.84,
              lng: 35.14,
              severity: "high",
              timestamp: "2024-06-10T12:00:00Z",
              title_en: "Shelling reported near Kherson",
              title_uk: "Повідомлення про обстріл біля Херсона",
            },
          ],
          meta: { total: 1, cursor: null },
        },
      },
    ],
  },
  {
    endpoint: "/api/v1/search",
    method: "GET",
    schemaVersion: "1.0.0",
    requestSchema: {
      type: "object",
      required: ["q"],
      properties: {
        q: { type: "string", minLength: 2, maxLength: 500 },
        locale: { type: "string", enum: ["en", "uk"] },
        limit: { type: "integer", minimum: 1, maximum: 50 },
      },
    },
    responseSchema: {
      type: "object",
      required: ["results"],
      properties: {
        results: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "type", "title_en", "score"],
            properties: {
              id: { type: "string" },
              type: { type: "string", enum: ["event", "region", "actor"] },
              title_en: { type: "string" },
              score: { type: "number" },
            },
          },
        },
      },
    },
    statusCodes: [200, 400, 401, 429],
    examples: [
      {
        request: { q: "Mariupol", locale: "en" },
        response: {
          results: [
            { id: "reg_mariupol", type: "region", title_en: "Mariupol", score: 0.98 },
          ],
        },
      },
    ],
  },
  {
    endpoint: "/api/v1/pricing/tiers",
    method: "GET",
    schemaVersion: "1.0.0",
    responseSchema: {
      type: "object",
      required: ["tiers"],
      properties: {
        tiers: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "name_en", "priceMonthlyUsd", "features"],
            properties: {
              id: { type: "string" },
              name_en: { type: "string" },
              priceMonthlyUsd: { type: "number" },
              features: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
    statusCodes: [200],
    examples: [
      {
        response: {
          tiers: [
            {
              id: "free",
              name_en: "Free",
              priceMonthlyUsd: 0,
              features: ["Live map", "Basic filters", "7-day history"],
            },
          ],
        },
      },
    ],
  },
  {
    endpoint: "/api/v1/addons",
    method: "GET",
    schemaVersion: "1.0.0",
    responseSchema: {
      type: "object",
      required: ["addons"],
      properties: {
        addons: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "name_en", "priceMonthlyUsd"],
            properties: {
              id: { type: "string" },
              name_en: { type: "string" },
              priceMonthlyUsd: { type: "number" },
            },
          },
        },
      },
    },
    statusCodes: [200, 401],
    examples: [],
  },
  {
    endpoint: "/api/v1/risk/location",
    method: "POST",
    schemaVersion: "1.0.0",
    requestSchema: {
      type: "object",
      required: ["lat", "lng"],
      properties: {
        lat: { type: "number", minimum: -90, maximum: 90 },
        lng: { type: "number", minimum: -180, maximum: 180 },
        radiusKm: { type: "number", minimum: 0.1, maximum: 500 },
      },
    },
    responseSchema: {
      type: "object",
      required: ["score", "level", "factors"],
      properties: {
        score: { type: "number", minimum: 0, maximum: 100 },
        level: { type: "string", enum: ["low", "medium", "high", "critical"] },
        factors: { type: "array", items: { type: "string" } },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    statusCodes: [200, 400, 401, 403, 429],
    examples: [
      {
        request: { lat: 47.84, lng: 35.14, radiusKm: 10 },
        response: {
          score: 72,
          level: "high",
          factors: ["Recent shelling events", "Active front proximity"],
          updatedAt: "2024-06-10T12:00:00Z",
        },
      },
    ],
  },
  {
    endpoint: "/api/v1/passes",
    method: "GET",
    schemaVersion: "1.0.0",
    responseSchema: {
      type: "object",
      required: ["passes"],
      properties: {
        passes: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "type", "expiresAt", "status"],
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              expiresAt: { type: "string", format: "date-time" },
              status: { type: "string", enum: ["active", "expired", "revoked"] },
            },
          },
        },
      },
    },
    statusCodes: [200, 401],
    examples: [],
  },
  {
    endpoint: "/api/v1/grants/apply",
    method: "POST",
    schemaVersion: "1.0.0",
    requestSchema: {
      type: "object",
      required: ["grantType", "organizationName", "contactEmail", "useCase_en"],
      properties: {
        grantType: {
          type: "string",
          enum: ["ngo", "journalist", "researcher", "humanitarian"],
        },
        organizationName: { type: "string" },
        contactEmail: { type: "string", format: "email" },
        useCase_en: { type: "string", minLength: 50 },
        websiteUrl: { type: "string", format: "uri" },
      },
    },
    responseSchema: {
      type: "object",
      required: ["applicationId", "status"],
      properties: {
        applicationId: { type: "string" },
        status: { type: "string", enum: ["submitted", "under_review", "approved", "rejected"] },
      },
    },
    statusCodes: [201, 400, 409, 429],
    examples: [],
  },
  {
    endpoint: "/api/scim/v2/Users",
    method: "GET",
    schemaVersion: "2.0",
    requestSchema: {
      type: "object",
      properties: {
        filter: { type: "string" },
        startIndex: { type: "integer", minimum: 1 },
        count: { type: "integer", minimum: 1, maximum: 100 },
      },
    },
    responseSchema: {
      type: "object",
      required: ["schemas", "totalResults", "Resources"],
      properties: {
        schemas: { type: "array", items: { type: "string" } },
        totalResults: { type: "integer" },
        startIndex: { type: "integer" },
        itemsPerPage: { type: "integer" },
        Resources: { type: "array" },
      },
    },
    statusCodes: [200, 400, 401, 403],
    examples: [],
  },
];

/**
 * Validates an API response object against a contract's response schema.
 * Uses structural checks (no external validator dependency for build safety).
 */
export function validateContractResponse(
  contract: ApiContract,
  response: unknown
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (response === null || response === undefined) {
    errors.push("Response is null or undefined");
    return { valid: false, errors };
  }

  const schema = contract.responseSchema;
  if (!schema) {
    // No schema defined — pass through
    return { valid: true, errors };
  }

  const schemaObj = schema as {
    required?: string[];
    properties?: Record<string, unknown>;
    type?: string;
  };

  if (schemaObj.type === "object" && typeof response !== "object") {
    errors.push(`Expected object, got ${typeof response}`);
    return { valid: false, errors };
  }

  const required = schemaObj.required ?? [];
  const responseObj = response as Record<string, unknown>;

  for (const field of required) {
    if (!(field in responseObj)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
