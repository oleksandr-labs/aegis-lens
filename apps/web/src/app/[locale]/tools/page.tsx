import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { TOOLS } from "@/lib/directory-seed";

const lp = (lc: Locale) => (lc === "en" ? "/tools" : `/${lc}/tools`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Tools directory",
    description: "OSINT, satellite, verification, and AI tools — searchable directory.",
    pathFor: lp,
  });
}

export default function ToolsIndex() {
  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Tools"
        description="OSINT, satellite, verification, and AI tools. Sprint 1.1 placeholder — full directory with comparison + reviews lands in Sprint 2."
      />
      <section className="mx-auto max-w-5xl px-4 py-10">
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((c) => (
            <li
              key={c.slug}
              className="rounded border border-border-subtle bg-bg-surface p-4"
            >
              <h3 className="text-sm font-semibold text-text-primary">{c.name}</h3>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {c.category}
              </div>
              <p className="mt-2 text-sm text-text-secondary">{c.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
