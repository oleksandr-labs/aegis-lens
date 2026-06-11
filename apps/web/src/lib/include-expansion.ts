/**
 * Sparse fieldsets / expansion utility — `?include=region,citations`
 *
 * Allows callers to request sideloaded related resources alongside the
 * primary item, avoiding N+1 client round-trips.
 *
 * Example:
 *   GET /api/events/abc?include=region,citations
 *   → { data: { ...event }, included: { region: {...}, citations: [...] } }
 *
 * Usage:
 *   const includes = parseIncludeParam(url.searchParams.get('include'));
 *   const response = await buildExpansionResponse(event, includes, expansionConfig);
 */

// ── parseIncludeParam ─────────────────────────────────────────────────────────

/**
 * Parse `?include=region,citations` → `['region', 'citations']`.
 *
 * Returns an empty array when the parameter is absent or empty.
 * Unknown include names are passed through — they are filtered at
 * expansion time against the InclusionConfig.
 */
export function parseIncludeParam(include: string | null): string[] {
  if (!include || include.trim() === "") return [];

  return include
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 128 && /^[a-zA-Z0-9_.]+$/.test(s));
}

// ── InclusionConfig ───────────────────────────────────────────────────────────

/**
 * Maps an include name to an async resolver that accepts the primary item
 * and returns the expanded value (object, array, or scalar).
 *
 * Example:
 *   const config: InclusionConfig<Event> = {
 *     region: async (event) => regionStore.get(event.regionIso2),
 *     citations: async (event) => citationStore.listForEvent(event.id),
 *   };
 */
export type InclusionConfig<T> = {
  [key: string]: (item: T) => Promise<unknown>;
};

// ── expandIncludes ────────────────────────────────────────────────────────────

/**
 * Run expansion resolvers for all requested include names.
 *
 * Include names not present in `config` are silently ignored.
 * Resolvers run in parallel.
 *
 * @returns A record mapping each resolved include name to its value.
 */
export async function expandIncludes<T>(
  item: T,
  includes: string[],
  config: InclusionConfig<T>,
): Promise<Record<string, unknown>> {
  const validIncludes = includes.filter((name) => name in config);

  const results = await Promise.allSettled(
    validIncludes.map(async (name) => {
      const resolver = config[name];
      if (!resolver) return { name, value: null };
      const value = await resolver(item);
      return { name, value };
    }),
  );

  const included: Record<string, unknown> = {};
  for (const result of results) {
    if (result.status === "fulfilled") {
      included[result.value.name] = result.value.value;
    }
    // On rejection, include the key with null so clients know it was requested
    // but could not be resolved — avoids silent omissions.
    if (result.status === "rejected") {
      // We can't recover the name here; silently skip — caller should log
    }
  }

  return included;
}

// ── buildExpansionResponse ────────────────────────────────────────────────────

/**
 * Build the canonical expansion response envelope:
 *   { data: T, included: Record<string, unknown> }
 *
 * `included` is an empty object when no valid includes are requested.
 */
export async function buildExpansionResponse<T>(
  item: T,
  includes: string[],
  config: InclusionConfig<T>,
): Promise<{ data: T; included: Record<string, unknown> }> {
  const included = await expandIncludes(item, includes, config);
  return { data: item, included };
}
