/**
 * Related-posts ranking for blog posts. Drives the "Related reading" block on
 * every post page — internal links between topically-adjacent posts.
 *
 * The existing `blog-data.ts#relatedDataPosts` only matches same-category. This
 * upgrades to a TF-style overlap score across category + tags + title terms, so
 * cross-category-but-on-topic posts can surface. Pure & deterministic.
 *
 * Integration point: pass `BLOG_POSTS` (from `blog-seed.ts`) mapped to
 * {@link RelatablePost}. When embeddings land, swap {@link postVector}.
 */

export type RelatablePost = {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  /** ISO date. */
  publishedAt: string;
};

export type ScoredPost = { item: RelatablePost; score: number };

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "of", "to", "in", "on", "for", "with",
  "what", "how", "why", "we", "our", "is", "are", "at", "by", "from",
]);

function titleTerms(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/**
 * Weighted bag-of-features for a post:
 *   tag:<t> (weight 1.0), term:<w> from title (0.4), cat:<c> (0.8).
 */
export function postVector(p: RelatablePost): Map<string, number> {
  const v = new Map<string, number>();
  for (const t of p.tags) v.set(`tag:${t.toLowerCase()}`, 1.0);
  for (const w of titleTerms(p.title)) {
    v.set(`term:${w}`, Math.max(v.get(`term:${w}`) ?? 0, 0.4));
  }
  v.set(`cat:${p.category.toLowerCase()}`, 0.8);
  return v;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [k, va] of a) {
    na += va * va;
    const vb = b.get(k);
    if (vb !== undefined) dot += va * vb;
  }
  for (const vb of b.values()) nb += vb * vb;
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function postSimilarity(a: RelatablePost, b: RelatablePost): number {
  return cosine(postVector(a), postVector(b));
}

/**
 * Rank related posts for `target`. Excludes self + zero-similarity. Falls back
 * to same-category recency when nothing overlaps, so the block is never empty
 * on a post that has at least one sibling in its category.
 */
export function rankRelatedPosts(
  target: RelatablePost,
  pool: RelatablePost[],
  limit = 3,
): ScoredPost[] {
  const others = pool.filter((p) => p.slug !== target.slug);
  const scored = others
    .map((p) => ({ item: p, score: postSimilarity(target, p) }))
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Date.parse(b.item.publishedAt) - Date.parse(a.item.publishedAt),
    );

  if (scored.length >= limit) return scored.slice(0, limit);

  // Backfill with same-category recents not already chosen.
  const chosen = new Set(scored.map((s) => s.item.slug));
  const backfill = others
    .filter((p) => !chosen.has(p.slug) && p.category === target.category)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .map((p) => ({ item: p, score: 0 }));

  return [...scored, ...backfill].slice(0, limit);
}
