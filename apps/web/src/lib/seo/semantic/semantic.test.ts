/**
 * Vitest unit tests — Semantic SEO & Knowledge Graph module.
 *
 * Coverage:
 *  - buildFaqSchema         → FAQPage type + mainEntity shape
 *  - linkDefinedTerms       → first-occurrence-only linking
 *  - validateEntitySchema   → missing name → invalid result
 *  - auditPageForSchemaCoverage → 0 coverage for empty schema list
 *  - extractEntityMentions  → "Ukraine" detected as Place
 */

import { describe, it, expect } from "vitest";
import { buildFaqSchema } from "./entity-schema";
import { linkDefinedTerms, extractEntityMentions } from "./defined-term-linker";
import { validateEntitySchema, auditPageForSchemaCoverage } from "./schema-validation";
import type { GlossaryTerm, InlineEntitySchema } from "./index";

// ─── buildFaqSchema ────────────────────────────────────────────────────────

describe("buildFaqSchema", () => {
  it("produces @type FAQPage with 2 mainEntity items", () => {
    const schema = buildFaqSchema([
      { question: "What is OSINT?", answer: "Open-source intelligence." },
      { question: "Is this free?", answer: "Yes, for non-commercial use." },
    ]) as Record<string, unknown>;

    expect(schema["@type"]).toBe("FAQPage");
    expect(schema["@context"]).toBe("https://schema.org");

    const entities = schema["mainEntity"] as unknown[];
    expect(entities).toHaveLength(2);

    const first = entities[0] as Record<string, unknown>;
    expect(first["@type"]).toBe("Question");
    expect(first["name"]).toBe("What is OSINT?");

    const answer = first["acceptedAnswer"] as Record<string, unknown>;
    expect(answer["@type"]).toBe("Answer");
    expect(answer["text"]).toBe("Open-source intelligence.");
  });
});

// ─── linkDefinedTerms ─────────────────────────────────────────────────────

describe("linkDefinedTerms", () => {
  const terms: GlossaryTerm[] = [
    { term: "OSINT", slug: "osint", locale: "en", aliases: [] },
    { term: "geolocation", slug: "geolocation", locale: "en", aliases: [] },
  ];

  it("wraps first occurrence in an anchor tag", () => {
    const result = linkDefinedTerms("OSINT is great. Use OSINT daily.", terms, "en");
    expect(result).toContain('<a href="/glossary/osint">OSINT</a>');
  });

  it("replaces only the FIRST occurrence of the term", () => {
    const result = linkDefinedTerms("OSINT is great. Use OSINT daily.", terms, "en");
    // Count anchor tags for osint — should be exactly 1
    const matches = result.match(/<a href="\/glossary\/osint">/g);
    expect(matches).toHaveLength(1);
  });

  it("does not link terms that are already inside an anchor tag", () => {
    const html = 'See <a href="/other">OSINT</a> for details. Also OSINT here.';
    const result = linkDefinedTerms(html, terms, "en");
    // The already-linked one stays, second occurrence gets linked
    // The existing anchor should remain intact
    expect(result).toContain('<a href="/other">OSINT</a>');
  });

  it("performs case-insensitive matching", () => {
    const result = linkDefinedTerms("osint is useful.", terms, "en");
    expect(result).toContain('<a href="/glossary/osint">osint</a>');
  });

  it("does not apply terms for a different locale", () => {
    const result = linkDefinedTerms("OSINT is great.", terms, "uk");
    expect(result).toBe("OSINT is great.");
  });
});

// ─── validateEntitySchema ─────────────────────────────────────────────────

describe("validateEntitySchema", () => {
  it("is invalid when name is an empty string", () => {
    const schema: InlineEntitySchema = { "@type": "Place", name: "" };
    const result = validateEntitySchema(schema);
    // name is present but empty → warning; REQUIRED_FIELDS for Place is ["name"]
    // The field IS present, so missingFields is empty, but the empty-string
    // warning means we expect a warning.
    expect(result.warnings).toContain("name is present but empty");
  });

  it("is invalid when a required field is missing", () => {
    // Article requires headline, author, datePublished
    const schema = {
      "@type": "Article",
      name: "Test",
    } as unknown as InlineEntitySchema;
    const result = validateEntitySchema(schema);
    expect(result.valid).toBe(false);
    expect(result.missingFields).toContain("headline");
    expect(result.missingFields).toContain("author");
    expect(result.missingFields).toContain("datePublished");
  });

  it("is valid for a Place with a name", () => {
    const schema: InlineEntitySchema = {
      "@type": "Place",
      name: "Donetsk",
      sameAs: ["https://www.wikidata.org/wiki/Q56297"],
    };
    const result = validateEntitySchema(schema);
    expect(result.valid).toBe(true);
    expect(result.missingFields).toHaveLength(0);
  });
});

// ─── auditPageForSchemaCoverage ───────────────────────────────────────────

describe("auditPageForSchemaCoverage", () => {
  it("returns coverage 0 and all expected types missing when schemas array is empty", () => {
    const result = auditPageForSchemaCoverage("pillar", []);
    expect(result.coverage).toBe(0);
    expect(result.missingTypes).toContain("Organization");
    expect(result.missingTypes).toContain("FAQPage");
  });

  it("returns coverage 1 when all expected schemas are present", () => {
    const schemas = [
      { "@type": "Organization", name: "Aegis Lens" },
      { "@type": "FAQPage", mainEntity: [] },
    ];
    const result = auditPageForSchemaCoverage("pillar", schemas);
    expect(result.coverage).toBe(1);
    expect(result.missingTypes).toHaveLength(0);
  });

  it("returns partial coverage when only some types are present", () => {
    const schemas = [{ "@type": "Organization", name: "Aegis Lens" }];
    const result = auditPageForSchemaCoverage("pillar", schemas);
    expect(result.coverage).toBeGreaterThan(0);
    expect(result.coverage).toBeLessThan(1);
    expect(result.missingTypes).toContain("FAQPage");
  });
});

// ─── extractEntityMentions ─────────────────────────────────────────────────

describe("extractEntityMentions", () => {
  const knownEntities = [
    {
      name: "Ukraine",
      type: "Place" as const,
      sameAs: [
        { url: "https://www.wikidata.org/wiki/Q212", source: "wikidata" as const },
      ],
    },
    {
      name: "NATO",
      type: "Organization" as const,
      sameAs: [],
    },
  ];

  it('finds "Ukraine" and marks it as a Place', () => {
    const mentions = extractEntityMentions(
      "Ukraine is a country in Eastern Europe bordered by Russia.",
      knownEntities,
    );
    expect(mentions.length).toBeGreaterThanOrEqual(1);
    const ukraine = mentions.find((m) => m.text === "Ukraine");
    expect(ukraine).toBeDefined();
    expect(ukraine?.entityType).toBe("Place");
    expect(ukraine?.position).toBe(0);
  });

  it("includes sameAs links in the mention", () => {
    const mentions = extractEntityMentions("Ukraine update.", knownEntities);
    const ukraine = mentions.find((m) => m.entityId === "ukraine");
    expect(ukraine?.sameAs[0].url).toBe("https://www.wikidata.org/wiki/Q212");
    expect(ukraine?.sameAs[0].source).toBe("wikidata");
  });

  it("returns empty array when no entities are found", () => {
    const mentions = extractEntityMentions("No relevant entities here.", knownEntities);
    expect(mentions).toHaveLength(0);
  });

  it("sorts results by position in text", () => {
    const mentions = extractEntityMentions("NATO and Ukraine cooperate.", knownEntities);
    expect(mentions.length).toBe(2);
    expect(mentions[0].text).toBe("NATO");
    expect(mentions[1].text).toBe("Ukraine");
  });
});
