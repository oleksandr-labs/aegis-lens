import { SPEC } from "../openapi.json/route";

/**
 * YAML rendering of the OpenAPI 3.1 spec. Many code-gen tools default to
 * YAML; we keep the JSON spec as the canonical source and emit YAML on
 * demand from a small dependency-free serializer.
 *
 * Limitations: handles strings, numbers, booleans, null, arrays, and
 * plain objects — which is everything our spec uses. Refuses cycles
 * implicitly by relying on the spec being a tree.
 */
export const dynamic = "force-dynamic";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function needsQuoting(s: string): boolean {
  if (s === "") return true;
  if (/^[-?:,\[\]{}#&*!|>'"%@`]/.test(s)) return true;
  if (/[:#]\s|\s#/.test(s)) return true;
  if (/[\n\r\t]/.test(s)) return true;
  if (/^(true|false|null|yes|no|on|off|~)$/i.test(s)) return true;
  if (/^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) return true;
  return false;
}

function quote(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")}"`;
}

function scalar(v: unknown): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "null";
  if (typeof v === "string") return needsQuoting(v) ? quote(v) : v;
  return quote(String(v));
}

function yamlify(value: unknown, indent: number): string {
  const pad = "  ".repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        if (Array.isArray(item) || isPlainObject(item)) {
          const inner = yamlify(item, indent + 1).replace(/^ {2}/, "");
          return `${pad}- ${inner.trimStart()}`;
        }
        return `${pad}- ${scalar(item)}`;
      })
      .join("\n");
  }

  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0) return "{}";
    return keys
      .map((k) => {
        const v = (value as Record<string, unknown>)[k];
        const keyOut = needsQuoting(k) ? quote(k) : k;
        if (Array.isArray(v) || isPlainObject(v)) {
          const empty =
            (Array.isArray(v) && v.length === 0) ||
            (isPlainObject(v) && Object.keys(v).length === 0);
          if (empty) return `${pad}${keyOut}: ${Array.isArray(v) ? "[]" : "{}"}`;
          return `${pad}${keyOut}:\n${yamlify(v, indent + 1)}`;
        }
        return `${pad}${keyOut}: ${scalar(v)}`;
      })
      .join("\n");
  }

  return `${pad}${scalar(value)}`;
}

export function GET(): Response {
  const yaml = `# OpenAPI 3.1 spec for Aegis Lens — YAML rendering.\n# Canonical source: /api/openapi.json\n${yamlify(SPEC, 0)}\n`;
  return new Response(yaml, {
    headers: {
      "Content-Type": "application/yaml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=900",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
