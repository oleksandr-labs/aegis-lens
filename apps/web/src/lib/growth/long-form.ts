/**
 * Long-form Content — deep dives, methodology posts, case studies, attribution reports.
 *
 * Manages the long-form editorial pipeline, schema.org markup generation,
 * and archival of post metadata for SEO and cross-linking.
 *
 * Довгі матеріали: аналітичні статті, методологія, кейси, звіти атрибуції.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Supported long-form post types. / Типи довгих матеріалів. */
export const LONG_FORM_TYPES = [
  "deep-dive",
  "methodology",
  "case-study",
  "attribution-report",
] as const;

export type LongFormType = (typeof LONG_FORM_TYPES)[number];

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface LongFormPost {
  /** Unique slug used in the URL. / Унікальний slug для URL. */
  slug: string;
  /** Post type. / Тип матеріалу. */
  type: LongFormType;
  /** Title (EN). / Заголовок (EN). */
  titleEn: string;
  /** Title (UK). / Заголовок (UK). */
  titleUk?: string;
  /** Short description for SEO / OG. / Короткий опис для SEO / OG. */
  description: string;
  /** Primary author (byline). / Основний автор. */
  author: string;
  /** Reviewer(s) — two required for analytical content. / Рецензенти. */
  reviewers: string[];
  /** ISO-8601 publish date. / Дата публікації. */
  publishedAt: string;
  /** ISO-8601 last-modified date. / Дата останньої зміни. */
  updatedAt: string;
  /** Canonical URL. / Канонічний URL. */
  canonicalUrl: string;
  /** Hero image URL. / URL головного зображення. */
  heroImageUrl?: string;
  /** Estimated reading time in minutes. / Орієнтовний час читання (хв). */
  readingTimeMinutes: number;
  /** Tags for cross-linking and taxonomy. / Теги. */
  tags: string[];
  /** Whether the post is published. / Чи опублікований матеріал. */
  published: boolean;
}

// ── Schema.org builder ────────────────────────────────────────────────────────

/**
 * Build a schema.org Article/TechArticle JSON-LD object for a long-form post.
 *
 * Формує JSON-LD schema.org для довгого матеріалу.
 */
export function buildPostSchemaOrg(post: LongFormPost): object {
  const schemaType =
    post.type === "methodology" || post.type === "attribution-report"
      ? "TechArticle"
      : "Article";

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: post.titleEn,
    description: post.description,
    url: post.canonicalUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Aegis Lens",
      url: "https://aegislens.uk",
      logo: {
        "@type": "ImageObject",
        url: "https://aegislens.uk/logo.png",
      },
    },
    image: post.heroImageUrl
      ? { "@type": "ImageObject", url: post.heroImageUrl }
      : undefined,
    timeRequired: `PT${post.readingTimeMinutes}M`,
    keywords: post.tags.join(", "),
    inLanguage: "en-GB",
  };
}

// ── LongFormStore ─────────────────────────────────────────────────────────────

export class LongFormStore {
  private readonly posts = new Map<string, LongFormPost>();

  /**
   * Save or update a long-form post.
   *
   * Зберігає або оновлює матеріал.
   */
  upsert(post: LongFormPost): void {
    this.posts.set(post.slug, post);
  }

  /**
   * Get a post by slug.
   *
   * Повертає матеріал за slug.
   */
  get(slug: string): LongFormPost | undefined {
    return this.posts.get(slug);
  }

  /**
   * List published posts, most recently published first.
   *
   * Повертає опубліковані матеріали, найновіші першими.
   */
  listPublished(type?: LongFormType): LongFormPost[] {
    const all = Array.from(this.posts.values()).filter((p) => p.published);
    const filtered = type ? all.filter((p) => p.type === type) : all;
    return filtered.sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt),
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global long-form post store. */
export const longFormStore = new LongFormStore();
