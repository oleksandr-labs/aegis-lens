import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { COMPANIES } from "@/lib/directory-seed";

const lp = (lc: Locale) => (lc === "en" ? "/companies" : `/${lc}/companies`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Companies directory",
    description:
      "OSINT, intel, cybersecurity, and geospatial companies — searchable directory.",
    pathFor: lp,
  });
}

export default function CompaniesIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Companies"
        description="OSINT, intel, cybersecurity, and geospatial companies. Sprint 1.1 placeholder — full faceted directory + claim flow lands in Sprint 2."
      />
      <section className="mx-auto max-w-5xl px-4 py-10">
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {COMPANIES.map((c) => (
            <li
              key={c.slug}
              className="rounded border border-border-subtle bg-bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">{c.name}</h3>
                {c.verified && (
                  <span className="font-mono text-[9px] uppercase text-success">verified</span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                <span>{c.category}</span>
                <span>·</span>
                <span>{c.region}</span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{c.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
