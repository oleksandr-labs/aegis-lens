import { NextResponse } from "next/server";
import { listRegions } from "@/lib/regions-seed";
import { listOblasts } from "@/lib/oblasts-seed";
import { identifyRequest, rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const COUNTRIES = ["ua", "pl", "de"] as const;
type Country = (typeof COUNTRIES)[number];

export async function GET(req: Request) {
  const ipKey = `regions:${identifyRequest(req)}`;
  const rl = rateLimit(ipKey, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests." },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rl),
          "Retry-After": String(rl.resetSeconds),
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }

  const url = new URL(req.url);
  const countryParam = url.searchParams.get("country");
  const country =
    countryParam && (COUNTRIES as readonly string[]).includes(countryParam.toLowerCase())
      ? (countryParam.toLowerCase() as Country)
      : null;

  const regions = listRegions();
  const countries: Country[] = country ? [country] : (COUNTRIES as readonly Country[]).slice();

  const data = countries.flatMap((iso2) => {
    const region = regions.find((r) => r.iso2 === iso2);
    const regionName = region?.name.en ?? iso2.toUpperCase();
    return listOblasts(iso2).map((o) => ({
      country: iso2,
      countryName: regionName,
      oblast: o.kindLabel,
      slug: o.slug,
      name: o.name.en,
      capital: o.capital,
      bbox: o.bbox,
    }));
  });

  return NextResponse.json(
    { data },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
        ...rateLimitHeaders(rl),
      },
    },
  );
}
