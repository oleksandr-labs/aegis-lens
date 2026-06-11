import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Companies by HQ city";
export { size, contentType } from "@/components/og/ContentOG";

export default async function CompaniesNearIndexOG() {
  return renderContentOG({
    eyebrow: "Geo-aware directory",
    title: "Defense, OSINT, and cyber companies by HQ city",
    tagline:
      "Browse the catalogue by city, see what's headquartered where, and find nearby companies within a configurable radius.",
  });
}
