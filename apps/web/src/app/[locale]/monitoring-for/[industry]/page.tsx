import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { localePath } from "@aegis/url-builder";
import { buildMetadata } from "@/lib/seo";
import { listIndustries, getIndustry } from "@/lib/industries";
import { LENSES } from "@/lib/x-for-y";
import { XForYPage } from "@/components/XForYPage";

type Params = { locale: string; industry: string };

const LENS = LENSES.monitoring;

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const i of listIndustries()) {
    for (const lc of ACTIVE_LOCALES) out.push({ locale: lc, industry: i.slug });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, industry } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ind = getIndustry(industry);
  if (!ind) return { robots: { index: false } };
  return buildMetadata({
    locale,
    title: `${LENS.label} for ${ind.label}`,
    description: `${LENS.intro} Featured tools, companies, applications, and FAQ for ${ind.label}.`,
    pathFor: (lc) => localePath(lc, `${LENS.routePrefix}/${ind.slug}`),
  });
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { locale: raw, industry } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const ind = getIndustry(industry);
  if (!ind) notFound();
  return <XForYPage lensKey={LENS.key} industrySlug={ind.slug} locale={locale} />;
}
