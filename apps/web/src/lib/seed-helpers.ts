import { GLOSSARY, type GlossarySeed, EQUIPMENT, type EquipmentSeed } from "@/lib/seed-data";

export function getGlossaryEntry(slug: string): GlossarySeed | null {
  return GLOSSARY.find((g) => g.slug === slug) ?? null;
}

export function getEquipment(slug: string): EquipmentSeed | null {
  return EQUIPMENT.find((e) => e.slug === slug) ?? null;
}
