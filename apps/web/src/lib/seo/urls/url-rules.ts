/**
 * URL anti-pattern rules — lint and auto-fix utilities.
 *
 * Covers all anti-patterns from TODO/urls_slugs/TODO_url_anti_patterns.md.
 * Designed for CI linting and PR-time slug review.
 *
 * Usage:
 *   const result = checkUrl("/Events/Ukraine?session=abc123");
 *   if (!result.valid) console.error(result.violations);
 *
 *   const clean = normalizeUrl("/Events/Ukraine/");
 *   // → "/events/ukraine"
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UrlAntiPattern {
  /** Unique identifier for the rule (used in CI output) */
  id: string;
  /** Regex or description of the pattern to detect */
  pattern: string;
  /** Human-readable explanation */
  description_en: string;
  /** Error blocks the URL; warning is advisory */
  severity: "error" | "warning";
  /** A bad URL example */
  example_bad: string;
  /** The corrected URL example */
  example_good: string;
  /** Whether normalizeUrl() can fix this automatically */
  autoFixable: boolean;
  /** The actual detection function */
  detect: (url: string) => boolean;
}

// ── Anti-pattern rules ────────────────────────────────────────────────────────

/**
 * All ~20 anti-patterns from the URL TODO file.
 * Each rule has a `detect` function for programmatic checking.
 */
export const URL_ANTI_PATTERNS: UrlAntiPattern[] = [
  {
    id: "query-primary-content",
    pattern: "?<key>=<primary-content-id>",
    description_en:
      "Query parameters must not carry primary content identifiers. Primary content must live in the path.",
    severity: "error",
    example_bad: "/events?id=kyiv-attack-2024-06",
    example_good: "/events/kyiv-attack-2024-06",
    autoFixable: false,
    detect: (url) => {
      // Heuristic: URL has a query param that looks like a primary content ID
      // (not a filter/search param). Flags ?id=, ?slug=, ?page_id=, ?post=
      const searchParams = extractSearchParams(url);
      return ["id", "slug", "page_id", "post", "article", "event"].some((k) =>
        searchParams.has(k),
      );
    },
  },
  {
    id: "session-id-in-url",
    pattern: "?sessionid= | ?PHPSESSID= | ?sid=",
    description_en: "Session IDs in URLs create millions of duplicate URLs.",
    severity: "error",
    example_bad: "/events?sessionid=abc123def456",
    example_good: "/events",
    autoFixable: true,
    detect: (url) => {
      const searchParams = extractSearchParams(url);
      return ["sessionid", "phpsessid", "sid", "session", "jsessionid"].some((k) =>
        searchParams.has(k.toLowerCase()),
      );
    },
  },
  {
    id: "utm-in-canonical",
    pattern: "?utm_source= | ?utm_medium= | ?utm_campaign=",
    description_en:
      "UTM tracking parameters must be stripped from canonical URLs. They cause duplicate-content issues.",
    severity: "error",
    example_bad: "/events/kyiv?utm_source=twitter&utm_medium=social",
    example_good: "/events/kyiv",
    autoFixable: true,
    detect: (url) => {
      const searchParams = extractSearchParams(url);
      return [...searchParams.keys()].some((k) => k.startsWith("utm_"));
    },
  },
  {
    id: "underscores-in-path",
    pattern: "/path_with_underscores/",
    description_en:
      "Use hyphens (-) not underscores (_) as word separators in URL paths. Google treats underscores as word joiners.",
    severity: "error",
    example_bad: "/region_pages/kharkiv_oblast",
    example_good: "/region-pages/kharkiv-oblast",
    autoFixable: true,
    detect: (url) => extractPath(url).includes("_"),
  },
  {
    id: "camelcase-path",
    pattern: "/camelCasePath or /CamelCase",
    description_en:
      "URL paths must be lowercase. camelCase and PascalCase create mixed-case duplicates.",
    severity: "error",
    example_bad: "/RegionPages/KharkivOblast",
    example_good: "/region-pages/kharkiv-oblast",
    autoFixable: true,
    detect: (url) => extractPath(url) !== extractPath(url).toLowerCase(),
  },
  {
    id: "mixed-case-duplicate",
    pattern: "/Companies and /companies simultaneously",
    description_en:
      "Mixed-case variants of the same path (e.g. /Events and /events) create duplicate pages.",
    severity: "error",
    example_bad: "/Events/Kyiv (when /events/kyiv already exists)",
    example_good: "/events/kyiv (always lowercase)",
    autoFixable: true,
    detect: (url) => {
      const path = extractPath(url);
      return path !== path.toLowerCase();
    },
  },
  {
    id: "trailing-slash-inconsistency",
    pattern: "/path/ (trailing slash on non-root)",
    description_en:
      "Trailing slashes on non-root paths create duplicate URLs. Policy: no trailing slash except bare /.",
    severity: "error",
    example_bad: "/events/kyiv/",
    example_good: "/events/kyiv",
    autoFixable: true,
    detect: (url) => {
      const path = extractPath(url);
      return path.length > 1 && path.endsWith("/");
    },
  },
  {
    id: "url-encoded-special-chars",
    pattern: "%20 or %2F etc. beyond Unicode normalisation",
    description_en:
      "URL-encoded characters beyond standard Unicode normalisation signal poorly-structured slugs. Use hyphens.",
    severity: "warning",
    example_bad: "/events/kyiv%20attack%202024",
    example_good: "/events/kyiv-attack-2024",
    autoFixable: true,
    detect: (url) =>
      /%[0-9A-Fa-f]{2}/.test(extractPath(url)) &&
      !/%[89A-Fa-f][0-9A-Fa-f]/.test(extractPath(url)), // non-ASCII unicode is OK
  },
  {
    id: "file-extension-in-url",
    pattern: ".html | .php | .aspx | .jsp in path",
    description_en:
      "File extensions (.html, .php, .aspx) in URLs expose implementation details and fragment link equity.",
    severity: "error",
    example_bad: "/events/kyiv.html",
    example_good: "/events/kyiv",
    autoFixable: true,
    detect: (url) => /\.(html|php|aspx|jsp|htm|cfm|cgi|asp)$/i.test(extractPath(url)),
  },
  {
    id: "stop-word-stuffing",
    pattern: "the-best-of-the-best-tools-for-the-osint",
    description_en:
      "Stop-word stuffing in slugs (the, a, of, for, to, in) wastes URL real estate and dilutes keywords.",
    severity: "warning",
    example_bad: "/the-best-of-the-best-tools-for-the-osint-analyst",
    example_good: "/best-osint-tools-analysts",
    autoFixable: false,
    detect: (url) => {
      const path = extractPath(url);
      const segments = path.split("/").filter(Boolean);
      for (const seg of segments) {
        const words = seg.split("-");
        const stopCount = words.filter((w) => STOP_WORDS_CHECK.has(w.toLowerCase())).length;
        if (stopCount >= 3) return true;
      }
      return false;
    },
  },
  {
    id: "keyword-stuffing-in-slug",
    pattern: "osint-tool-osint-tools-osint-platform",
    description_en:
      "Repeating the same keyword stem in a single slug segment is keyword stuffing and may be penalised.",
    severity: "warning",
    example_bad: "/osint-tool-osint-tools-osint-platform",
    example_good: "/osint-platform",
    autoFixable: false,
    detect: (url) => {
      const path = extractPath(url);
      const segments = path.split("/").filter(Boolean);
      for (const seg of segments) {
        const words = seg.split("-").filter(Boolean);
        const counts = new Map<string, number>();
        for (const w of words) {
          const stem = w.toLowerCase().replace(/s$/, ""); // naive stemming
          counts.set(stem, (counts.get(stem) ?? 0) + 1);
        }
        if ([...counts.values()].some((n) => n >= 3)) return true;
      }
      return false;
    },
  },
  {
    id: "deep-nesting",
    pattern: "more than 5 path segments",
    description_en:
      "Deep URL nesting (>5 segments) reduces crawl priority and confuses users about site structure.",
    severity: "warning",
    example_bad: "/regions/ua/oblasts/kharkiv/cities/kharkiv/events",
    example_good: "/events/kharkiv-oblast",
    autoFixable: false,
    detect: (url) => extractPath(url).split("/").filter(Boolean).length > 5,
  },
  {
    id: "date-in-slug",
    pattern: "/2024/06/10/event-title (date segments in path)",
    description_en:
      "Date segments in slugs lock content to a time period and break link equity as events evolve. Use dates in query params for archives only.",
    severity: "warning",
    example_bad: "/events/2024/06/10/kyiv-attack",
    example_good: "/events/kyiv-attack-june-2024",
    autoFixable: false,
    detect: (url) => {
      // Detect ISO date segments: /YYYY/MM/DD or /YYYY-MM-DD in path
      return /\/\d{4}\/\d{2}(\/\d{2})?/.test(extractPath(url));
    },
  },
  {
    id: "version-in-url",
    pattern: "/v2/... or /v1.2/...",
    description_en:
      "Version prefixes in user-facing URLs create permanent orphans when you rev the API or design.",
    severity: "error",
    example_bad: "/v2/events/kyiv",
    example_good: "/events/kyiv",
    autoFixable: false,
    detect: (url) => /\/v\d+(\.\d+)?\//i.test(extractPath(url)),
  },
  {
    id: "internal-id-in-url",
    pattern: "/events/12345 (numeric database ID)",
    description_en:
      "Exposing internal database IDs in URLs leaks implementation details and creates non-human-readable links.",
    severity: "warning",
    example_bad: "/events/382917",
    example_good: "/events/kyiv-attack-2024-06-10",
    autoFixable: false,
    detect: (url) => {
      const segments = extractPath(url).split("/").filter(Boolean);
      // Flags segments that are purely numeric (>4 digits)
      return segments.some((s) => /^\d{5,}$/.test(s));
    },
  },
  {
    id: "slug-language-mismatch",
    pattern: "UK content under /events/kyiv-ataka (mixed Cyrillic concept, Latin script)",
    description_en:
      "Slug language must match the locale. Ukrainian content should live under /uk/; EN slug for UK-locale content is a mismatch.",
    severity: "error",
    example_bad: "/events/kyiv-ataka (Cyrillic concept, no /uk/ prefix)",
    example_good: "/uk/events/kyiv-ataka OR /events/kyiv-attack (consistent locale)",
    autoFixable: false,
    detect: (url) => {
      // Detect Cyrillic characters in a URL that lacks a /uk/ or /ru/ prefix
      const path = extractPath(url);
      const hasCyrillic = /[Ѐ-ӿ]/.test(path);
      const hasLocalePrefix = /^\/(uk|ru|bg|sr|mk)\//i.test(path);
      return hasCyrillic && !hasLocalePrefix;
    },
  },
  {
    id: "naked-canonical-to-root",
    pattern: 'canonical = "/" on non-homepage',
    description_en:
      'A self-canonical pointing to "/" from an arbitrary page funnels all equity to the homepage and de-indexes the actual page.',
    severity: "error",
    example_bad: '<link rel="canonical" href="https://aegislens.com/" /> on /events/kyiv',
    example_good: '<link rel="canonical" href="https://aegislens.com/events/kyiv" />',
    autoFixable: false,
    detect: (_url) => false, // Cannot detect from URL alone — checked at render time
  },
  {
    id: "double-slash",
    pattern: "//path or /path//segment",
    description_en: "Duplicate slashes in paths create distinct URLs from the crawler's perspective.",
    severity: "error",
    example_bad: "/events//kyiv",
    example_good: "/events/kyiv",
    autoFixable: true,
    detect: (url) => /\/{2,}/.test(extractPath(url)),
  },
  {
    id: "fragment-in-canonical",
    pattern: "/path#section as canonical",
    description_en:
      "Fragments (#) are client-side only and stripped by crawlers. Never use in canonical hrefs.",
    severity: "error",
    example_bad: "/events/kyiv#timeline",
    example_good: "/events/kyiv",
    autoFixable: true,
    detect: (url) => url.includes("#"),
  },
  {
    id: "mixed-locale-param",
    pattern: "/events/kyiv?lang=uk instead of /uk/events/kyiv",
    description_en:
      "Language selection via query param (?lang=) instead of URL prefix undermines hreflang and duplicate-content handling.",
    severity: "error",
    example_bad: "/events/kyiv?lang=uk",
    example_good: "/uk/events/kyiv",
    autoFixable: false,
    detect: (url) => {
      const searchParams = extractSearchParams(url);
      return searchParams.has("lang") || searchParams.has("locale") || searchParams.has("language");
    },
  },
];

// ── Internal helpers ──────────────────────────────────────────────────────────

/** Stop words used for the stuffing detector (subset). */
const STOP_WORDS_CHECK = new Set([
  "the", "a", "an", "of", "for", "to", "in", "on", "at", "by", "from",
  "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
  "with", "as", "up", "it", "its",
]);

function extractPath(url: string): string {
  try {
    // Try parsing as full URL
    return new URL(url, "https://canonical.local").pathname;
  } catch {
    // Fall back: treat everything before ? or # as the path
    return url.split("?")[0]?.split("#")[0] ?? url;
  }
}

function extractSearchParams(url: string): URLSearchParams {
  try {
    return new URL(url, "https://canonical.local").searchParams;
  } catch {
    const q = url.includes("?") ? url.split("?")[1] : "";
    return new URLSearchParams(q);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Lint a URL against all anti-pattern rules.
 * Returns `valid: true` only if there are zero error-severity violations.
 */
export function checkUrl(url: string): { valid: boolean; violations: UrlAntiPattern[] } {
  const violations = URL_ANTI_PATTERNS.filter((rule) => rule.detect(url));
  const hasErrors = violations.some((v) => v.severity === "error");
  return { valid: !hasErrors, violations };
}

/**
 * Auto-fix a URL by applying all `autoFixable` normalizations:
 *   - Strip fragment
 *   - Strip session / UTM params
 *   - Lowercase path
 *   - Replace underscores with hyphens
 *   - Remove trailing slash (except root)
 *   - Collapse double slashes
 *   - Remove file extensions
 */
export function normalizeUrl(url: string): string {
  // Strip fragment
  let u = url.split("#")[0] ?? url;

  // Parse
  let parsed: URL;
  try {
    parsed = new URL(u, "https://canonical.local");
  } catch {
    return url; // unparseable — return as-is
  }

  // Strip session / UTM params
  const SESSION_PARAMS = ["sessionid", "phpsessid", "sid", "session", "jsessionid"];
  const UTM_PREFIX = "utm_";
  for (const key of [...parsed.searchParams.keys()]) {
    if (SESSION_PARAMS.includes(key.toLowerCase()) || key.startsWith(UTM_PREFIX)) {
      parsed.searchParams.delete(key);
    }
  }

  // Lowercase path
  let path = parsed.pathname.toLowerCase();

  // Replace underscores with hyphens
  path = path.replace(/_/g, "-");

  // Remove file extensions
  path = path.replace(/\.(html|php|aspx|jsp|htm|cfm|cgi|asp)$/i, "");

  // Collapse double slashes
  path = path.replace(/\/{2,}/g, "/");

  // Remove trailing slash (except root)
  if (path.length > 1) {
    path = path.replace(/\/+$/, "");
  }

  parsed.pathname = path || "/";

  // Return path + query only (no host)
  const result = parsed.pathname + (parsed.search || "");
  return result;
}
