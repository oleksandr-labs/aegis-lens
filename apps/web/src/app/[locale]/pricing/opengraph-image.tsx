import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Pricing";
export { size, contentType } from "@/components/og/ContentOG";

export default async function PricingOG() {
  return renderContentOG({
    eyebrow: "Pricing",
    title: "Free for individuals, real for teams",
    tagline:
      "Four tiers — Free / Pro / Team / Enterprise. Featured case studies from defense, journalism, NGO, finance, energy.",
  });
}
