/**
 * GET /api/events/export?format=csv|geojson|kml
 *
 * Bulk export of events. Supports:
 *   - csv: RFC 4180, UTF-8 BOM, all flat fields
 *   - geojson: GeoJSON FeatureCollection (RFC 7946)
 *   - kml: KML 2.2 for Google Earth / Maps
 *
 * Applies the same filters as GET /api/events (class, since, hours, country).
 * Rate-limited separately (lower cap) to prevent abuse.
 */

import { NextResponse } from "next/server";
import { listEvents } from "@/lib/events-seed";
import { identifyRequest, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type ExportFormat = "csv" | "geojson" | "kml";

function escapeCsvField(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const CSV_HEADERS = [
  "eventId",
  "class",
  "subclass",
  "severity",
  "danger",
  "confidence",
  "verificationState",
  "lat",
  "lon",
  "country",
  "region",
  "occurredAt",
  "ingestedAt",
  "summaryEn",
  "sourceUrl",
];

export async function GET(req: Request) {
  const ip = identifyRequest(req);
  const rl = rateLimit(`events:export:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const format = (url.searchParams.get("format") ?? "csv") as ExportFormat;

  if (!["csv", "geojson", "kml"].includes(format)) {
    return new Response(JSON.stringify({ error: "format must be csv, geojson, or kml" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let events = listEvents();

  // Apply filters (same as /api/events)
  const sinceRaw = url.searchParams.get("since");
  const hoursRaw = url.searchParams.get("hours");
  const classFilter = url.searchParams.getAll("class");

  if (sinceRaw) {
    const sinceMs = Date.parse(sinceRaw);
    if (Number.isFinite(sinceMs)) events = events.filter((e) => Date.parse(e.occurredAt) >= sinceMs);
  } else if (hoursRaw) {
    const hours = Number(hoursRaw);
    if (Number.isFinite(hours) && hours > 0) {
      const cutoff = Date.now() - hours * 3600_000;
      events = events.filter((e) => Date.parse(e.occurredAt) >= cutoff);
    }
  }

  if (classFilter.length > 0) {
    events = events.filter((e) => classFilter.includes(e.class));
  }

  // Max 5000 rows per export
  events = events.slice(0, 5000);

  if (format === "csv") {
    const rows: string[] = [
      "﻿" + CSV_HEADERS.join(","), // UTF-8 BOM for Excel compat
      ...events.map((e) =>
        [
          e.eventId,
          e.class,
          e.subclass ?? "",
          e.severity,
          e.danger,
          e.confidence,
          e.verificationState,
          e.location?.lat ?? "",
          e.location?.lon ?? "",
          e.location?.country ?? "",
          e.location?.region ?? "",
          e.occurredAt,
          e.ingestedAt ?? "",
          e.summary ?? "",
          e.sourceUrls?.[0] ?? "",
        ]
          .map(escapeCsvField)
          .join(","),
      ),
    ];

    return new Response(rows.join("\r\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="aegis-events-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // KML export
  if (format === "kml") {
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const placemarks = events
      .filter((e) => e.location?.lat != null && e.location?.lon != null)
      .map((e) => `  <Placemark>
    <name>${esc(e.class)}${e.subclass ? ` / ${esc(e.subclass)}` : ""}</name>
    <description><![CDATA[<b>${esc(e.summary ?? "")}</b><br/>ID: ${e.eventId}<br/>Severity: ${e.severity}/5<br/>Confidence: ${Math.round(e.confidence * 100)}%<br/>Date: ${e.occurredAt.slice(0, 10)}]]></description>
    <ExtendedData>
      <Data name="eventId"><value>${e.eventId}</value></Data>
      <Data name="class"><value>${esc(e.class)}</value></Data>
      <Data name="severity"><value>${e.severity}</value></Data>
      <Data name="confidence"><value>${e.confidence}</value></Data>
      <Data name="occurredAt"><value>${e.occurredAt}</value></Data>
    </ExtendedData>
    <Point><coordinates>${e.location!.lon},${e.location!.lat},0</coordinates></Point>
  </Placemark>`).join("\n");

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>AegisLens Events Export</name>
  <description>Exported ${events.length} events on ${new Date().toISOString().slice(0, 10)}</description>
${placemarks}
</Document>
</kml>`;

    return new Response(kml, {
      headers: {
        "Content-Type": "application/vnd.google-earth.kml+xml",
        "Content-Disposition": `attachment; filename="aegis-events-${new Date().toISOString().slice(0, 10)}.kml"`,
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // GeoJSON FeatureCollection
  const features = events
    .filter((e) => e.location?.lat != null && e.location?.lon != null)
    .map((e) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [e.location!.lon, e.location!.lat],
      },
      properties: {
        eventId: e.eventId,
        class: e.class,
        subclass: e.subclass ?? null,
        severity: e.severity,
        danger: e.danger,
        confidence: e.confidence,
        verificationState: e.verificationState,
        country: e.location?.country ?? null,
        region: e.location?.region ?? null,
        occurredAt: e.occurredAt,
        summary: e.summary ?? null,
      },
    }));

  const geojson = {
    type: "FeatureCollection",
    features,
    metadata: {
      count: features.length,
      exportedAt: new Date().toISOString(),
      source: "AegisLens",
    },
  };

  return new Response(JSON.stringify(geojson, null, 2), {
    headers: {
      "Content-Type": "application/geo+json",
      "Content-Disposition": `attachment; filename="aegis-events-${new Date().toISOString().slice(0, 10)}.geojson"`,
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
