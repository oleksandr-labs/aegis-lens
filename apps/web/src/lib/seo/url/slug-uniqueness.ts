/**
 * Per-template slug uniqueness audit.
 *
 * Duplicate slugs within the same template cause route collisions and
 * cannibalize each other in search. This module groups generated slugs by
 * template and reports any collisions. Slug equality is case-insensitive and
 * trailing-slash-insensitive (matching the edge normalization policy).
 *
 * See TODO/seo/TODO_url_seo.md. Pure / testable.
 */

export interface TemplateSlug {
  template: string;
  slug: string;
  /** Optional entity id for reporting which records collide. */
  id?: string;
}

export interface SlugCollision {
  template: string;
  slug: string;
  /** ids (or slugs, if no id) that map to the same normalized slug. */
  members: string[];
}

export interface UniquenessReport {
  total: number;
  collisions: SlugCollision[];
  ok: boolean;
}

function normalizeSlug(slug: string): string {
  return slug.trim().toLowerCase().replace(/\/+$/, "");
}

/** Audit slug uniqueness, scoped per template. */
export function auditSlugUniqueness(slugs: TemplateSlug[]): UniquenessReport {
  // Map<template, Map<normalizedSlug, members[]>>
  const groups = new Map<string, Map<string, string[]>>();

  for (const s of slugs) {
    const norm = normalizeSlug(s.slug);
    const perTemplate = groups.get(s.template) ?? new Map<string, string[]>();
    const members = perTemplate.get(norm) ?? [];
    members.push(s.id ?? s.slug);
    perTemplate.set(norm, members);
    groups.set(s.template, perTemplate);
  }

  const collisions: SlugCollision[] = [];
  for (const [template, perTemplate] of groups) {
    for (const [slug, members] of perTemplate) {
      if (members.length > 1) {
        collisions.push({ template, slug, members });
      }
    }
  }

  return { total: slugs.length, collisions, ok: collisions.length === 0 };
}
