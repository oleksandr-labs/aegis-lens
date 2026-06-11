import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Sources";
export { size, contentType } from "@/components/og/ContentOG";

export default async function SourcesOG() {
  return renderContentOG({
    eyebrow: "Sources",
    title: "Public OSINT sources",
    tagline:
      "The directory of sources Aegis Lens relies on — alerts.in.ua, DeepStateMap, Oryx, ISW, Bellingcat, and more. Tiered, scored, transparent.",
  });
}
