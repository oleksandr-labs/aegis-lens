export const dynamic = "force-static";

const BODY = `/* TEAM */
Project: Aegis Lens
Contact: team [at] aegislens.io
Location: Distributed

/* THANKS */
Open-source maintainers, OSINT analysts, and the broader security research community.
Special thanks to contributors of verification methodologies and conflict-event datasets.

/* SITE */
Last update: 2026/05/24
Language: English / Ukrainian
Doctype: HTML5
Standards: HTML5, CSS3, ECMAScript 2024
Components: Next.js 15 (App Router), React 19, TypeScript (strict)
Software: Node.js, Vercel
`;

export async function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
