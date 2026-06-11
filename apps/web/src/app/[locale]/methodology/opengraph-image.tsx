import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Methodology";
export { size, contentType } from "@/components/og/ContentOG";

export default async function MethodologyOG() {
  return renderContentOG({
    eyebrow: "Methodology",
    title: "How we know what we publish",
    tagline:
      "Source tiering, the seven-check verification workflow, geolocation precision, calibrated scoring, editorial ethics.",
  });
}
