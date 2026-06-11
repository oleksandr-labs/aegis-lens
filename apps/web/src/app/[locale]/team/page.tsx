import type { Metadata } from "next";
import Link from "next/link";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import { TEAM_MEMBERS } from "@/lib/team-seed";

const TITLE = "Team — Analysts, Engineers & Researchers";
const DESCRIPTION =
  "The intelligence analysts, researchers, and engineers behind Aegis Lens. Real names, verified credentials, and a commitment to transparency.";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: TITLE,
    description: DESCRIPTION,
    pathFor: (lc) => urls.team(lc),
  });
}

/** Deterministic color from name string — returns one of several bg/text combos */
function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = [
    "bg-blue-900/60 text-blue-300",
    "bg-emerald-900/60 text-emerald-300",
    "bg-purple-900/60 text-purple-300",
    "bg-amber-900/60 text-amber-300",
    "bg-rose-900/60 text-rose-300",
    "bg-cyan-900/60 text-cyan-300",
  ];
  return palette[Math.abs(hash) % palette.length];
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const pageUrl = `${SITE.url}${localePath(locale, "/team")}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: TITLE,
        description: DESCRIPTION,
        url: pageUrl,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
      },
      organizationJsonLd(),
      ...TEAM_MEMBERS.map((m) => ({
        "@type": "Person",
        name: m.name,
        jobTitle: m.role,
        description: m.bio,
        url: `${SITE.url}${urls.teamMember(locale, m.slug)}`,
        worksFor: { "@type": "Organization", name: SITE.name, url: SITE.url },
        sameAs: m.sameAs,
        knowsLanguage: m.languages,
        workLocation: { "@type": "Place", name: m.location },
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        eyebrow="Team"
        title={TITLE}
        description={DESCRIPTION}
      />

      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm text-text-secondary max-w-2xl">
          All Aegis Lens analysts publish under their real credentials. Intelligence is only as
          trustworthy as the people behind it — so we name them, cite their expertise, and link
          their prior work.
        </p>

        {/* Team grid */}
        <ul className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member) => {
            const colorClass = avatarColor(member.name);
            return (
              <li
                key={member.slug}
                className="flex flex-col rounded border border-border-subtle bg-bg-surface"
              >
                <div className="flex items-start gap-4 p-5">
                  {/* Avatar */}
                  <div
                    aria-hidden
                    className={`grid h-14 w-14 shrink-0 place-items-center rounded-full font-mono text-sm font-semibold uppercase tracking-widest ${colorClass}`}
                  >
                    {member.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-base font-semibold text-text-primary leading-tight">
                      {member.name}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-text-muted mt-0.5">
                      {member.role}
                    </div>
                    <div className="mt-1 text-xs text-text-tertiary">{member.location}</div>
                  </div>
                </div>

                <div className="px-5 pb-3">
                  <p className="text-sm text-text-secondary">{member.bio}</p>
                </div>

                {/* Social links */}
                {(member.socials.twitter ||
                  member.socials.linkedin ||
                  member.socials.github) && (
                  <div className="px-5 pb-3 flex flex-wrap gap-2">
                    {member.socials.twitter && (
                      <span className="inline-flex items-center gap-1 rounded border border-border-subtle px-2 py-1 font-mono text-[10px] text-text-muted">
                        𝕏 {member.socials.twitter}
                      </span>
                    )}
                    {member.socials.linkedin && (
                      <span className="inline-flex items-center gap-1 rounded border border-border-subtle px-2 py-1 font-mono text-[10px] text-text-muted">
                        in {member.socials.linkedin.replace("linkedin.com/in/", "")}
                      </span>
                    )}
                    {member.socials.github && (
                      <span className="inline-flex items-center gap-1 rounded border border-border-subtle px-2 py-1 font-mono text-[10px] text-text-muted">
                        gh {member.socials.github.replace("github.com/", "")}
                      </span>
                    )}
                  </div>
                )}

                {/* Profile link */}
                <div className="mt-auto border-t border-border-subtle px-5 py-3">
                  <Link
                    href={urls.teamMember(locale, member.slug)}
                    className="text-xs font-medium text-accent hover:underline underline-offset-2"
                  >
                    Full profile &amp; publications →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Join the team CTA */}
        <div className="mt-12 rounded border border-border-subtle bg-bg-surface p-6">
          <h2 className="text-base font-semibold text-text-primary">Join the team</h2>
          <p className="mt-2 text-sm text-text-secondary">
            We hire OSINT practitioners, geospatial engineers, conflict researchers, and designers.
            Remote-first, mission-driven, open about our methodology.
          </p>
          <Link
            href={localePath(locale, "/careers")}
            className="mt-4 inline-block text-sm font-medium text-accent hover:underline underline-offset-2"
          >
            See open roles →
          </Link>
        </div>
      </div>
    </>
  );
}
