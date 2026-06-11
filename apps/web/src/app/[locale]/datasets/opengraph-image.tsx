import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Datasets";
export { size, contentType } from "@/components/og/ContentOG";

export default async function DatasetsOG() {
  return renderContentOG({
    eyebrow: "Datasets",
    title: "Open data from Aegis Lens",
    tagline:
      "Events, sources, glossary, equipment, geography, OpenAPI, Postman — under CC-BY-4.0 with stable download URLs.",
  });
}
