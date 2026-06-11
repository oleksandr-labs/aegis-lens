/**
 * Task 10 — Annotation tool (analyst drawing on imagery).
 *
 * Typed annotation geometry/label model with per-user scope. Analysts draw
 * points/lines/polygons over a scene to mark damage, positions, etc. Each
 * annotation is owned by a user and scoped to a visibility level.
 */

import type { I18nText, RegionCode } from "./types";

export type AnnotationGeometryType = "point" | "line" | "polygon" | "rectangle";

/** GeoJSON-style coordinate(s); shape depends on `type`. */
export type AnnotationCoordinates =
  | [number, number]                 // point: [lon, lat]
  | [number, number][]               // line: array of [lon, lat]
  | [number, number][][];            // polygon/rectangle: array of rings

export interface AnnotationGeometry {
  type: AnnotationGeometryType;
  coordinates: AnnotationCoordinates;
}

/** Who can see an annotation. */
export type AnnotationScope = "private" | "team" | "public";

export type AnnotationCategory =
  | "damage"
  | "military_position"
  | "infrastructure"
  | "note"
  | "other";

/** Display colors per category (matches the LAYER_PAINT_SPECS palette). */
export const ANNOTATION_COLORS: Record<AnnotationCategory, string> = {
  damage: "#ef4444",
  military_position: "#7c3aed",
  infrastructure: "#8b5cf6",
  note: "#f59e0b",
  other: "#94a3b8",
};

export const CATEGORY_LABELS: Record<AnnotationCategory, I18nText> = {
  damage: { en: "Damage", uk: "Пошкодження" },
  military_position: { en: "Military position", uk: "Військова позиція" },
  infrastructure: { en: "Infrastructure", uk: "Інфраструктура" },
  note: { en: "Note", uk: "Примітка" },
  other: { en: "Other", uk: "Інше" },
};

/** A single analyst annotation on a scene. */
export interface Annotation {
  annotationId: string;
  /** The user who created it (per-user scope). */
  ownerId: string;
  scope: AnnotationScope;

  geometry: AnnotationGeometry;
  category: AnnotationCategory;
  /** Free-text label (analyst's own language). */
  label?: string;
  color?: string;

  /** The scene / region this annotation is drawn over. */
  sceneId?: string;
  region?: RegionCode;

  createdAt: string;
  updatedAt: string;
}

/** Returns annotations a given user is allowed to see. */
export function visibleTo(
  annotations: Annotation[],
  user: { id: string; teamId?: string },
): Annotation[] {
  return annotations.filter((a) => {
    if (a.scope === "public") return true;
    if (a.ownerId === user.id) return true;
    // "team" scope requires a shared team — owner team membership is resolved
    // by the host app; here we conservatively allow team scope only to the owner.
    return false;
  });
}

/** Basic validity check for an annotation geometry. */
export function isValidGeometry(geom: AnnotationGeometry): boolean {
  if (geom.type === "point") {
    const c = geom.coordinates as [number, number];
    return Array.isArray(c) && c.length === 2 && typeof c[0] === "number";
  }
  if (geom.type === "line") {
    const c = geom.coordinates as [number, number][];
    return Array.isArray(c) && c.length >= 2;
  }
  // polygon / rectangle
  const rings = geom.coordinates as [number, number][][];
  return Array.isArray(rings) && rings.length >= 1 && rings[0].length >= 3;
}

/** Create a new annotation with timestamps + default color filled in. */
export function makeAnnotation(input: {
  annotationId: string;
  ownerId: string;
  geometry: AnnotationGeometry;
  category: AnnotationCategory;
  scope?: AnnotationScope;
  label?: string;
  sceneId?: string;
  region?: RegionCode;
}): Annotation {
  const now = new Date().toISOString();
  return {
    annotationId: input.annotationId,
    ownerId: input.ownerId,
    scope: input.scope ?? "private",
    geometry: input.geometry,
    category: input.category,
    label: input.label,
    color: ANNOTATION_COLORS[input.category],
    sceneId: input.sceneId,
    region: input.region,
    createdAt: now,
    updatedAt: now,
  };
}
