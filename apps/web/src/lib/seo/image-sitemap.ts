import type { AegisEvent } from "@aegis/types";
import { SITE } from "@/lib/site";

/**
 * Image sitemap XML builder (`<image:image>`).
 *
 * Surfaces verified event imagery so Google Images can discover it against the
 * canonical event permalink. Only `media.type === "image"` entries that are
 * not retracted are emitted, and only events that actually carry imagery
 * produce a `<url>`. Google caps images at 1,000 per page URL.
 */

const MAX_IMAGES_PER_URL = 1000;

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ImageEntry = { url: string; images: { loc: string; caption?: string }[] };

/** Extract indexable image entries from events (one per event with imagery). */
export function eventImageEntries(events: AegisEvent[]): ImageEntry[] {
  const out: ImageEntry[] = [];
  for (const ev of events) {
    const images = ev.media
      .filter((m) => m.type === "image" && m.verificationState !== "retracted")
      .slice(0, MAX_IMAGES_PER_URL)
      .map((m) => ({ loc: m.url, caption: ev.summary.en }));
    if (images.length === 0) continue;
    out.push({ url: `${SITE.url}/events/${ev.eventId}`, images });
  }
  return out;
}

/** Render an `<urlset>` image sitemap from prepared entries. */
export function renderImageSitemapXml(entries: ImageEntry[]): string {
  const body = entries
    .map((e) => {
      const imgs = e.images
        .map((img) => {
          const caption = img.caption
            ? `\n      <image:caption>${escXml(img.caption)}</image:caption>`
            : "";
          return `    <image:image>
      <image:loc>${escXml(img.loc)}</image:loc>${caption}
    </image:image>`;
        })
        .join("\n");
      return `  <url>
    <loc>${escXml(e.url)}</loc>
${imgs}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;
}

/** One-shot: events → image sitemap XML. */
export function buildImageSitemapXml(events: AegisEvent[]): string {
  return renderImageSitemapXml(eventImageEntries(events));
}
