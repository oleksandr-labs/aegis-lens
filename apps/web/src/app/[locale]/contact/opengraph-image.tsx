import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Contact";
export { size, contentType } from "@/components/og/ContentOG";

export default async function ContactOG() {
  return renderContentOG({
    eyebrow: "Contact",
    title: "Reach the Aegis Lens team",
    tagline:
      "General, sales, press, security, abuse — five direct channels plus a contact form.",
  });
}
