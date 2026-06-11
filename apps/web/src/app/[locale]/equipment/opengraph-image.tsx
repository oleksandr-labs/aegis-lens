import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Equipment catalogue";
export { size, contentType } from "@/components/og/ContentOG";

export default async function EquipmentOG() {
  return renderContentOG({
    eyebrow: "Equipment",
    title: "Weapons systems and platforms catalogue",
    tagline:
      "Drones, air defense, artillery, tanks, ships, missiles — type, country of origin, primary operator.",
  });
}
