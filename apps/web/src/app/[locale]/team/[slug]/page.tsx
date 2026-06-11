import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata, organizationJsonLd } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { SITE } from "@/lib/site";
import { TEAM_MEMBERS, getTeamMember } from "@/lib/team-seed";
import { BLOG_POSTS } from "@/lib/blog-seed";

export function generateStaticParams() {
  return ACTIVE_LOCALES.flatMap((locale) =>
    TEAM_MEMBERS.map((m) => ({ locale, slug: m.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const member = getTeamMember(slug);
  if (!member) return {};
  return buildMetadata({
    locale,
    title: `${member.name} — ${member.role}`,
    description: member.bio,
    pathFor: (lc) => urls.teamMember(lc, slug),
  });
}

/** Deterministic avatar color — same algorithm as team index */
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

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const member = getTeamMember(slug);
  if (!member) notFound();

  const memberUrl = `${SITE.url}${urls.teamMember(locale, slug)}`;
  const colorClass = avatarColor(member.name);

  const authoredPosts = BLOG_POSTS.filter(
    (p) => p.author === member.name || p.author.includes(member.initials),
  );

  const blogSearchUrl = `${localePath(locale, "/blog")}?author=${member.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        name: `${member.name} — ${member.role}`,
        description: member.bio,
        url: memberUrl,
        inLanguage: locale,
        isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
        mainEntity: {
          "@type": "Person",
          "@id": memberUrl,
          name: member.name,
          jobTitle: member.role,
          description: member.longBio,
          url: memberUrl,
          worksFor: {
            "@type": "Organization",
            name: SITE.name,
            url: SITE.url,
          },
          sameAs: member.sameAs,
          knowsLanguage: member.languages,
          workLocation: { "@type": "Place", name: member.location },
          hasCredential: member.credentials.map((c) => ({
            "@type": "EducationalOccupationalCredential",
            name: c,
          })),
          author: member.publications.map((pub) => ({
            "@type": "ScholarlyArticle",
            name: pub.title,
            datePublished: String(pub.year),
            isPartOf: { "@type": "Periodical", name: pub.venue },
            ...(pub.url ? { url: pub.url } : {}),
          })),
        },
      },
      organizationJsonLd(),
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
        title={member.name}
        description={member.role}
      />

      <div className="mx-auto max-w-3xl px-4 py-10">

        {/* Identity card */}
        <div className="flex items-start gap-5 rounded border border-border-subtle bg-bg-surface p-5">
          <div
            aria-hidden
            className={`grid h-16 w-16 shrink-0 place-items-center rounded-full font-mono text-base font-semibold uppercase tracking-widest ${colorClass}`}
          >
            {member.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-semibold text-text-primary">{member.name}</div>
            <div className="font-mono text-xs uppercase tracking-widest text-text-muted">
              {member.role}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-secondary">
              <span>{member.location}</span>
              <span>{member.languages.join(" · ")}</span>
            </div>

            {/* Social links */}
            {(member.socials.twitter || member.socials.linkedin || member.socials.github) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {member.socials.twitter && (
                  <a
                    href={`https://twitter.com/${member.socials.twitter.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="inline-block rounded border border-border-subtle px-2.5 py-1 font-mono text-[10px] text-accent hover:bg-bg-elevated"
                  >
                    𝕏 {member.socials.twitter}
                  </a>
                )}
                {member.socials.linkedin && (
                  <a
                    href={`https://${member.socials.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="inline-block rounded border border-border-subtle px-2.5 py-1 font-mono text-[10px] text-accent hover:bg-bg-elevated"
                  >
                    LinkedIn
                  </a>
                )}
                {member.socials.github && (
                  <a
                    href={`https://${member.socials.github}`}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="inline-block rounded border border-border-subtle px-2.5 py-1 font-mono text-[10px] text-accent hover:bg-bg-elevated"
                  >
                    GitHub
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary">About</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">{member.longBio}</p>
        </section>

        {/* Credentials */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary">Credentials</h2>
          <ul className="mt-3 space-y-2">
            {member.credentials.map((c) => (
              <li key={c} className="flex items-start gap-3 text-sm text-text-secondary">
                <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent">
                  ✓
                </span>
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* Specialties / role responsibilities (derived from credentials heading) */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-text-primary">Responsibilities at Aegis Lens</h2>
          <p className="mt-3 text-sm text-text-secondary leading-relaxed">
            {member.name} holds the role of <strong className="text-text-primary">{member.role}</strong>.{" "}
            {member.credentials.length > 0 && (
              <>Their work encompasses: {member.credentials.join("; ")}.</>
            )}
          </p>
        </section>

        {/* Publications */}
        {member.publications.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-text-primary">Publications</h2>
            <ul className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
              {member.publications.map((pub) => (
                <li key={pub.title} className="px-4 py-3">
                  <div className="text-sm font-medium text-text-primary">
                    {pub.url ? (
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent"
                      >
                        {pub.title}
                      </a>
                    ) : (
                      pub.title
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-text-muted">
                    <span>{pub.venue}</span>
                    <span>{pub.year}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Talks */}
        {member.talks.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-text-primary">Talks &amp; presentations</h2>
            <ul className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
              {member.talks.map((talk) => (
                <li key={talk.title} className="px-4 py-3">
                  <div className="text-sm font-medium text-text-primary">
                    {talk.url ? (
                      <a
                        href={talk.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent"
                      >
                        {talk.title}
                      </a>
                    ) : (
                      talk.title
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-text-muted">
                    <span>{talk.event}</span>
                    <span>{talk.year}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Authored blog posts (seeded matches) */}
        {authoredPosts.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-text-primary">Intelligence briefs</h2>
            <ul className="mt-3 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
              {authoredPosts.map((post) => (
                <li key={post.slug} className="px-4 py-3">
                  <Link
                    href={urls.blogPost(locale, post.slug)}
                    className="text-sm font-medium text-text-primary hover:text-accent"
                  >
                    {post.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-text-muted">
                    <span>{post.category}</span>
                    <span>{post.publishedAt}</span>
                    <span>{post.readingTimeMin} min read</span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm">
              <Link href={blogSearchUrl} className="text-accent hover:underline underline-offset-2">
                All articles by {member.name} →
              </Link>
            </p>
          </section>
        )}

        {/* Articles by this author link (always shown) */}
        {authoredPosts.length === 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-text-primary">Articles by this author</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Browse all intelligence briefs and analysis from {member.name}.
            </p>
            <p className="mt-3 text-sm">
              <Link href={blogSearchUrl} className="text-accent hover:underline underline-offset-2">
                View articles by {member.name} →
              </Link>
            </p>
          </section>
        )}

        {/* External links */}
        {member.sameAs.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-text-primary">External links</h2>
            <ul className="mt-3 flex flex-wrap gap-3">
              {member.sameAs.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="inline-block rounded border border-border-subtle px-3 py-1.5 text-xs text-accent hover:bg-bg-surface"
                  >
                    {url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 border-t border-border-subtle pt-6 text-sm text-text-secondary">
          <Link href={urls.team(locale)} className="text-accent hover:underline underline-offset-2">
            ← Back to team
          </Link>
        </div>
      </div>
    </>
  );
}
