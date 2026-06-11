import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@aegis/types", "@aegis/url-builder", "@aegis/i18n-config", "@ua-map/layers", "@ua-map/travel-risk", "@ua-map/civilian-alerts"],
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "tile.openstreetmap.org" },
      { protocol: "https", hostname: "**.sentinel-hub.com" },
      { protocol: "https", hostname: "**.copernicus.eu" },
    ],
    minimumCacheTTL: 3600,
  },

  // Brotli / gzip compression
  compress: true,

  // Experimental: tree-shake heavy packages
  experimental: {
    optimizePackageImports: ["maplibre-gl", "supercluster"],
  },

  async headers() {
    return [
      // Global security headers
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // API routes: never cache
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      // Static assets: long-lived immutable cache
      {
        source: "/(favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp|.*\\.avif)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default config;
