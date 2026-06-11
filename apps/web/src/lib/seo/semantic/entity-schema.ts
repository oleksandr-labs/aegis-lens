/**
 * Schema.org JSON-LD builders — entity, page, FAQ, HowTo.
 *
 * All functions are pure and return plain objects ready to be serialised
 * with JSON.stringify and embedded in a <script type="application/ld+json">.
 */

import type {
  SchemaEntityType,
  SameAsLink,
  EntityMention,
  InlineEntitySchema,
} from "./types";

// ─── Entity builder ────────────────────────────────────────────────────────

/**
 * Build a minimal inline schema.org entity block.
 *
 * @example
 *   buildEntitySchema({
 *     name: "Ukraine",
 *     type: "Place",
 *     sameAsLinks: [{ url: "https://www.wikidata.org/wiki/Q212", source: "wikidata" }],
 *     description: "Country in Eastern Europe.",
 *   });
 */
export function buildEntitySchema(entity: {
  name: string;
  type: SchemaEntityType;
  sameAsLinks: SameAsLink[];
  description?: string;
}): InlineEntitySchema {
  const schema: InlineEntitySchema = {
    "@type": entity.type,
    name: entity.name,
  };

  if (entity.sameAsLinks.length > 0) {
    schema.sameAs = entity.sameAsLinks.map((l) => l.url);
  }

  if (entity.description) {
    schema.description = { en: entity.description };
  }

  return schema;
}

// ─── Page about/mentions builder ───────────────────────────────────────────

/**
 * Build a WebPage-level `about` + `mentions` block from entity mention lists.
 * Intended for inclusion in the page's JSON-LD @graph.
 */
export function buildAboutMentionsSchema(pageContent: {
  about: EntityMention[];
  mentions: EntityMention[];
}): {
  "@type": "WebPage";
  about: InlineEntitySchema[];
  mentions: InlineEntitySchema[];
} {
  const toSchema = (mentions: EntityMention[]): InlineEntitySchema[] =>
    mentions.map((m) =>
      buildEntitySchema({
        name: m.text,
        type: m.entityType,
        sameAsLinks: m.sameAs,
      }),
    );

  return {
    "@type": "WebPage",
    about: toSchema(pageContent.about),
    mentions: toSchema(pageContent.mentions),
  };
}

// ─── FAQ builder ───────────────────────────────────────────────────────────

/**
 * Build a FAQPage JSON-LD object from a list of Q&A pairs.
 *
 * @see https://schema.org/FAQPage
 */
export function buildFaqSchema(
  items: { question: string; answer: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// ─── HowTo builder ─────────────────────────────────────────────────────────

/**
 * Build a HowTo JSON-LD object from an ordered list of steps.
 *
 * @see https://schema.org/HowTo
 */
export function buildHowToSchema(
  steps: { text: string; name?: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      ...(s.name ? { name: s.name } : {}),
      text: s.text,
    })),
  };
}
