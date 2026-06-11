import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Aegis Lens briefs";
export { size, contentType } from "@/components/og/ContentOG";

export default async function BlogOG() {
  return renderContentOG({
    eyebrow: "Briefs",
    title: "Field briefs from Aegis Lens",
    tagline:
      "Short-form analysis between investigations: the lens, the context, the call.",
  });
}
