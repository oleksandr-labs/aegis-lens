import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "FAQ";
export { size, contentType } from "@/components/og/ContentOG";

export default async function FaqOG() {
  return renderContentOG({
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    tagline:
      "What Aegis Lens is, how events are verified, how scoring works, and how to access the data.",
  });
}
