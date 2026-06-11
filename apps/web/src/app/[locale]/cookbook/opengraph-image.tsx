import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "API cookbook";
export { size, contentType } from "@/components/og/ContentOG";

export default async function CookbookOG() {
  return renderContentOG({
    eyebrow: "Cookbook",
    title: "Recipes for the Aegis Lens API",
    tagline:
      "Fetch events, paginate, filter, subscribe to feeds, build a region dashboard. Copy-pasteable in cURL / TypeScript / Python.",
  });
}
