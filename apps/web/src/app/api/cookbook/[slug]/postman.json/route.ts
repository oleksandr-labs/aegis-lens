import { getRecipe, RECIPES } from "@/lib/cookbook-seed";
import { SITE } from "@/lib/site";

/**
 * Per-recipe Postman v2.1 collection. Extracts the first curl-style snippet
 * from the recipe and turns it into a single-request collection. If no curl
 * snippet is present, emits a placeholder pointing the user at the recipe.
 *
 * Useful for "Run in Postman / Bruno / Insomnia" buttons next to each recipe.
 */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ slug: r.slug }));
}

/** Parse the simplest possible `curl 'URL' -H 'k: v'` snippet. */
function parseCurl(code: string): { method: string; url: string; headers: { k: string; v: string }[] } | null {
  // Normalize line continuations.
  const flat = code.replace(/\\\s*\n/g, " ").replace(/\s+/g, " ").trim();
  // Strip leading "curl " (and -X METHOD if present).
  if (!flat.startsWith("curl")) return null;
  const tail = flat.slice(4).trim();
  let method = "GET";
  const xMatch = tail.match(/^-X\s+([A-Z]+)\s+/);
  let rest = tail;
  if (xMatch) {
    method = xMatch[1];
    rest = tail.slice(xMatch[0].length);
  }
  // URL is the first quoted token (single or double) or the first bare word.
  const urlMatch = rest.match(/^(?:'([^']+)'|"([^"]+)"|(\S+))/);
  if (!urlMatch) return null;
  const url = urlMatch[1] ?? urlMatch[2] ?? urlMatch[3];
  // Headers — every -H 'k: v'.
  const headers: { k: string; v: string }[] = [];
  const headerRe = /-H\s+(?:'([^']+)'|"([^"]+)")/g;
  let h: RegExpExecArray | null;
  while ((h = headerRe.exec(rest)) !== null) {
    const raw = h[1] ?? h[2] ?? "";
    const idx = raw.indexOf(":");
    if (idx > 0) headers.push({ k: raw.slice(0, idx).trim(), v: raw.slice(idx + 1).trim() });
  }
  return { method, url, headers };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const r = getRecipe(slug);
  if (!r) {
    return new Response(JSON.stringify({ error: "recipe_not_found" }), {
      status: 404,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const curlSnippet = r.snippets.find((s) => s.language === "curl");
  const parsed = curlSnippet ? parseCurl(curlSnippet.code) : null;

  // Compute request — fall back to a GET on the cookbook recipe URL when no curl.
  const reqUrl =
    parsed?.url ?? `${SITE.url}/cookbook/${r.slug}`;
  const reqMethod = parsed?.method ?? "GET";
  const headers = parsed?.headers ?? [
    { k: "Accept", v: "application/json" },
  ];

  // Replace any hard-coded https://aegislens.io with {{base_url}} for portability.
  const portableUrl = reqUrl.replace(/^https?:\/\/aegislens\.io/, "{{base_url}}");
  const urlParts = portableUrl.match(/^([^?]*)(\?.*)?$/);
  const rawPath = urlParts?.[1] ?? portableUrl;
  const rawQuery = urlParts?.[2] ?? "";
  const queryItems = rawQuery
    .slice(1)
    .split("&")
    .filter(Boolean)
    .map((pair) => {
      const eq = pair.indexOf("=");
      const key = eq >= 0 ? pair.slice(0, eq) : pair;
      const val = eq >= 0 ? pair.slice(eq + 1) : "";
      return { key, value: val };
    });

  const collection = {
    info: {
      name: `Aegis Lens — ${r.title}`,
      description: r.goal,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    variable: [
      { key: "base_url", value: "https://aegislens.io" },
    ],
    item: [
      {
        name: r.title,
        request: {
          method: reqMethod,
          header: headers.map((h) => ({
            key: h.k,
            value: h.v,
          })),
          url: {
            raw: portableUrl,
            host: ["{{base_url}}"],
            path: rawPath
              .replace(/^https?:\/\/[^/]+/, "")
              .replace(/^{{base_url}}/, "")
              .split("/")
              .filter(Boolean),
            query: queryItems,
          },
          description: r.steps.join("\n\n"),
        },
      },
    ],
  };

  return new Response(JSON.stringify(collection, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `inline; filename="aegis-recipe-${r.slug}.postman.json"`,
      "cache-control": "public, max-age=900, stale-while-revalidate=3600",
      "access-control-allow-origin": "*",
    },
  });
}
