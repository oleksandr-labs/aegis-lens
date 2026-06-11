import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Trust";
export { size, contentType } from "@/components/og/ContentOG";

export default async function TrustOG() {
  return renderContentOG({
    eyebrow: "Trust",
    title: "Data policy, transparency, corrections",
    tagline:
      "What we collect, what we publish, who we report it to, and how we correct mistakes when we make them.",
  });
}
