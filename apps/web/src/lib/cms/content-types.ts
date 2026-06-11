/**
 * CMS Content Types — definitions for all editorial content models.
 * Each type has a structured config with display label and field list.
 *
 * Типи контенту CMS — визначення всіх редакторських моделей контенту.
 * Кожен тип має структуровану конфігурацію з міткою та переліком полів.
 */

// ── Enum ──────────────────────────────────────────────────────────────────────

/**
 * All CMS-managed content types.
 *
 * Усі типи контенту, керовані CMS.
 */
export enum CmsContentType {
  Post = "post",
  Brief = "brief",
  Report = "report",
  GlossaryTerm = "glossary-term",
  UseCase = "use-case",
  RegionCopy = "region-copy",
  ConflictCopy = "conflict-copy",
  EquipmentCopy = "equipment-copy",
  Author = "author",
}

// ── Field descriptor ──────────────────────────────────────────────────────────

export type FieldKind =
  | "text"
  | "rich-text"
  | "slug"
  | "date"
  | "image"
  | "relation"
  | "select"
  | "boolean"
  | "tags"
  | "url";

export interface FieldConfig {
  name: string;
  kind: FieldKind;
  required: boolean;
  /** UI hint shown to editors. / Підказка для редакторів в UI. */
  hint?: string;
}

// ── ContentTypeConfig ─────────────────────────────────────────────────────────

export interface ContentTypeConfig {
  /** Human-readable label (EN). / Людиночитана мітка (EN). */
  label: string;
  /** Human-readable label (UK). / Людиночитана мітка (UK). */
  labelUk: string;
  /** Path prefix where content files are stored. / Префікс шляху зберігання файлів. */
  contentPath: string;
  fields: FieldConfig[];
}

// ── Configs ───────────────────────────────────────────────────────────────────

/**
 * Full configuration map for every CMS content type.
 *
 * Повна карта конфігурацій для кожного типу контенту CMS.
 */
export const CONTENT_TYPE_CONFIGS: Record<CmsContentType, ContentTypeConfig> = {
  [CmsContentType.Post]: {
    label: "Blog Post",
    labelUk: "Публікація блогу",
    contentPath: "content/posts",
    fields: [
      { name: "title", kind: "text", required: true, hint: "Post headline ≤ 80 chars" },
      { name: "slug", kind: "slug", required: true },
      { name: "publishedAt", kind: "date", required: true },
      { name: "author", kind: "relation", required: true, hint: "Relation to Author" },
      { name: "coverImage", kind: "image", required: false },
      { name: "tags", kind: "tags", required: false },
      { name: "summary", kind: "text", required: true, hint: "≤ 160 chars for SEO description" },
      { name: "body", kind: "rich-text", required: true },
      { name: "locale", kind: "select", required: true, hint: "en | uk | ru | pl | de" },
    ],
  },
  [CmsContentType.Brief]: {
    label: "Intelligence Brief",
    labelUk: "Розвідувальний брифінг",
    contentPath: "content/briefs",
    fields: [
      { name: "title", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "publishedAt", kind: "date", required: true },
      { name: "author", kind: "relation", required: true },
      { name: "classification", kind: "select", required: true, hint: "public | restricted" },
      { name: "region", kind: "relation", required: false, hint: "Relation to RegionCopy" },
      { name: "summary", kind: "text", required: true },
      { name: "body", kind: "rich-text", required: true },
      { name: "locale", kind: "select", required: true },
    ],
  },
  [CmsContentType.Report]: {
    label: "Analytical Report",
    labelUk: "Аналітичний звіт",
    contentPath: "content/reports",
    fields: [
      { name: "title", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "publishedAt", kind: "date", required: true },
      { name: "authors", kind: "relation", required: true, hint: "One or more Author relations" },
      { name: "coverImage", kind: "image", required: false },
      { name: "executiveSummary", kind: "text", required: true },
      { name: "body", kind: "rich-text", required: true },
      { name: "tags", kind: "tags", required: false },
      { name: "downloadUrl", kind: "url", required: false },
      { name: "locale", kind: "select", required: true },
    ],
  },
  [CmsContentType.GlossaryTerm]: {
    label: "Glossary Term",
    labelUk: "Термін глосарію",
    contentPath: "content/glossary",
    fields: [
      { name: "term", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "definition", kind: "rich-text", required: true },
      { name: "relatedTerms", kind: "relation", required: false },
      { name: "locale", kind: "select", required: true },
    ],
  },
  [CmsContentType.UseCase]: {
    label: "Use Case",
    labelUk: "Сценарій використання",
    contentPath: "content/use-cases",
    fields: [
      { name: "title", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "summary", kind: "text", required: true },
      { name: "body", kind: "rich-text", required: true },
      { name: "coverImage", kind: "image", required: false },
      { name: "tags", kind: "tags", required: false },
      { name: "locale", kind: "select", required: true },
    ],
  },
  [CmsContentType.RegionCopy]: {
    label: "Region Copy",
    labelUk: "Текст регіону",
    contentPath: "content/regions",
    fields: [
      { name: "regionCode", kind: "text", required: true, hint: "ISO 3166-2 code" },
      { name: "displayName", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "description", kind: "rich-text", required: true },
      { name: "conflicts", kind: "relation", required: false, hint: "Relation to ConflictCopy" },
      { name: "locale", kind: "select", required: true },
    ],
  },
  [CmsContentType.ConflictCopy]: {
    label: "Conflict Copy",
    labelUk: "Текст конфлікту",
    contentPath: "content/conflicts",
    fields: [
      { name: "conflictId", kind: "text", required: true },
      { name: "displayName", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "summary", kind: "text", required: true },
      { name: "body", kind: "rich-text", required: true },
      { name: "region", kind: "relation", required: true, hint: "Relation to RegionCopy" },
      { name: "startDate", kind: "date", required: false },
      { name: "locale", kind: "select", required: true },
    ],
  },
  [CmsContentType.EquipmentCopy]: {
    label: "Equipment Copy",
    labelUk: "Текст обладнання",
    contentPath: "content/equipment",
    fields: [
      { name: "equipmentId", kind: "text", required: true },
      { name: "displayName", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "category", kind: "select", required: true },
      { name: "description", kind: "rich-text", required: true },
      { name: "image", kind: "image", required: false },
      { name: "locale", kind: "select", required: true },
    ],
  },
  [CmsContentType.Author]: {
    label: "Author",
    labelUk: "Автор",
    contentPath: "content/authors",
    fields: [
      { name: "displayName", kind: "text", required: true },
      { name: "slug", kind: "slug", required: true },
      { name: "bio", kind: "rich-text", required: false },
      { name: "avatar", kind: "image", required: false },
      { name: "role", kind: "select", required: true, hint: "analyst | editor | contributor" },
      { name: "email", kind: "text", required: false },
      { name: "twitterHandle", kind: "text", required: false },
    ],
  },
};
