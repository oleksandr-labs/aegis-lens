import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Companies";
export { size, contentType } from "@/components/og/ContentOG";

export default async function CompaniesOG() {
  return renderContentOG({
    eyebrow: "Directory",
    title: "OSINT, cybersecurity, geospatial, and defense companies",
    tagline:
      "Browse the Aegis Lens directory — by industry, region, city, or alphabetical.",
  });
}
