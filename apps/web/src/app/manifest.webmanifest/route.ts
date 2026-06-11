export const dynamic = "force-static";

const MANIFEST = {
  name: "Aegis Lens",
  short_name: "Aegis",
  description: "Verified conflict and security event intelligence",
  start_url: "/map",
  display: "standalone",
  orientation: "any",
  background_color: "#0a0a0f",
  theme_color: "#0a0a0f",
  lang: "en",
  categories: ["news", "reference"],
  icons: [
    {
      src: "/icons/192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: "/icons/512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
  shortcuts: [
    {
      name: "Live Map",
      short_name: "Map",
      description: "Open the live conflict map",
      url: "/map",
      icons: [{ src: "/icons/192.png", sizes: "192x192", type: "image/png" }],
    },
    {
      name: "Alerts",
      short_name: "Alerts",
      description: "View active alerts and notifications",
      url: "/alerts",
      icons: [{ src: "/icons/192.png", sizes: "192x192", type: "image/png" }],
    },
    {
      name: "Dashboard",
      short_name: "Dashboard",
      description: "Open the analytics dashboard",
      url: "/dashboard",
      icons: [{ src: "/icons/192.png", sizes: "192x192", type: "image/png" }],
    },
    {
      name: "Investigations",
      short_name: "Investigate",
      description: "Browse open investigations",
      url: "/investigations",
      icons: [{ src: "/icons/192.png", sizes: "192x192", type: "image/png" }],
    },
  ],
};

export async function GET() {
  return new Response(JSON.stringify(MANIFEST, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
