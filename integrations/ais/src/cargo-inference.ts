/**
 * Cargo / class inference (where lawful).
 *
 * We never claim to know a private cargo manifest. Where lawful, we infer a
 * BROAD cargo class from already-public AIS signals: ship type, declared
 * destination, draught, and ship-name keywords. This mirrors the keyword
 * heuristic in integrations/missiles/src/classifier.ts and returns a confidence
 * + sourceCount schema so a future ML model can be swapped in transparently.
 */

import type { CargoClass, ShipType, Scored } from "./types";

interface CargoInferenceInput {
  ship_type: ShipType;
  destination: string | null;
  draught_m: number | null;
  ship_name: string | null;
}

/** Keyword patterns over destination + ship name (EN + UK). */
const NAME_PATTERNS: Array<{ keywords: string[]; cargo: CargoClass; confidence: number }> = [
  { keywords: ["crude", "vlcc", "suezmax", "aframax", "нафта", "сира нафта"], cargo: "crude_oil", confidence: 0.72 },
  { keywords: ["product", "products tanker", "diesel", "gasoil", "нафтопродукт", "дизель"], cargo: "refined_products", confidence: 0.7 },
  { keywords: ["lng", "liquefied natural", "зрідженого газу", "спг"], cargo: "lng", confidence: 0.8 },
  { keywords: ["lpg", "gas carrier", "propane", "пропан", "скраплений газ"], cargo: "lpg", confidence: 0.75 },
  { keywords: ["chemical", "chem tanker", "хімі", "хімовоз"], cargo: "chemicals", confidence: 0.72 },
  { keywords: ["grain", "wheat", "corn", "зерно", "пшениц", "кукурудз"], cargo: "grain", confidence: 0.7 },
  { keywords: ["bulk", "bulker", "ore", "coal", "балкер", "руда", "вугілля"], cargo: "dry_bulk", confidence: 0.68 },
  { keywords: ["container", "feeder", "контейнер"], cargo: "containers", confidence: 0.78 },
  { keywords: ["ro-ro", "roro", "vehicles carrier", "car carrier", "поромн"], cargo: "ro_ro", confidence: 0.74 },
  { keywords: ["passenger", "ferry", "cruise", "пасажир", "паром", "круїз"], cargo: "passengers", confidence: 0.8 },
];

/** Default cargo class per ship type when no keyword fires. */
const TYPE_DEFAULTS: Partial<Record<ShipType, { cargo: CargoClass; confidence: number }>> = {
  tanker: { cargo: "refined_products", confidence: 0.5 },
  cargo: { cargo: "general_cargo", confidence: 0.5 },
  passenger: { cargo: "passengers", confidence: 0.7 },
  fishing: { cargo: "general_cargo", confidence: 0.3 },
};

/**
 * Infer a broad cargo class. Returns null for ship types where cargo inference
 * is meaningless (military, sar, pleasure, tugboat, pilot).
 */
export function inferCargoClass(input: CargoInferenceInput): Scored<CargoClass> | null {
  const { ship_type } = input;
  if (
    ship_type === "military" ||
    ship_type === "sar" ||
    ship_type === "pleasure" ||
    ship_type === "tugboat" ||
    ship_type === "pilot" ||
    ship_type === "sailing"
  ) {
    return null;
  }

  const haystack = `${input.destination ?? ""} ${input.ship_name ?? ""}`.toLowerCase();

  let sourceCount = 0;
  let best: { cargo: CargoClass; confidence: number } | null = null;
  for (const p of NAME_PATTERNS) {
    if (p.keywords.some((kw) => haystack.includes(kw))) {
      sourceCount += 1;
      // Tankers should not be classified as dry bulk/containers and vice versa.
      if (!typeConsistent(ship_type, p.cargo)) continue;
      if (!best || p.confidence > best.confidence) best = { cargo: p.cargo, confidence: p.confidence };
    }
  }

  // Deep-draught tanker with no other signal → likely crude.
  if (!best && ship_type === "tanker" && (input.draught_m ?? 0) >= 14) {
    best = { cargo: "crude_oil", confidence: 0.55 };
    sourceCount += 1;
  }

  if (!best) {
    const def = TYPE_DEFAULTS[ship_type];
    if (!def) return { value: "unknown", confidence: 0.2, sourceCount: 0 };
    return { value: def.cargo, confidence: def.confidence, sourceCount: 0 };
  }

  return { value: best.cargo, confidence: best.confidence, sourceCount: Math.max(1, sourceCount) };
}

/** Reject cargo classes that contradict the AIS ship type. */
function typeConsistent(ship_type: ShipType, cargo: CargoClass): boolean {
  const liquid: CargoClass[] = ["crude_oil", "refined_products", "lng", "lpg", "chemicals"];
  const dry: CargoClass[] = ["dry_bulk", "grain", "containers", "general_cargo", "ro_ro"];
  if (ship_type === "tanker") return liquid.includes(cargo);
  if (ship_type === "cargo") return dry.includes(cargo);
  if (ship_type === "passenger") return cargo === "passengers" || cargo === "ro_ro";
  return true;
}
