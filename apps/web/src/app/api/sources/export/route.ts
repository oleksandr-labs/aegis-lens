import { NextResponse } from "next/server";
import { PUBLIC_SOURCES } from "@/lib/sources-public-seed";

export const dynamic = "force-static";

function toCsv(rows: typeof PUBLIC_SOURCES): string {
  const headers = ["slug", "name", "kind", "country", "language", "reliability", "homepage_url", "description"];
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((s) =>
      [s.slug, s.name, s.kind, s.country, s.language, s.reliability, s.homepageUrl, s.description]
        .map(escape)
        .join(","),
    ),
  ];
  return lines.join("\r\n");
}

export async function GET() {
  const csv = toCsv(PUBLIC_SOURCES);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="aegislens-sources.csv"',
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
