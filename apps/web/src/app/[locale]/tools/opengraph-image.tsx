import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "OSINT tools";
export { size, contentType } from "@/components/og/ContentOG";

export default async function ToolsOG() {
  return renderContentOG({
    eyebrow: "Tools",
    title: "OSINT, geospatial, and verification tools",
    tagline:
      "Catalogue of analyst tooling — OSM, Sentinel Hub, Maltego, Spiderfoot, TinEye, Mapillary, and many more.",
  });
}
