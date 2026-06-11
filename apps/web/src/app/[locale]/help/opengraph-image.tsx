import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Help center";
export { size, contentType } from "@/components/og/ContentOG";

export default async function HelpOG() {
  return renderContentOG({
    eyebrow: "Help",
    title: "Aegis Lens help center",
    tagline:
      "Search the knowledge base or browse by category — API keys, billing, methodology, integrations, account.",
  });
}
