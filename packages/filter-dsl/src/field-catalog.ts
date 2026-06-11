import { FieldDef, FieldName } from "./types";

export const FIELD_CATALOG: FieldDef[] = [
  { name: "class",              type: "string_enum", isPublic: true,  operators: ["eq","neq","in","nin"], description: "Event class (drone, missile, ...)" },
  { name: "subclass",           type: "string",      isPublic: true,  operators: ["eq","neq","in","contains"] },
  { name: "severity",           type: "integer",     isPublic: true,  operators: ["eq","neq","gt","gte","lt","lte","between","in"] },
  { name: "confidence",         type: "number",      isPublic: true,  operators: ["gt","gte","lt","lte","between"] },
  { name: "danger_score",       type: "integer",     isPublic: true,  operators: ["gt","gte","lt","lte","between"] },
  { name: "verification_state", type: "string_enum", isPublic: true,  operators: ["eq","neq","in","nin"] },
  { name: "is_public",          type: "boolean",     isPublic: false, operators: ["eq"] },
  { name: "is_retracted",       type: "boolean",     isPublic: true,  operators: ["eq"] },
  { name: "country",            type: "string",      isPublic: true,  operators: ["eq","neq","in","nin"] },
  { name: "region_code",        type: "string",      isPublic: true,  operators: ["eq","neq","in","nin"] },
  { name: "lat",                type: "number",      isPublic: true,  operators: ["gt","gte","lt","lte","between"] },
  { name: "lon",                type: "number",      isPublic: true,  operators: ["gt","gte","lt","lte","between"] },
  { name: "geom",               type: "geometry",    isPublic: true,  operators: ["near","within","intersects"] },
  { name: "occurred_at",        type: "datetime",    isPublic: true,  operators: ["gt","gte","lt","lte","between"] },
  { name: "ingested_at",        type: "datetime",    isPublic: true,  operators: ["gt","gte","lt","lte"] },
  { name: "source_id",          type: "string",      isPublic: true,  operators: ["eq","neq","in","nin"] },
  { name: "tags",               type: "string_array",isPublic: true,  operators: ["has","has_any","is_null","is_not_null"] },
  { name: "title_en",           type: "string",      isPublic: true,  operators: ["contains","starts_with","is_null","is_not_null"] },
  { name: "title_uk",           type: "string",      isPublic: true,  operators: ["contains","starts_with","is_null","is_not_null"] },
  { name: "org_id",             type: "string",      isPublic: false, operators: ["eq","in"] },
];

const _byName = new Map<string, FieldDef>(FIELD_CATALOG.map((f) => [f.name, f]));

export function getFieldDef(name: FieldName): FieldDef | undefined {
  return _byName.get(name);
}

export function publicFields(): FieldDef[] {
  return FIELD_CATALOG.filter((f) => f.isPublic);
}
