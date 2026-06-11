import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Changelog";
export { size, contentType } from "@/components/og/ContentOG";

export default async function ChangelogOG() {
  return renderContentOG({
    eyebrow: "Changelog",
    title: "What shipped, when, and why",
    tagline:
      "User-visible changes to Aegis Lens — features, data, methodology updates, breaking changes.",
  });
}
