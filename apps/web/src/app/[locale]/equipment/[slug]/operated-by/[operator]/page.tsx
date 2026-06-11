import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import {
  listEquipmentOperatorPairs,
  getEquipmentOperatorPair,
  siblingEquipmentByOperator,
  operatorSlug,
} from "@/lib/equipment-operators";
import { SITE } from "@/lib/site";

type Params = { locale: string; slug: string; operator: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const p of listEquipmentOperatorPairs()) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, slug: p.equipmentSlug, operator: p.operatorSlug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, slug, operator } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const pair = getEquipmentOperatorPair(slug, operator);
  if (!pair) return { robots: { index: false } };
  const { equipment, operatorLabel } = pair;
  const name = equipment.name[locale] ?? equipment.name.en;
  return buildMetadata({
    locale,
    title: `${name} (operated by ${operatorLabel})`,
    description: `Aegis Lens equipment profile: ${name} operated by ${operatorLabel}. Type, origin, and related systems in the directory.`,
    pathFor: (lc) => localePath(lc, `/equipment/${slug}/operated-by/${operator}`),
  });
}

export default async function EquipmentOperatorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, slug, operator } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const pair = getEquipmentOperatorPair(slug, operator);
  if (!pair) notFound();
  const { equipment, operatorLabel } = pair;

  const name = equipment.name[locale] ?? equipment.name.en;
  const description = equipment.description[locale] ?? equipment.description.en;
  const pageUrl = `${SITE.url}${localePath(locale, `/equipment/${slug}/operated-by/${operator}`)}`;

  const siblings = siblingEquipmentByOperator(operator).filter((e) => e.slug !== slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name,
        description,
        category: equipment.type,
        brand: { "@type": "Organization", name: operatorLabel },
        url: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Equipment",
            item: `${SITE.url}${urls.equipment(locale, slug)}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name,
            item: `${SITE.url}${urls.equipment(locale, slug)}`,
          },
          { "@type": "ListItem", position: 3, name: `operated by ${operatorLabel}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-4 py-10">
        <nav className="font-mono text-[11px] text-text-muted" aria-label="Breadcrumb">
          <Link href={urls.equipment(locale, slug)} className="hover:text-text-primary">
            {name}
          </Link>
          <span className="mx-2 text-border-default">/</span>
          <span className="text-text-secondary">operated by {operatorLabel}</span>
        </nav>

        <PageHeader
          eyebrow={`${equipment.type} · ${operatorLabel}`}
          title={`${name} (operated by ${operatorLabel})`}
          description={description}
        />

        <section className="mt-6 rounded border border-border-subtle bg-bg-surface p-4">
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Type
              </div>
              <div className="mt-1 text-text-primary">{equipment.type}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Origin
              </div>
              <div className="mt-1 text-text-primary">{equipment.origin}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Primary operator
              </div>
              <div className="mt-1 text-text-primary">{operatorLabel}</div>
            </div>
          </div>
        </section>

        {siblings.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-semibold text-text-primary">
              Other systems operated by {operatorLabel}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={urls.equipmentOperator(
                      locale,
                      s.slug,
                      operatorSlug(operatorLabel),
                    )}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm hover:bg-bg-elevated"
                  >
                    <div className="text-text-primary">{s.name[locale] ?? s.name.en}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      {s.type}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-10 text-xs text-text-muted">
          Equipment profile:{" "}
          <Link
            href={urls.equipment(locale, slug)}
            className="text-accent hover:underline"
          >
            full {name}
          </Link>
          .
        </p>
      </article>
    </>
  );
}
