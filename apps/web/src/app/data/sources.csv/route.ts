import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";

/**
 * Bulk download — public sources directory as CSV.
 * License: CC-BY-4.0.
 */
export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const header = [
    "slug",
    "name",
    "kind",
    "country",
    "language",
    "reliability",
    "homepageUrl",
    "description",
  ];
  const rows = PUBLIC_SOURCES.map((s) =>
    [
      s.slug,
      s.name,
      s.kind,
      s.country,
      s.language,
      s.reliability,
      s.homepageUrl,
      s.description,
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = [header.join(","), ...rows].join("\n") + "\n";
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'inline; filename="aegis-sources.csv"',
      "cache-control": "public, max-age=300, stale-while-revalidate=900",
      "access-control-allow-origin": "*",
    },
  });
}
