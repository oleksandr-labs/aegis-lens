import { listEvents } from "@/lib/events-seed";

/**
 * Bulk download — verified events corpus.
 * License: CC-BY-4.0 (see /trust/data-policy).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const events = listEvents();
  const body = {
    license: "CC-BY-4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    generatedAt: new Date().toISOString(),
    count: events.length,
    items: events,
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'inline; filename="aegis-events.json"',
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
      "access-control-allow-origin": "*",
    },
  });
}
