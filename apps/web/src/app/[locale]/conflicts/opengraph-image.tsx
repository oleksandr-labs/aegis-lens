import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Conflicts";
export { size, contentType } from "@/components/og/ContentOG";

export default async function ConflictsOG() {
  return renderContentOG({
    eyebrow: "Conflicts",
    title: "Tracked conflicts",
    tagline:
      "Active and frozen conflicts catalogued by Aegis Lens — regions affected, status, and current intel layer.",
  });
}
