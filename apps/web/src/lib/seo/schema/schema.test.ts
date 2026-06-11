/**
 * CI test: Rich Results validation per template (structural, no network).
 *
 * TODO_schema_library.md asks for a "Rich Results Tester per template" check.
 * Google's live Rich Results API needs network + a public URL, which CI here
 * does not have, so per the Sprint brief this is a PURE STRUCTURAL test: every
 * per-template generator's output is validated against the required-prop
 * contract in `required-props.ts` (the same rules the Rich Results Tester
 * enforces for eligibility). No network, deterministic.
 *
 * There is no vitest runner wired in `apps/web` yet — this file is the
 * deliverable (CI will run it later). Style matches the workspace's vitest
 * tests (e.g. packages/url-builder/src/index.test.ts).
 */

import { describe, it, expect } from "vitest";
import {
  validateNode,
  validateDocument,
  REQUIRED_PROPS,
  type SchemaType,
} from "./required-props";
import * as gen from "./generators";
import {
  buildChecklist,
  runAudit,
  TEMPLATE_SCHEMA_SPECS,
  AUDIT_THRESHOLDS,
  type AuditInput,
} from "./audit";

const SITE_URL = "https://aegislens.example";

/** Helper: assert a node satisfies its required-prop contract. */
function expectValid(node: Record<string, unknown>) {
  const r = validateNode(node);
  expect(r.errors).toEqual([]);
  expect(r.missingRequired).toEqual([]);
  expect(r.valid).toBe(true);
}

describe("required-props contract", () => {
  it("declares required props for every known SchemaType", () => {
    for (const [type, props] of Object.entries(REQUIRED_PROPS)) {
      expect(Array.isArray(props), `${type} must list required props`).toBe(true);
    }
  });

  it("flags a node missing a required prop", () => {
    const r = validateNode({ "@type": "Article", headline: "x" });
    expect(r.valid).toBe(false);
    expect(r.missingRequired).toContain("author");
    expect(r.missingRequired).toContain("publisher");
  });

  it("treats empty string / empty array as missing", () => {
    const r = validateNode({ "@type": "Organization", name: "", url: [] });
    expect(r.missingRequired).toEqual(["name", "url"]);
  });

  it("reports unknown @type without crashing", () => {
    const r = validateNode({ "@type": "Spaceship", name: "x" });
    expect(r.errors.join(" ")).toMatch(/no required-prop contract/);
  });
});

describe("per-template generators emit Rich-Results-valid markup", () => {
  it("Organization", () => expectValid(gen.organizationJsonLd()));
  it("WebSite", () => expectValid(gen.websiteJsonLd()));

  it("WebPage / CollectionPage", () => {
    expectValid(gen.webPageJsonLd("About", `${SITE_URL}/about`, "en"));
    expectValid(gen.collectionPageJsonLd("Industries", `${SITE_URL}/industries`, "d", "en"));
  });

  it("Article / NewsArticle / TechArticle", () => {
    const base = {
      headline: "Title",
      url: `${SITE_URL}/blog/x`,
      datePublished: "2026-06-01",
      authorName: "Author",
      publisherName: "Aegis Lens",
      publisherUrl: SITE_URL,
      inLanguage: "en",
    };
    expectValid(gen.articleJsonLd(base));
    expectValid(gen.newsArticleJsonLd(base));
    expectValid(gen.techArticleJsonLd(base));
    expect(gen.newsArticleJsonLd(base)["@type"]).toBe("NewsArticle");
  });

  it("FAQPage with valid Question/Answer nesting", () => {
    const node = gen.faqPageJsonLd([{ q: "Q1?", a: "A1." }], "uk");
    expectValid(node as unknown as Record<string, unknown>);
  });

  it("FAQPage with a broken answer is rejected", () => {
    const broken = {
      "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer" } }],
    };
    expect(validateNode(broken).valid).toBe(false);
  });

  it("HowTo with steps", () => expectValid(gen.howToJsonLd("Geolocate", [{ name: "S1", text: "t" }])));

  it("Event with location", () =>
    expectValid(gen.eventJsonLd({ name: "Strike", startDate: "2026-06-01", placeName: "Kharkiv", lat: 50, lon: 36 })));

  it("Place / Product / Person", () => {
    expectValid(gen.placeJsonLd("Kharkiv", 50, 36));
    expectValid(gen.productJsonLd("Bayraktar TB2"));
    expectValid(gen.personJsonLd({ name: "Public Figure", url: `${SITE_URL}/entities/x` }));
  });

  it("Dataset / DefinedTerm(Set)", () => {
    expectValid(gen.datasetJsonLd({ name: "Strikes 2026", description: "d" }));
    expectValid(gen.definedTermJsonLd("OSINT", "open-source intel"));
    expectValid(gen.definedTermSetJsonLd("Glossary"));
  });

  it("Course / LearningResource", () => {
    expectValid(gen.courseJsonLd({ name: "OSINT 101", description: "d", providerName: "Aegis", providerUrl: SITE_URL }));
    expectValid(gen.learningResourceJsonLd("Lesson 1"));
  });

  it("VideoObject / Podcast", () => {
    expectValid(
      gen.videoObjectJsonLd({ name: "Brief", thumbnailUrl: `${SITE_URL}/t.jpg`, uploadDate: "2026-06-01" }),
    );
    expectValid(gen.podcastSeriesJsonLd("Aegis Cast"));
    expectValid(gen.podcastEpisodeJsonLd("Ep 1", `${SITE_URL}/podcast/1`, "Aegis Cast"));
  });

  it("SoftwareApplication / Service", () => {
    expectValid(gen.softwareApplicationJsonLd("Classifier"));
    expectValid(gen.serviceJsonLd("Monitoring"));
  });

  it("ItemList with 1-based contiguous positions", () => {
    const node = gen.itemListJsonLd([
      { name: "A", url: `${SITE_URL}/a` },
      { name: "B", url: `${SITE_URL}/b` },
    ]);
    expectValid(node as unknown as Record<string, unknown>);
  });
});

describe("BreadcrumbList generator", () => {
  const crumbs = [
    { key: "home", label: { en: "Home", uk: "Головна" }, href: "/" },
    { key: "industries", label: { en: "Industries", uk: "Галузі" }, href: "/industries" },
    { key: "current", label: { en: "OSINT Tools", uk: "OSINT" } },
  ];

  it("emits valid BreadcrumbList with last item unlinked", () => {
    const node = gen.breadcrumbListJsonLd(crumbs, "en", SITE_URL);
    expectValid(node as unknown as Record<string, unknown>);
    const items = node.itemListElement;
    expect(items[0].position).toBe(1);
    expect(items[items.length - 1].item).toBeUndefined();
    expect(items[0].item).toBe(`${SITE_URL}/`);
  });

  it("localizes labels (uk)", () => {
    const node = gen.breadcrumbListJsonLd(crumbs, "uk", SITE_URL);
    expect(node.itemListElement[1].name).toBe("Галузі");
  });

  it("rejects a tampered BreadcrumbList with non-contiguous positions", () => {
    const bad = {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 5, name: "X" },
      ],
    };
    expect(validateNode(bad).valid).toBe(false);
  });
});

describe("graph documents validate as a whole", () => {
  it("validates a multi-node @graph", () => {
    const doc = gen.graph(
      gen.organizationJsonLd(),
      gen.collectionPageJsonLd("Industries", `${SITE_URL}/industries`, "d", "en"),
      gen.breadcrumbListJsonLd(
        [
          { key: "home", label: { en: "Home", uk: "Головна" }, href: "/" },
          { key: "c", label: { en: "Industries", uk: "Галузі" } },
        ],
        "en",
        SITE_URL,
      ),
    );
    const results = validateDocument(doc);
    expect(results.every((r) => r.valid)).toBe(true);
  });
});

describe("audit model", () => {
  it("enumerates a checklist covering every expected type", () => {
    const checklist = buildChecklist();
    expect(checklist.length).toBeGreaterThan(0);
    for (const item of checklist) {
      expect(REQUIRED_PROPS[item.type as SchemaType]).toBeDefined();
    }
  });

  it("marks templates without sample docs as uncovered", () => {
    const inputs: AuditInput[] = TEMPLATE_SCHEMA_SPECS.map((spec) => ({ spec }));
    const report = runAudit(inputs);
    expect(report.uncovered).toBe(TEMPLATE_SCHEMA_SPECS.length);
    expect(report.verdict).toBe("pass"); // uncovered != fail
  });

  it("passes a template whose sample doc is complete", () => {
    const spec = TEMPLATE_SCHEMA_SPECS.find((s) => s.template === "industries/[slug]")!;
    const fetchedDoc = gen.graph(
      gen.collectionPageJsonLd("Industries", `${SITE_URL}/industries`, "d", "en"),
      gen.breadcrumbListJsonLd(
        [
          { key: "home", label: { en: "Home", uk: "Головна" }, href: "/" },
          { key: "c", label: { en: "Industries", uk: "Галузі" } },
        ],
        "en",
        SITE_URL,
      ),
    );
    const report = runAudit([{ spec, fetchedDoc }]);
    expect(report.verdict).toBe("pass");
    expect(report.results[0].verdict).toBe("pass");
    expect(report.totalRequiredMisses).toBe(0);
  });

  it("fails a template whose sample doc misses an expected type", () => {
    const spec = TEMPLATE_SCHEMA_SPECS.find((s) => s.template === "events/[id]")!;
    // Missing the Event node entirely.
    const fetchedDoc = gen.graph(gen.webPageJsonLd("Event", `${SITE_URL}/events/1`, "en"));
    const report = runAudit([{ spec, fetchedDoc }]);
    expect(report.verdict).toBe("fail");
    expect(report.results[0].missingTypes).toContain("Event");
  });

  it("flags an overdue audit past the quarterly threshold", () => {
    const old = new Date("2026-01-01");
    const now = new Date("2026-06-01");
    const report = runAudit([], { now, lastAuditAt: old });
    expect(report.overdue).toBe(true);
    expect(AUDIT_THRESHOLDS.staleAfterDays).toBe(92);
  });
});
