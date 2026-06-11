import { describe, expect, it } from "vitest";
import robots from "../../app/robots";
import { requiresPerLocaleRobots } from "./robots-locale-policy";

/**
 * CI test: robots.txt is parseable & well-formed (TODO/seo/TODO_robots_txt.md).
 *
 * Next.js `MetadataRoute.Robots` is serialised to text by the framework, but we
 * can assert the structured invariants that make the emitted robots.txt valid
 * and policy-compliant:
 *  - never `Disallow: /` (would deindex the whole site)
 *  - sitemaps declared, absolute, https-able
 *  - the wildcard agent allows the site root
 *  - reputable AI crawlers explicitly allowed (LLMO policy)
 *  - the rendered text round-trips through a minimal robots parser
 */

type Rule = {
  userAgent?: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
};

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

/** Render the structured robots config into robots.txt text (mirrors Next). */
function render(config: ReturnType<typeof robots>): string {
  const lines: string[] = [];
  const rules = asArray(config.rules as Rule | Rule[]);
  for (const rule of rules) {
    for (const ua of asArray(rule.userAgent)) lines.push(`User-agent: ${ua}`);
    for (const a of asArray(rule.allow)) lines.push(`Allow: ${a}`);
    for (const d of asArray(rule.disallow)) lines.push(`Disallow: ${d}`);
    if (typeof rule.crawlDelay === "number") lines.push(`Crawl-delay: ${rule.crawlDelay}`);
    lines.push("");
  }
  for (const s of asArray(config.sitemap)) lines.push(`Sitemap: ${s}`);
  if (config.host) lines.push(`Host: ${config.host}`);
  return lines.join("\n");
}

/** Minimal robots.txt parser — proves the rendered text is line-parseable. */
function parse(text: string) {
  const directives = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf(":");
      expect(idx).toBeGreaterThan(0); // every non-blank line is "Key: value"
      return [l.slice(0, idx).trim().toLowerCase(), l.slice(idx + 1).trim()] as const;
    });
  return directives;
}

describe("robots.txt", () => {
  const config = robots();

  it("never disallows the whole site", () => {
    const rules = asArray(config.rules as Rule | Rule[]);
    for (const rule of rules) {
      for (const d of asArray(rule.disallow)) {
        expect(d).not.toBe("/");
      }
    }
  });

  it("declares at least one absolute sitemap", () => {
    const sitemaps = asArray(config.sitemap);
    expect(sitemaps.length).toBeGreaterThan(0);
    for (const s of sitemaps) {
      expect(s).toMatch(/^https?:\/\//);
      expect(() => new URL(s)).not.toThrow();
    }
  });

  it("wildcard agent allows the root", () => {
    const rules = asArray(config.rules as Rule | Rule[]);
    const wildcard = rules.find((r) => asArray(r.userAgent).includes("*"));
    expect(wildcard).toBeDefined();
    expect(asArray(wildcard!.allow)).toContain("/");
  });

  it("explicitly allows reputable AI crawlers (LLMO)", () => {
    const rules = asArray(config.rules as Rule | Rule[]);
    const agents = rules.flatMap((r) => asArray(r.userAgent));
    for (const bot of ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "OAI-SearchBot"]) {
      expect(agents).toContain(bot);
    }
  });

  it("crawl-delay values, when present, are non-negative integers", () => {
    const rules = asArray(config.rules as Rule | Rule[]);
    for (const rule of rules) {
      if (typeof rule.crawlDelay === "number") {
        expect(Number.isInteger(rule.crawlDelay)).toBe(true);
        expect(rule.crawlDelay).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("renders to parseable robots.txt text", () => {
    const text = render(config);
    const directives = parse(text);
    const keys = new Set(directives.map(([k]) => k));
    expect(keys.has("user-agent")).toBe(true);
    expect(keys.has("sitemap")).toBe(true);
    // No Disallow: / survived rendering.
    expect(directives.some(([k, v]) => k === "disallow" && v === "/")).toBe(false);
  });

  it("does not require per-locale robots under the current path-prefix strategy", () => {
    expect(requiresPerLocaleRobots()).toBe(false);
  });
});
