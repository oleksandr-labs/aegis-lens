export const dynamic = "force-static";

const AASA = {
  applinks: {
    apps: [],
    details: [],
  },
};

export async function GET() {
  return new Response(JSON.stringify(AASA), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
