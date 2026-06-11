import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Press kit";
export { size, contentType } from "@/components/og/ContentOG";

export default async function PressOG() {
  return renderContentOG({
    eyebrow: "Press",
    title: "Press kit — Aegis Lens",
    tagline:
      "Factsheet, spokespeople, brand assets, recent coverage. For media inquiries: press@aegislens.io.",
  });
}
