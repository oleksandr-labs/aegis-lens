import { describe, it, expect } from "vitest";
import {
  embed,
  cosine,
  textSimilarity,
  findNearDuplicates,
  isSufficientlyUnique,
  ceilingFor,
} from "./uniqueness";
import {
  evaluateThinContent,
  isThin,
  countUniqueFields,
} from "./thin-guard";
import {
  resolveRobots,
  isNoindexRoute,
  stripLocale,
  shouldNoindex,
} from "./noindex-policy";
import { toCanonicalPath, isParamVariant } from "./param-canonical";
import { resolveCanonicalPath, canonicalTemplateFor } from "./canonical-rules";
import { paginationCanonical, withPageParam } from "./pagination-canonical";
import { checkLocaleCanonical, assertHreflangNotCanonical } from "./locale-policy";
import { evaluateFacetCombo, isIndexableFacet } from "./facet-index-policy";
import { computeAuditReport } from "./audit";
import { urls } from "@aegis/url-builder";

describe("uniqueness — hashing embedder + cosine", () => {
  it("identical text → cosine 1", () => {
    expect(textSimilarity("Kharkiv oblast shelling report", "Kharkiv oblast shelling report")).toBeCloseTo(1, 6);
  });

  it("a normalized vector has unit length (dot with self ≈ 1)", () => {
    const v = embed("drone strike on power infrastructure");
    expect(cosine(v, v)).toBeCloseTo(1, 6);
  });

  it("disjoint vocab → low similarity", () => {
    const sim = textSimilarity(
      "naval mine threat in the black sea",
      "quarterly pricing tiers and billing options",
    );
    expect(sim).toBeLessThan(0.2);
  });

  it("near-duplicate boilerplate variants score high", () => {
    const a = "This page covers Shahed-136 loitering munition operated by Russia in Ukraine.";
    const b = "This page covers Shahed-136 loitering munition operated by Russia in Ukraine!!!";
    expect(textSimilarity(a, b)).toBeGreaterThan(0.95);
  });
});

describe("findNearDuplicates per template", () => {
  it("flags the thin twin, not the unique sibling", () => {
    const pages = [
      { id: "/threats/a", text: "Iskander ballistic missile threat profile with payload range guidance and intercept history in eastern regions." },
      { id: "/threats/b", text: "Iskander ballistic missile threat profile with payload range guidance and intercept history in eastern regions." },
      { id: "/threats/c", text: "Naval drone Magura V5 unmanned surface vessel tactics against the black sea fleet and harbor defenses." },
    ];
    const flagged = findNearDuplicates(pages, "threat");
    const ids = flagged.map((f) => f.id).sort();
    expect(ids).toEqual(["/threats/a", "/threats/b"]);
  });

  it("respects per-template ceilings", () => {
    expect(ceilingFor("compare")).toBeGreaterThan(ceilingFor("guide"));
    expect(isSufficientlyUnique(0.8, "guide")).toBe(false);
    expect(isSufficientlyUnique(0.8, "compare")).toBe(true);
  });
});

describe("thin-guard", () => {
  it("passes a substantial page", () => {
    const body = Array.from({ length: 130 }, (_, i) => `word${i}`).join(" ");
    const res = evaluateThinContent({
      template: "region",
      fields: { population: 1_400_000, area: 31415, capital: "Kharkiv", events: [1, 2] },
      body,
    });
    expect(res.ok).toBe(true);
  });

  it("flags thin field count and short body", () => {
    const res = evaluateThinContent({
      template: "region",
      fields: { population: null, area: "", capital: "  " },
      body: "tiny",
    });
    expect(res.ok).toBe(false);
    expect(res.reasons.length).toBe(2);
  });

  it("countUniqueFields ignores empty/boilerplate values", () => {
    expect(countUniqueFields({ a: "", b: null, c: [], d: "real", e: 0 })).toBe(2);
  });

  it("isThin shorthand", () => {
    expect(isThin({ template: "tag", fields: {}, body: "" })).toBe(true);
  });
});

describe("noindex-policy", () => {
  it("strips non-default locale prefix", () => {
    expect(stripLocale("/uk/search", ["en", "uk"])).toBe("/search");
    expect(stripLocale("/search", ["en", "uk"])).toBe("/search");
  });

  it("search + account routes are noindex routes", () => {
    expect(isNoindexRoute("/search")).toBe(true);
    expect(isNoindexRoute("/search?q=missiles")).toBe(true);
    expect(isNoindexRoute("/account/api-keys")).toBe(true);
    expect(isNoindexRoute("/dashboard")).toBe(true);
  });

  it("help search is noindex but help articles are indexable", () => {
    expect(isNoindexRoute("/help")).toBe(true);
    expect(isNoindexRoute("/help/getting-started")).toBe(false);
  });

  it("real content routes index", () => {
    expect(isNoindexRoute("/threats/uav")).toBe(false);
    expect(isNoindexRoute("/regions/ua/kharkiv")).toBe(false);
  });

  it("auto-noindex below uniqueness threshold", () => {
    const d = resolveRobots({ path: "/uk/threats/x", template: "threat", similarityToNearest: 0.95 });
    expect(d.index).toBe(false);
    expect(d.follow).toBe(true);
  });

  it("auto-noindex thin content", () => {
    expect(
      shouldNoindex({
        path: "/regions/ua/x",
        content: { template: "region", fields: {}, body: "" },
      }),
    ).toBe(true);
  });

  it("indexes a unique, substantial, allowed route", () => {
    expect(resolveRobots({ path: "/threats/uav", template: "threat", similarityToNearest: 0.4 }).index).toBe(true);
  });
});

describe("param-canonical", () => {
  it("drops tracking + sort/filter, keeps base", () => {
    expect(toCanonicalPath("/news?utm_source=tw&sort=newest&ref=x")).toBe("/news");
  });

  it("keeps identity params (page) and sorts them", () => {
    expect(toCanonicalPath("/news?sort=old&page=3")).toBe("/news?page=3");
  });

  it("detects pure param variants", () => {
    expect(isParamVariant("/news?utm_source=x")).toBe(true);
    expect(isParamVariant("/news?page=2")).toBe(false);
    expect(isParamVariant("/news")).toBe(false);
  });
});

describe("canonical-rules per template", () => {
  it("detail drops every param", () => {
    expect(resolveCanonicalPath({ template: "detail", url: "/entities/iskander-m?page=2&utm_source=x" })).toBe("/entities/iskander-m");
  });

  it("listing keeps pagination, collapses page=1", () => {
    expect(resolveCanonicalPath({ template: "listing", url: "/news?page=1&sort=new" })).toBe("/news");
    expect(resolveCanonicalPath({ template: "listing", url: "/news?page=4" })).toBe("/news?page=4");
  });

  it("compare keeps oblasts identity param", () => {
    expect(resolveCanonicalPath({ template: "compare", url: "/compare?oblasts=kharkiv,kyiv&utm_source=x" })).toBe("/compare?oblasts=kharkiv%2Ckyiv");
  });

  it("template mapper", () => {
    expect(canonicalTemplateFor("news")).toBe("listing");
    expect(canonicalTemplateFor("search")).toBe("search");
    expect(canonicalTemplateFor("entity")).toBe("detail");
  });
});

describe("pagination-canonical", () => {
  const pageFor = (p: number) => withPageParam("/news", p);

  it("page 1 collapses to base", () => {
    const r = paginationCanonical({ pageFor, currentPage: 1 });
    expect(r.canonicalPath).toBe("/news");
    expect(r.collapsedToBase).toBe(true);
  });

  it("page N self-canonicalizes", () => {
    expect(paginationCanonical({ pageFor, currentPage: 5 }).canonicalPath).toBe("/news?page=5");
  });
});

describe("locale-policy — hreflang, never cross-locale canonical", () => {
  const site = "https://aegis.example";
  const pathFor = (lc: "en" | "uk") => urls.region(lc, "ua", "kharkiv");

  it("EN canonical is self-referential, not the UK URL", () => {
    const res = checkLocaleCanonical({ siteUrl: site, locale: "en", pathFor });
    expect(res.ok).toBe(true);
    expect(res.canonical).toBe("https://aegis.example/regions/ua/kharkiv");
    const uk = res.alternates.find((a) => a.hreflang === "uk")?.href;
    expect(res.canonical).not.toBe(uk);
  });

  it("UK canonical is self-referential, not the EN URL", () => {
    const res = checkLocaleCanonical({ siteUrl: site, locale: "uk", pathFor });
    expect(res.ok).toBe(true);
    expect(res.canonical).toBe("https://aegis.example/uk/regions/ua/kharkiv");
  });

  it("has hreflang for en, uk, and x-default", () => {
    const res = checkLocaleCanonical({ siteUrl: site, locale: "en", pathFor });
    const tags = res.alternates.map((a) => a.hreflang);
    expect(tags).toContain("en");
    expect(tags).toContain("uk");
    expect(tags).toContain("x-default");
  });

  it("assertHreflangNotCanonical does not throw for correct setup", () => {
    expect(() => assertHreflangNotCanonical({ siteUrl: site, locale: "uk", pathFor })).not.toThrow();
  });

  it("throws when canonical would cross to another locale", () => {
    // Broken builder: every locale resolves to the EN path → uk canonical == en URL.
    const broken = (_lc: "en" | "uk") => urls.region("en", "ua", "kharkiv");
    expect(() => assertHreflangNotCanonical({ siteUrl: site, locale: "uk", pathFor: broken })).toThrow(/cross-locale|does not match/);
  });
});

describe("facet-index-policy", () => {
  it("single facet indexable", () => {
    expect(isIndexableFacet({ industry: "cybersecurity" })).toBe(true);
  });

  it("curated 2-way combo indexable", () => {
    expect(evaluateFacetCombo({ industry: "cybersecurity", city: "london" }).indexable).toBe(true);
  });

  it("uncurated 2-way combo rejected", () => {
    expect(evaluateFacetCombo({ city: "london", year: "2024" }).indexable).toBe(false);
  });

  it("3-way combo always rejected", () => {
    const r = evaluateFacetCombo({ industry: "x", city: "y", country: "ua" });
    expect(r.indexable).toBe(false);
    expect(r.reason).toMatch(/3-way/);
  });

  it("empty combo = base listing indexable", () => {
    expect(evaluateFacetCombo({}).indexable).toBe(true);
  });
});

describe("audit — report composition", () => {
  it("reports near-dupes, thin pages, and canonical mismatches", () => {
    const report = computeAuditReport([
      {
        path: "/threats/a",
        template: "threat",
        declaredCanonical: "/threats/a",
        text: "Iskander ballistic missile threat profile range payload intercept eastern region detail.",
      },
      {
        path: "/threats/b",
        template: "threat",
        declaredCanonical: "/threats/b?utm_source=x", // wrong: should be /threats/b
        text: "Iskander ballistic missile threat profile range payload intercept eastern region detail.",
        content: { template: "threat", fields: {}, body: "thin" },
      },
    ]);
    expect(report.totalPages).toBe(2);
    expect(report.summary.nearDuplicateCount).toBeGreaterThan(0);
    expect(report.summary.thinCount).toBe(1);
    expect(report.summary.canonicalMismatchCount).toBe(1);
    expect(report.summary.issueRate).toBeGreaterThan(0);
  });
});
