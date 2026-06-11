import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Glossary";
export { size, contentType } from "@/components/og/ContentOG";

export default async function GlossaryOG() {
  return renderContentOG({
    eyebrow: "Glossary",
    title: "OSINT, conflict, and security terminology",
    tagline:
      "Controlled vocabulary across OSINT methods, military / cyber doctrine, verification, humanitarian, maritime, geospatial.",
  });
}
