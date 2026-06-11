import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Careers";
export { size, contentType } from "@/components/og/ContentOG";

export default async function CareersOG() {
  return renderContentOG({
    eyebrow: "Careers",
    title: "Build the OSINT platform we want to use",
    tagline:
      "Engineering, analysis, geospatial, trust & safety, GTM. Remote, Kyiv, EU.",
  });
}
