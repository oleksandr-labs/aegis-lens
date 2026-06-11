import { BLOG_POSTS } from "@/lib/blog-seed";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  const feedUrl = `${SITE.url}/blog/feed.xml`;
  const blogUrl = `${SITE.url}/blog`;

  const lastBuild = sorted[0]?.publishedAt
    ? new Date(sorted[0].publishedAt).toUTCString()
    : new Date().toUTCString();

  const items = sorted
    .slice(0, 30)
    .map((p) => {
      const postUrl = `${SITE.url}/blog/${p.slug}`;
      const pubDate = new Date(p.publishedAt).toUTCString();
      const cats = p.tags.map((t) => `    <category>${escape(t)}</category>`).join("\n");
      return `  <item>
    <title>${escape(p.title)}</title>
    <link>${escape(postUrl)}</link>
    <guid isPermaLink="true">${escape(postUrl)}</guid>
    <description>${escape(p.excerpt)}</description>
    <pubDate>${pubDate}</pubDate>
    <author>${escape(p.author)}</author>
${cats}
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(SITE.name)} — Intelligence Briefs</title>
    <link>${escape(blogUrl)}</link>
    <description>${escape("OSINT intelligence briefs, methodology notes, and deep-dive analyses from Aegis Lens.")}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escape(feedUrl)}" rel="self" type="application/rss+xml"/>
    <managingEditor>desk@aegislens.io (Aegis Lens)</managingEditor>
    <image>
      <url>${escape(SITE.url)}/brand/aegis-logo.svg</url>
      <title>${escape(SITE.name)}</title>
      <link>${escape(blogUrl)}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
