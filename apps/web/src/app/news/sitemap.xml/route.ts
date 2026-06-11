import { eventsInCountry } from "@/lib/events-seed";
import type { AegisEvent } from "@aegis/types";

export const dynamic = "force-dynamic";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const events = eventsInCountry("ua")
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
    .slice(0, 50);

  const items = events
    .map(
      (ev: AegisEvent) => `
  <url>
    <loc>https://aegislens.io/events/${ev.eventId}</loc>
    <news:news>
      <news:publication>
        <news:name>Aegis Lens Intelligence</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${ev.occurredAt}</news:publication_date>
      <news:title>${escapeXml(ev.summary.en)}</news:title>
      <news:keywords>${escapeXml(
        [ev.class, ev.subclass ?? "", "osint", "ukraine"]
          .filter(Boolean)
          .join(", "),
      )}</news:keywords>
    </news:news>
    <lastmod>${ev.occurredAt}</lastmod>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
