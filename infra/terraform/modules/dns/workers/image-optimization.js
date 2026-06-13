/**
 * Cloudflare Worker — Image Optimization at Edge
 *
 * Intercepts image requests on *.aegislens.com and:
 *   1. Converts format to WebP / AVIF based on Accept header
 *   2. Resizes to requested dimensions (via ?w= / ?h= query params)
 *   3. Applies quality optimization (default q=80)
 *   4. Sets long-lived Cache-Control headers
 *   5. Adds security headers (no-sniff, etc.)
 *
 * Uses Cloudflare Image Resizing (available on Pro+ plans).
 * Falls back to origin image if resizing is unavailable.
 *
 * Supported query parameters:
 *   w=<pixels>     — resize to width (maintains aspect ratio)
 *   h=<pixels>     — resize to height (maintains aspect ratio)
 *   q=<1-100>      — JPEG/WebP quality (default: 80)
 *   fit=<mode>     — cover | contain | pad | scale-down (default: scale-down)
 *   f=<format>     — force output format: webp | avif | jpeg | png
 *
 * Maximum dimensions: 3840×2160 (4K) to prevent abuse.
 */

const MAX_WIDTH  = 3840;
const MAX_HEIGHT = 2160;
const DEFAULT_QUALITY = 80;

// Paths that are eligible for image optimization
const IMAGE_PATH_RE = /\.(jpe?g|png|gif|webp|avif|svg|bmp|tiff?)(\?.*)?$/i;
// Paths that should never be resized (icons, logos)
const SKIP_RESIZE_RE = /\/(favicon|icon|apple-touch|logo)[\w.-]*\.(png|ico|svg)$/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only optimize image paths
    if (!IMAGE_PATH_RE.test(url.pathname)) {
      return fetch(request);
    }

    // Skip resize for small UI assets
    if (SKIP_RESIZE_RE.test(url.pathname)) {
      return fetchWithCacheHeaders(request, 86400 * 30); // 30 days
    }

    // Determine best format from Accept header
    const accept = request.headers.get("Accept") ?? "";
    const supportsAvif = accept.includes("image/avif");
    const supportsWebp = accept.includes("image/webp");

    // Parse optimization params
    const w   = clamp(parseInt(url.searchParams.get("w") ?? "0"), 0, MAX_WIDTH);
    const h   = clamp(parseInt(url.searchParams.get("h") ?? "0"), 0, MAX_HEIGHT);
    const q   = clamp(parseInt(url.searchParams.get("q") ?? String(DEFAULT_QUALITY)), 1, 100);
    const fit = validateFit(url.searchParams.get("fit") ?? "scale-down");

    // Forced format override
    const forcedFormat = url.searchParams.get("f");

    let outputFormat;
    if (forcedFormat && ["webp", "avif", "jpeg", "png"].includes(forcedFormat)) {
      outputFormat = forcedFormat;
    } else if (supportsAvif && !url.pathname.endsWith(".gif")) {
      outputFormat = "avif";
    } else if (supportsWebp) {
      outputFormat = "webp";
    } else {
      outputFormat = null; // keep original format
    }

    // Build Cloudflare Image Resizing options
    const cfOptions = {
      image: {
        quality: q,
        fit,
        ...(w > 0 ? { width: w } : {}),
        ...(h > 0 ? { height: h } : {}),
        ...(outputFormat ? { format: outputFormat } : {}),
        // Sharpen slightly after downsizing
        sharpen: w > 0 || h > 0 ? 0.5 : 0,
        // Strip EXIF metadata for privacy
        metadata: "none",
      },
    };

    // Strip optimization query params before forwarding to origin
    const originUrl = new URL(request.url);
    originUrl.searchParams.delete("w");
    originUrl.searchParams.delete("h");
    originUrl.searchParams.delete("q");
    originUrl.searchParams.delete("fit");
    originUrl.searchParams.delete("f");

    try {
      const response = await fetch(
        new Request(originUrl.toString(), request),
        { cf: cfOptions }
      );

      if (!response.ok) {
        // Passthrough non-200 without modification
        return response;
      }

      // Add cache and security headers
      const headers = new Headers(response.headers);

      // Cache optimized images for 7 days; stale-while-revalidate 1 day
      headers.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
      headers.set("Vary", "Accept"); // Different formats for different clients

      // Security
      headers.set("X-Content-Type-Options", "nosniff");

      // Indicate format to client
      if (outputFormat) {
        headers.set("Content-Type", `image/${outputFormat}`);
      }

      // Optimization metadata header (for debugging)
      headers.set("X-Image-Opt", JSON.stringify({
        w: w || "auto",
        h: h || "auto",
        q,
        fmt: outputFormat ?? "original",
      }));

      return new Response(response.body, {
        status: response.status,
        headers,
      });
    } catch {
      // Image resizing unavailable (plan limit, etc.) — passthrough
      return fetchWithCacheHeaders(request, 3600);
    }
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function clamp(value, min, max) {
  if (isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function validateFit(fit) {
  const allowed = ["cover", "contain", "pad", "scale-down", "crop"];
  return allowed.includes(fit) ? fit : "scale-down";
}

async function fetchWithCacheHeaders(request, maxAgeSecs) {
  const response = await fetch(request);
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", `public, max-age=${maxAgeSecs}`);
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(response.body, { status: response.status, headers });
}
