import { INVESTIGATIONS, type Investigation } from "@/lib/investigations-seed";
import { GUIDES, type Guide } from "@/lib/guides-seed";
import { EQUIPMENT, type EquipmentSeed } from "@/lib/seed-data";

/**
 * Cross-cutting tag index. Synthesizes a single canonical tag namespace from:
 *  - investigations.tags    (free-form)
 *  - guides.tags            (free-form)
 *  - equipment.type         (treated as one tag per equipment)
 *
 * Each tag entry exposes the items that share it across surfaces.
 */
export function tagSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type TagView = {
  slug: string;
  /** Canonical display label (longest source label wins, for legibility). */
  label: string;
  investigations: Investigation[];
  guides: Guide[];
  equipment: EquipmentSeed[];
  total: number;
};

export function listTags(): TagView[] {
  const map = new Map<string, TagView>();

  const bump = (rawLabel: string, key: keyof Omit<TagView, "slug" | "label" | "total">, item: unknown) => {
    const slug = tagSlug(rawLabel);
    if (!slug) return;
    const v = map.get(slug) ?? {
      slug,
      label: rawLabel,
      investigations: [],
      guides: [],
      equipment: [],
      total: 0,
    };
    // Pick the longest label as canonical (most legible).
    if (rawLabel.length > v.label.length) v.label = rawLabel;
    (v[key] as unknown[]).push(item);
    v.total = v.investigations.length + v.guides.length + v.equipment.length;
    map.set(slug, v);
  };

  for (const inv of INVESTIGATIONS) {
    for (const t of inv.tags) bump(t, "investigations", inv);
  }
  for (const g of GUIDES) {
    for (const t of g.tags) bump(t, "guides", g);
  }
  for (const eq of EQUIPMENT) {
    bump(eq.type, "equipment", eq);
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function getTag(slug: string): TagView | null {
  return listTags().find((t) => t.slug === slug) ?? null;
}
