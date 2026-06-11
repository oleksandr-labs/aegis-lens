import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Entities — knowledge graph";
export { size, contentType } from "@/components/og/ContentOG";

export default async function EntitiesOG() {
  return renderContentOG({
    eyebrow: "Entities",
    title: "The Aegis Lens knowledge graph",
    tagline:
      "Organizations, units, platforms, places — and the events, investigations, and equipment that link them.",
  });
}
