/**
 * Category tree loader + validator.
 *
 * The machine-readable source of truth lives at data/taxonomy/category-tree.yaml.
 * This module mirrors it as typed objects and provides traversal + validation
 * so the filter UI, URL builder, and KG facets share one definition.
 */

export interface CategoryNode {
  slug: string;
  name_en: string;
  name_uk: string;
  parent: string | null;
  synonyms: string[];
  children?: CategoryNode[];
}

/** The 10 top-level categories (mirrors category-tree.yaml). */
export const TOP_LEVEL_SLUGS = [
  "military-defense",
  "infrastructure",
  "cyber",
  "humanitarian",
  "maritime",
  "aviation",
  "politics-diplomacy",
  "economy-sanctions",
  "information-environment",
  "environment-climate",
] as const;

export type TopLevelSlug = (typeof TOP_LEVEL_SLUGS)[number];

/**
 * Flatten a category tree into a slug → node map for O(1) lookup.
 */
export function flattenTree(roots: CategoryNode[]): Map<string, CategoryNode> {
  const map = new Map<string, CategoryNode>();
  const walk = (node: CategoryNode) => {
    map.set(node.slug, node);
    node.children?.forEach(walk);
  };
  roots.forEach(walk);
  return map;
}

/**
 * Validate a category tree:
 *  - unique slugs
 *  - parent references resolve
 *  - every node has EN + UK names
 */
export function validateTree(roots: CategoryNode[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seen = new Set<string>();
  const all = flattenTree(roots);

  const walk = (node: CategoryNode, expectedParent: string | null) => {
    if (seen.has(node.slug)) errors.push(`Duplicate slug: ${node.slug}`);
    seen.add(node.slug);

    if (!/^[a-z0-9-]+$/.test(node.slug)) errors.push(`Invalid slug format: ${node.slug}`);
    if (!node.name_en) errors.push(`Missing name_en: ${node.slug}`);
    if (!node.name_uk) errors.push(`Missing name_uk: ${node.slug}`);
    if (node.parent !== expectedParent) {
      errors.push(`Parent mismatch on ${node.slug}: declared "${node.parent}", expected "${expectedParent}"`);
    }
    if (node.parent !== null && !all.has(node.parent)) {
      errors.push(`Dangling parent reference on ${node.slug}: "${node.parent}"`);
    }

    node.children?.forEach((c) => walk(c, node.slug));
  };

  roots.forEach((r) => walk(r, null));
  return { valid: errors.length === 0, errors };
}

/** Build the full ancestor path of slugs for URL/breadcrumb purposes. */
export function pathTo(slug: string, all: Map<string, CategoryNode>): string[] {
  const path: string[] = [];
  let current = all.get(slug);
  while (current) {
    path.unshift(current.slug);
    current = current.parent ? all.get(current.parent) : undefined;
  }
  return path;
}

/** Canonical URL for a category page. */
export function categoryUrl(slug: string, all: Map<string, CategoryNode>, locale = "en"): string {
  const path = pathTo(slug, all);
  return `/${locale}/topics/${path.join("/")}`;
}
