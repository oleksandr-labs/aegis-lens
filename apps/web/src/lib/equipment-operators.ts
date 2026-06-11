import { EQUIPMENT, type EquipmentSeed } from "@/lib/seed-data";

/**
 * Equipment × operator helpers. "Operator" here means country-of-origin /
 * primary operator country. Derived heuristically from EquipmentSeed.origin
 * since the seed doesn't (yet) carry a structured `operators` field.
 */

/** Strip trailing parenthesized vendor + slash-separated co-operators. */
export function primaryOperator(origin: string): string {
  const head = origin.split(/[\(\/]/)[0].trim();
  return head.length > 0 ? head : origin;
}

export function operatorSlug(operator: string): string {
  return operator
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function listEquipmentOperatorPairs(): {
  equipmentSlug: string;
  operatorSlug: string;
  operatorLabel: string;
  equipment: EquipmentSeed;
}[] {
  const seen = new Set<string>();
  const out: ReturnType<typeof listEquipmentOperatorPairs> = [];
  for (const eq of EQUIPMENT) {
    const opLabel = primaryOperator(eq.origin);
    const opSlug = operatorSlug(opLabel);
    if (!opSlug) continue;
    const key = `${eq.slug}|${opSlug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      equipmentSlug: eq.slug,
      operatorSlug: opSlug,
      operatorLabel: opLabel,
      equipment: eq,
    });
  }
  return out;
}

export function getEquipmentOperatorPair(
  equipmentSlug: string,
  opSlug: string,
): { equipment: EquipmentSeed; operatorLabel: string } | null {
  const eq = EQUIPMENT.find((e) => e.slug === equipmentSlug);
  if (!eq) return null;
  const opLabel = primaryOperator(eq.origin);
  if (operatorSlug(opLabel) !== opSlug) return null;
  return { equipment: eq, operatorLabel: opLabel };
}

/** Other equipment that shares the same primary operator. */
export function siblingEquipmentByOperator(opSlug: string): EquipmentSeed[] {
  return EQUIPMENT.filter((e) => operatorSlug(primaryOperator(e.origin)) === opSlug);
}
