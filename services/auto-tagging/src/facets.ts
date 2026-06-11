/**
 * Filter integration — every tag is a filter facet.
 *
 * Bridges the taxonomy to the search/map filter UI:
 *   - `buildFacetTree()`     → hierarchical facet model for a sidebar.
 *   - `facetCounts()`        → counts per tag from a set of tagged items
 *                              (parent counts roll up descendants).
 *   - `tagsToFilterParams()` / `parseFilterParams()` → URL query <-> selected tags,
 *     so a tag click is a shareable, bookmarkable filter state.
 *   - `eventMatchesFacets()` → server-side predicate to apply a tag filter.
 *
 * Selection semantics: tags are OR-ed within a top-level group and AND-ed
 * across groups (standard faceted-search behaviour). A parent tag matches any
 * of its descendants.
 */

import { TAXONOMY, TaxonomyNode, ancestors, getNode } from "./taxonomy";

export interface FacetNode {
  tagId: string;
  level: 0 | 1 | 2;
  labelEn: string;
  labelUk: string;
  count: number;
  children: FacetNode[];
}

export interface TaggedItem {
  /** All tag IDs on the item, including ancestors (as produced by `tagText().allTagIds`). */
  tagIds: string[];
}

/** Localised label for a facet, falling back to EN then the raw id. */
export function facetLabel(tagId: string, locale: "en" | "uk" = "en"): string {
  const node = getNode(tagId);
  if (!node) return tagId;
  return node.displayName[locale] ?? node.displayName.en ?? tagId;
}

/**
 * Build a hierarchical facet tree from the taxonomy, optionally annotated with
 * counts from a corpus of tagged items. Deprecated tags are excluded.
 */
export function buildFacetTree(items: TaggedItem[] = []): FacetNode[] {
  const counts = facetCounts(items);
  const byId = new Map<string, FacetNode>();

  for (const node of TAXONOMY) {
    if (node.deprecated) continue;
    byId.set(node.id, {
      tagId: node.id,
      level: node.level,
      labelEn: node.displayName.en,
      labelUk: node.displayName.uk,
      count: counts.get(node.id) ?? 0,
      children: [],
    });
  }

  const roots: FacetNode[] = [];
  for (const node of TAXONOMY) {
    if (node.deprecated) continue;
    const facet = byId.get(node.id)!;
    if (node.parent && byId.has(node.parent)) byId.get(node.parent)!.children.push(facet);
    else if (!node.parent) roots.push(facet);
  }
  return roots;
}

/**
 * Count items per tag. Each item contributes 1 to every tag it carries AND to
 * all of that tag's ancestors (so a parent facet reflects its whole subtree),
 * de-duplicated per item.
 */
export function facetCounts(items: TaggedItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const expanded = new Set<string>();
    for (const id of item.tagIds) {
      for (const a of ancestors(id)) expanded.add(a.id);
      if (getNode(id)) expanded.add(id);
    }
    for (const id of expanded) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

// ── URL query <-> selected tags ──────────────────────────────────────────────

export const FILTER_PARAM = "tags";

/** Serialise selected tag IDs into a URL query string fragment, e.g. `tags=military.strike.drone,infrastructure`. */
export function tagsToFilterParams(selected: string[]): string {
  const valid = selected.filter((id) => getNode(id));
  if (!valid.length) return "";
  const params = new URLSearchParams();
  params.set(FILTER_PARAM, valid.join(","));
  return params.toString();
}

/** Parse a URL query string (or URLSearchParams) back into selected, validated tag IDs. */
export function parseFilterParams(query: string | URLSearchParams): string[] {
  const params = typeof query === "string" ? new URLSearchParams(query) : query;
  const raw = params.get(FILTER_PARAM);
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((id) => id && getNode(id));
}

/**
 * Group selected tag IDs by their top-level ancestor. Used to apply
 * AND-across-groups / OR-within-group matching.
 */
export function groupByTopLevel(selected: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  for (const id of selected) {
    if (!getNode(id)) continue;
    const top = id.split(".")[0];
    groups.set(top, [...(groups.get(top) ?? []), id]);
  }
  return groups;
}

/**
 * Server-side predicate: does an item match the selected facet filter?
 * Empty selection matches everything. A selected tag matches the item if the
 * item carries that tag OR any descendant of it.
 */
export function eventMatchesFacets(itemTagIds: string[], selected: string[]): boolean {
  if (!selected.length) return true;
  const itemSet = new Set(itemTagIds);
  const groups = groupByTopLevel(selected);

  // AND across top-level groups…
  for (const groupTags of groups.values()) {
    // …OR within a group.
    const hit = groupTags.some((sel) =>
      itemSet.has(sel) || [...itemSet].some((it) => it === sel || it.startsWith(`${sel}.`)),
    );
    if (!hit) return false;
  }
  return true;
}

/**
 * Filter a corpus of tagged items by a facet selection (convenience wrapper).
 */
export function filterByFacets<T extends TaggedItem>(items: T[], selected: string[]): T[] {
  if (!selected.length) return items;
  return items.filter((it) => eventMatchesFacets(it.tagIds, selected));
}

/** A flat facet option list (for chips / multiselect UIs), with localised labels. */
export interface FacetOption {
  tagId: string;
  label: string;
  level: 0 | 1 | 2;
  count: number;
}

export function facetOptions(items: TaggedItem[] = [], locale: "en" | "uk" = "en"): FacetOption[] {
  const counts = facetCounts(items);
  return TAXONOMY.filter((n) => !n.deprecated).map((n: TaxonomyNode) => ({
    tagId: n.id,
    label: n.displayName[locale] ?? n.displayName.en,
    level: n.level,
    count: counts.get(n.id) ?? 0,
  }));
}
