export const dynamic = "force-static";

const BODY = `Contact: mailto:security@aegislens.io
Expires: 2027-01-01T00:00:00.000Z
Preferred-Languages: en, uk
Canonical: https://aegislens.io/.well-known/security.txt
Policy: https://aegislens.io/security
Acknowledgments: https://aegislens.io/security#hall-of-fame
`;

export async function GET() {
  return new Response(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
