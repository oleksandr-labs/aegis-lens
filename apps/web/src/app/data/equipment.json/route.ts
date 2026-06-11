import { EQUIPMENT } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const body = {
    license: "CC-BY-4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    generatedAt: new Date().toISOString(),
    count: EQUIPMENT.length,
    items: EQUIPMENT,
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'inline; filename="aegis-equipment.json"',
      "cache-control": "public, max-age=900, stale-while-revalidate=3600",
      "access-control-allow-origin": "*",
    },
  });
}
