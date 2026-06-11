import { renderContentOG } from "@/components/og/ContentOG";

export const runtime = "edge";
export const alt = "Integrations";
export { size, contentType } from "@/components/og/ContentOG";

export default async function IntegrationsOG() {
  return renderContentOG({
    eyebrow: "Integrations",
    title: "Connect Aegis Lens to your stack",
    tagline:
      "Slack, Teams, Telegram, generic webhook, Zapier, Make, Splunk, Elastic, Power BI, Tableau, Salesforce, GitHub Actions.",
  });
}
