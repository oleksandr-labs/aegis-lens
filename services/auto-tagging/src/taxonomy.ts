/**
 * Hierarchical tag taxonomy for Aegis Lens.
 * Top-level → Sub → Micro levels.
 * IDs are language-agnostic slugs; display names are localized.
 */

export interface TaxonomyNode {
  id: string;
  parent?: string;
  /** Level: 0 = top, 1 = sub, 2 = micro */
  level: 0 | 1 | 2;
  displayName: { en: string; uk: string };
  /** Slug aliases (for matching) */
  aliases?: string[];
  /** Whether this tag is deprecated */
  deprecated?: boolean;
}

export const TAXONOMY: TaxonomyNode[] = [
  // ── Military Activity ─────────────────────────────────────────────────────
  { id: "military", level: 0, displayName: { en: "Military Activity", uk: "Військова активність" } },
  { id: "military.strike", parent: "military", level: 1, displayName: { en: "Strike", uk: "Удар" } },
  { id: "military.strike.drone", parent: "military.strike", level: 2, displayName: { en: "Drone Strike", uk: "Удар дроном" }, aliases: ["uav", "shahed", "fpv", "lancet"] },
  { id: "military.strike.missile", parent: "military.strike", level: 2, displayName: { en: "Missile Strike", uk: "Ракетний удар" }, aliases: ["cruise", "ballistic", "hypersonic", "kalibr", "kinzhal", "iskander"] },
  { id: "military.strike.artillery", parent: "military.strike", level: 2, displayName: { en: "Artillery", uk: "Артилерія" }, aliases: ["shelling", "grad", "mlrs", "rсзо"] },
  { id: "military.strike.airstrike", parent: "military.strike", level: 2, displayName: { en: "Airstrike", uk: "Авіаудар" }, aliases: ["bomb", "glide bomb"] },
  { id: "military.ground", parent: "military", level: 1, displayName: { en: "Ground Combat", uk: "Наземний бій" } },
  { id: "military.ground.advance", parent: "military.ground", level: 2, displayName: { en: "Advance", uk: "Наступ" } },
  { id: "military.ground.retreat", parent: "military.ground", level: 2, displayName: { en: "Retreat", uk: "Відступ" } },
  { id: "military.interception", parent: "military", level: 1, displayName: { en: "Interception", uk: "Перехоплення" }, aliases: ["shot down", "збито", "air defense"] },

  // ── Infrastructure ────────────────────────────────────────────────────────
  { id: "infrastructure", level: 0, displayName: { en: "Infrastructure", uk: "Інфраструктура" } },
  { id: "infrastructure.energy", parent: "infrastructure", level: 1, displayName: { en: "Energy", uk: "Енергетика" } },
  { id: "infrastructure.energy.power_plant", parent: "infrastructure.energy", level: 2, displayName: { en: "Power Plant", uk: "Електростанція" } },
  { id: "infrastructure.energy.substation", parent: "infrastructure.energy", level: 2, displayName: { en: "Substation", uk: "Підстанція" } },
  { id: "infrastructure.transport", parent: "infrastructure", level: 1, displayName: { en: "Transport", uk: "Транспорт" } },
  { id: "infrastructure.transport.bridge", parent: "infrastructure.transport", level: 2, displayName: { en: "Bridge", uk: "Міст" } },
  { id: "infrastructure.transport.railway", parent: "infrastructure.transport", level: 2, displayName: { en: "Railway", uk: "Залізниця" } },
  { id: "infrastructure.telecom", parent: "infrastructure", level: 1, displayName: { en: "Telecom", uk: "Телекомунікації" } },
  { id: "infrastructure.water", parent: "infrastructure", level: 1, displayName: { en: "Water Supply", uk: "Водопостачання" } },
  { id: "infrastructure.healthcare", parent: "infrastructure", level: 1, displayName: { en: "Healthcare", uk: "Охорона здоров'я" } },

  // ── Humanitarian ──────────────────────────────────────────────────────────
  { id: "humanitarian", level: 0, displayName: { en: "Humanitarian", uk: "Гуманітарна ситуація" } },
  { id: "humanitarian.displacement", parent: "humanitarian", level: 1, displayName: { en: "Displacement", uk: "Переміщення" } },
  { id: "humanitarian.evacuation", parent: "humanitarian", level: 1, displayName: { en: "Evacuation", uk: "Евакуація" } },
  { id: "humanitarian.casualties", parent: "humanitarian", level: 1, displayName: { en: "Casualties", uk: "Жертви" } },
  { id: "humanitarian.aid", parent: "humanitarian", level: 1, displayName: { en: "Aid Delivery", uk: "Гуманітарна допомога" } },

  // ── Security ─────────────────────────────────────────────────────────────
  { id: "security", level: 0, displayName: { en: "Security", uk: "Безпека" } },
  { id: "security.cyber", parent: "security", level: 1, displayName: { en: "Cyberattack", uk: "Кібератака" } },
  { id: "security.comms_outage", parent: "security", level: 1, displayName: { en: "Comms Outage", uk: "Відключення зв'язку" } },
  { id: "security.disinformation", parent: "security", level: 1, displayName: { en: "Disinformation", uk: "Дезінформація" } },

  // ── Environment / Disaster ────────────────────────────────────────────────
  { id: "environment", level: 0, displayName: { en: "Environment", uk: "Навколишнє середовище" } },
  { id: "environment.fire", parent: "environment", level: 1, displayName: { en: "Fire", uk: "Пожежа" } },
  { id: "environment.explosion", parent: "environment", level: 1, displayName: { en: "Explosion", uk: "Вибух" } },
  { id: "environment.radiation", parent: "environment", level: 1, displayName: { en: "Radiation Risk", uk: "Радіаційна небезпека" } },
  { id: "environment.chemical", parent: "environment", level: 1, displayName: { en: "Chemical Hazard", uk: "Хімічна небезпека" } },
  { id: "environment.flood", parent: "environment", level: 1, displayName: { en: "Flooding", uk: "Затоплення" } },
];

const _byId = new Map<string, TaxonomyNode>(TAXONOMY.map((n) => [n.id, n]));
const _aliasMap = new Map<string, string>(); // alias → tag id
TAXONOMY.forEach((node) => {
  (node.aliases ?? []).forEach((a) => _aliasMap.set(a.toLowerCase(), node.id));
  _aliasMap.set(node.id, node.id);
  _aliasMap.set(node.displayName.en.toLowerCase(), node.id);
  _aliasMap.set(node.displayName.uk.toLowerCase(), node.id);
});

export function getNode(id: string): TaxonomyNode | undefined {
  return _byId.get(id);
}

export function resolveAlias(term: string): string | undefined {
  return _aliasMap.get(term.toLowerCase());
}

/** Return all ancestors of a tag (top → self). */
export function ancestors(id: string): TaxonomyNode[] {
  const chain: TaxonomyNode[] = [];
  let current: TaxonomyNode | undefined = _byId.get(id);
  while (current) {
    chain.unshift(current);
    current = current.parent ? _byId.get(current.parent) : undefined;
  }
  return chain;
}

/** All top-level nodes. */
export function topLevelNodes(): TaxonomyNode[] {
  return TAXONOMY.filter((n) => n.level === 0);
}
