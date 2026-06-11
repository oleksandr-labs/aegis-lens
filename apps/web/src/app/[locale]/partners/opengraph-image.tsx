import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Partners";
export { size, contentType } from "@/components/og/ContentOG";

export default async function PartnersOG() {
  return renderContentOG({
    eyebrow: "Partners",
    title: "Aegis Lens partner program",
    tagline:
      "Strategic / Implementation / OSINT-research tiers. Co-marketing assets, joint engagements, shared outcomes.",
  });
}
