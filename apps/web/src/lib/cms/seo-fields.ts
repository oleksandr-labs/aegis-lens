/**
 * SEO Fields — title, description, Open Graph and canonical URL fields
 * for editorial content, with character-limit validation.
 *
 * SEO-поля — заголовок, опис, Open Graph та канонічний URL для редакторського
 * контенту з перевіркою обмежень символів.
 */

// ── Interface ─────────────────────────────────────────────────────────────────

export interface SeoFields {
  /** Page <title> tag value. Should be ≤ 60 chars. / Значення тегу <title>. */
  title: string;
  /** Meta description. Should be ≤ 160 chars. / Мета-опис. */
  description: string;
  /** og:title override (defaults to title if absent). / Перевизначення og:title. */
  ogTitle?: string;
  /** og:description override (defaults to description if absent). */
  ogDescription?: string;
  /** Absolute URL for og:image. / Абсолютний URL для og:image. */
  ogImage?: string;
  /** Canonical URL for this page. / Канонічний URL сторінки. */
  canonicalUrl?: string;
}

// ── Limits ────────────────────────────────────────────────────────────────────

/**
 * Character limits for SEO fields.
 *
 * Обмеження символів для SEO-полів.
 */
export const SEO_FIELD_LIMITS: Record<
  "title" | "description" | "ogTitle" | "ogDescription",
  number
> = {
  title: 60,
  description: 160,
  ogTitle: 60,
  ogDescription: 160,
};

// ── Validator ─────────────────────────────────────────────────────────────────

/**
 * Validate SEO fields and return a list of human-readable error strings.
 * An empty array means the fields are valid.
 *
 * Перевіряє SEO-поля та повертає список повідомлень про помилки.
 * Порожній масив означає, що поля валідні.
 */
export function validateSeoFields(fields: Partial<SeoFields>): string[] {
  const errors: string[] = [];

  if (!fields.title || fields.title.trim() === "") {
    errors.push("title: required");
  } else if (fields.title.length > SEO_FIELD_LIMITS.title) {
    errors.push(
      `title: too long (${fields.title.length} chars, max ${SEO_FIELD_LIMITS.title})`,
    );
  }

  if (!fields.description || fields.description.trim() === "") {
    errors.push("description: required");
  } else if (fields.description.length > SEO_FIELD_LIMITS.description) {
    errors.push(
      `description: too long (${fields.description.length} chars, max ${SEO_FIELD_LIMITS.description})`,
    );
  }

  if (
    fields.ogTitle !== undefined &&
    fields.ogTitle.length > SEO_FIELD_LIMITS.ogTitle
  ) {
    errors.push(
      `ogTitle: too long (${fields.ogTitle.length} chars, max ${SEO_FIELD_LIMITS.ogTitle})`,
    );
  }

  if (
    fields.ogDescription !== undefined &&
    fields.ogDescription.length > SEO_FIELD_LIMITS.ogDescription
  ) {
    errors.push(
      `ogDescription: too long (${fields.ogDescription.length} chars, max ${SEO_FIELD_LIMITS.ogDescription})`,
    );
  }

  if (fields.ogImage !== undefined && !/^https?:\/\//i.test(fields.ogImage)) {
    errors.push("ogImage: must be an absolute URL starting with http(s)://");
  }

  if (
    fields.canonicalUrl !== undefined &&
    !/^https?:\/\//i.test(fields.canonicalUrl)
  ) {
    errors.push("canonicalUrl: must be an absolute URL starting with http(s)://");
  }

  return errors;
}
