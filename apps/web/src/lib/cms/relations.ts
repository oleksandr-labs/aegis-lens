/**
 * CMS Relations — definition and resolution of cross-content-type references.
 * Declares the graph of relations (post→author, region→conflict, etc.) and
 * provides a stub resolver for development.
 *
 * CMS Relations — визначення та розв'язання посилань між типами контенту.
 * Описує граф зв'язків і надає заглушку резолвера для розробки.
 */

import { CmsContentType } from "./content-types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CmsRelation {
  /** Source content type that holds the reference. / Тип контенту, що містить посилання. */
  fromType: CmsContentType;
  /** Field name on the source type. / Назва поля у типі-джерелі. */
  fieldName: string;
  /** Target content type being referenced. / Тип контенту, на який посилаємося. */
  toType: CmsContentType;
  /** Whether the relation is one-to-many (array of ids). / Чи є зв'язок «один-до-багатьох». */
  many: boolean;
  /** Human-readable description. / Людиночитаний опис. */
  description: string;
}

// ── Relation registry ─────────────────────────────────────────────────────────

/**
 * Complete list of content relations in the system.
 *
 * Повний перелік зв'язків контенту в системі.
 */
export const CONTENT_RELATIONS: CmsRelation[] = [
  {
    fromType: CmsContentType.Post,
    fieldName: "author",
    toType: CmsContentType.Author,
    many: false,
    description: "A blog post is written by one author.",
  },
  {
    fromType: CmsContentType.Brief,
    fieldName: "author",
    toType: CmsContentType.Author,
    many: false,
    description: "An intelligence brief is authored by one analyst.",
  },
  {
    fromType: CmsContentType.Report,
    fieldName: "authors",
    toType: CmsContentType.Author,
    many: true,
    description: "A report can have multiple authors.",
  },
  {
    fromType: CmsContentType.RegionCopy,
    fieldName: "conflicts",
    toType: CmsContentType.ConflictCopy,
    many: true,
    description: "A region can have multiple associated conflicts.",
  },
  {
    fromType: CmsContentType.ConflictCopy,
    fieldName: "region",
    toType: CmsContentType.RegionCopy,
    many: false,
    description: "Each conflict belongs to one primary region.",
  },
  {
    fromType: CmsContentType.Brief,
    fieldName: "region",
    toType: CmsContentType.RegionCopy,
    many: false,
    description: "A brief may be scoped to a single region.",
  },
  {
    fromType: CmsContentType.GlossaryTerm,
    fieldName: "relatedTerms",
    toType: CmsContentType.GlossaryTerm,
    many: true,
    description: "Glossary terms can cross-reference each other.",
  },
];

// ── Resolver (stub) ───────────────────────────────────────────────────────────

/**
 * Resolve a relation field to its target document.
 * Stub implementation — replace with a real Keystatic reader in production.
 *
 * Розв'язує поле зв'язку до цільового документа.
 * Заглушка — замінити на реальний читач Keystatic у продакшні.
 */
export async function resolveRelation(
  contentType: CmsContentType,
  fieldName: string,
  id: string,
): Promise<unknown> {
  const relation = CONTENT_RELATIONS.find(
    (r) => r.fromType === contentType && r.fieldName === fieldName,
  );

  if (!relation) {
    throw new Error(
      `[cms/relations] No relation defined for ${contentType}.${fieldName}`,
    );
  }

  // Stub: in production, call the Keystatic reader for relation.toType + id
  // Заглушка: у продакшні — викликати Keystatic reader для relation.toType + id
  return {
    _stub: true,
    toType: relation.toType,
    id,
    warning: "resolveRelation is a stub — wire up Keystatic reader",
  };
}
