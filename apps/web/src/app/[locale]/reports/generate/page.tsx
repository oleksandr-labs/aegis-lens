import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { GenerateReportClient } from "./GenerateReportClient";

type Props = { params: Promise<{ locale: string }> };

function generatePath(lc: Locale): string {
  return lc === "en" ? "/reports/generate" : `/${lc}/reports/generate`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Generate Intelligence Report",
    description:
      "Configure your report parameters. AI generates a structured brief with verified citations.",
    pathFor: (lc) => generatePath(lc),
    noindex: true,
  });
}

export default function GenerateReportPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Generate Intelligence Report"
        description="Configure your report parameters. AI generates a structured brief with verified citations."
      />
      <GenerateReportClient />
    </>
  );
}
