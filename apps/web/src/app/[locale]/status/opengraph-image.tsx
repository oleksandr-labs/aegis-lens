import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Status";
export { size, contentType } from "@/components/og/ContentOG";

export default async function StatusOG() {
  return renderContentOG({
    eyebrow: "Status",
    title: "Aegis Lens system status",
    tagline:
      "Ingest pipeline, geocoding, LLM enrichment, public API, map tiles, database — current state and recent incidents.",
  });
}
