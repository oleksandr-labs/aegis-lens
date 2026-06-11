import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Join the OSINT Community";
const DESCRIPTION =
  "A global network of analysts, journalists, researchers and informed citizens working to verify and understand world events.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Community",
    description: DESCRIPTION,
    pathFor: (lc) => localePath(lc, "/community"),
  });
}

// ── Data ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "2,400+", label: "Community members" },
  { value: "89", label: "Countries represented" },
  { value: "14,200+", label: "Verified events contributed" },
  { value: "340", label: "OSINT guides published" },
];

const WAYS = [
  {
    icon: "◎",
    title: "Verify Events",
    description:
      "Join our review queue and help verify reported events using OSINT techniques. Earn verification badges and build your analyst reputation.",
    cta: "Join review queue",
    href: "/review",
  },
  {
    icon: "◑",
    title: "Contribute Data",
    description:
      "Submit events, sources, and intelligence from your monitoring work. All submissions are reviewed before publication.",
    cta: "Submit intelligence",
    href: "/contact?type=contributor",
  },
  {
    icon: "◐",
    title: "Write Guides",
    description:
      "Share your OSINT methodology with the community. Peer-reviewed guides earn contributor badges and publication credit.",
    cta: "Propose a guide",
    href: "/contact?type=guide",
  },
];

const PROGRAMS = [
  {
    title: "Verified Analyst Program",
    description:
      "Complete a background check and structured training pathway to earn a Verified Analyst badge.",
    perks: [
      "Verified badge shown on all contributions",
      "API access with elevated rate limits",
      "Priority placement in the review queue",
      "Direct channel with the core team",
    ],
  },
  {
    title: "Press Tier",
    description:
      "For credentialed journalists covering conflict, security, or disinformation topics.",
    perks: [
      "Free platform access (all features)",
      "Press badge on contributor profile",
      "Source verification priority",
      "Embargoed dataset previews",
    ],
  },
  {
    title: "Academic Program",
    description:
      "For researchers at accredited institutions studying conflict, disinformation, or OSINT.",
    perks: [
      "Full data access for research use",
      "Citation tools and DOI export",
      "Bulk dataset downloads",
      "Co-authorship credit on methodology papers",
    ],
  },
  {
    title: "Regional Networks",
    description:
      "Eight active regional groups coordinating local monitoring, translation, and source development.",
    perks: [
      "UA · PL · DE · US · UK",
      "Baltics · Middle East · APAC",
      "Regional leads with moderation powers",
      "Language-specific Telegram channels",
    ],
  },
];

const LEADERBOARD = [
  { rank: 1, name: "OSINT_UA", badge: "Verified Analyst", contributions: 847, country: "🇺🇦" },
  { rank: 2, name: "maritime_watcher", badge: "Maritime Specialist", contributions: 523, country: "🇬🇧" },
  { rank: 3, name: "SkyPatrol_DE", badge: "Aviation Analyst", contributions: 412, country: "🇩🇪" },
  { rank: 4, name: "verify_pol", badge: "Verified Analyst", contributions: 389, country: "🇵🇱" },
  { rank: 5, name: "BlackSea_Intel", badge: "Maritime Specialist", contributions: 301, country: "🇺🇦" },
];

const EVENTS = [
  {
    date: "2026-06-15",
    title: "OSINT Workshop: Geolocation Techniques",
    format: "Webinar",
    spots: "Open",
  },
  {
    date: "2026-06-28",
    title: "Monthly Analyst AMA with Aegis Team",
    format: "Live Q&A",
    spots: "Open",
  },
  {
    date: "2026-07-10",
    title: "OSINT Challenge: Ukraine Infrastructure",
    format: "Competition",
    spots: "Limited",
  },
];

const CODE_OF_CONDUCT_POINTS = [
  "Verify before you share — never treat a single source as gospel, and never spread unverified claims as fact.",
  "Protect sources and civilians — never share content that could identify non-public individuals, informants, or aid their targeting.",
  "Cite your sources — every claim must be traceable. If you can't cite it, don't publish it.",
  "Acknowledge uncertainty — use appropriate hedging. 'Unverified', 'reported', and 'claimed' are honest; 'confirmed' is reserved for multi-source corroboration.",
  "No disinformation campaigns — participation in or coordination of information operations is grounds for immediate removal.",
  "No harassment — criticism of analysis is welcome; personal attacks are not.",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Community — Aegis Lens",
    description: DESCRIPTION,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: "Aegis Lens" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <PageHeader
        eyebrow="Community"
        title={TITLE}
        description={DESCRIPTION}
      />

      {/* Stats bar */}
      <div className="border-b border-border-subtle bg-bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <dt className="font-mono text-2xl font-bold text-accent">{s.value}</dt>
                <dd className="mt-1 text-xs text-text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 space-y-16">

        {/* Ways to contribute */}
        <section id="contribute">
          <h2 className="text-xl font-semibold text-text-primary">Ways to contribute</h2>
          <p className="mt-2 text-sm text-text-secondary max-w-2xl">
            Every verified contribution earns a contributor badge and public attribution. Choose the
            track that matches your skills.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {WAYS.map((w) => (
              <div
                key={w.title}
                className="flex flex-col rounded border border-border-subtle bg-bg-surface p-5"
              >
                <div className="mb-3 text-2xl text-accent" aria-hidden="true">
                  {w.icon}
                </div>
                <h3 className="text-base font-semibold text-text-primary">{w.title}</h3>
                <p className="mt-2 flex-1 text-sm text-text-secondary">{w.description}</p>
                <div className="mt-5">
                  <Link
                    href={localePath(locale, w.href)}
                    className="inline-block rounded border border-accent px-3 py-1.5 font-mono text-xs text-accent hover:bg-accent hover:text-bg-base transition-colors"
                  >
                    {w.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community programs */}
        <section id="programs">
          <h2 className="text-xl font-semibold text-text-primary">Community programs</h2>
          <p className="mt-2 text-sm text-text-secondary max-w-2xl">
            Structured tiers for analysts, journalists, academics, and regional coordinators.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PROGRAMS.map((p) => (
              <div
                key={p.title}
                className="rounded border border-border-subtle bg-bg-surface p-5"
              >
                <h3 className="text-base font-semibold text-text-primary">{p.title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{p.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="mt-1 shrink-0 font-mono text-[10px] text-accent">▸</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-text-muted">
            Apply for any program via the{" "}
            <Link
              href={localePath(locale, "/contact")}
              className="text-accent underline-offset-2 hover:underline"
            >
              contact form
            </Link>
            . Include your name, affiliation, and a brief description of your OSINT work.
          </p>
        </section>

        {/* Contributor leaderboard */}
        <section id="leaderboard">
          <h2 className="text-xl font-semibold text-text-primary">Contributor leaderboard</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Top contributors this month, ranked by verified event submissions.
          </p>
          <div className="mt-5 overflow-hidden rounded border border-border-subtle">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface">
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    Rank
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    Analyst
                  </th>
                  <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-text-muted hidden sm:table-cell">
                    Badge
                  </th>
                  <th className="px-4 py-2.5 text-right font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    Contributions
                  </th>
                  <th className="px-4 py-2.5 text-center font-mono text-[10px] uppercase tracking-wider text-text-muted">
                    Country
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {LEADERBOARD.map((row) => (
                  <tr key={row.rank} className="bg-bg-base hover:bg-bg-surface">
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">
                      {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : `#${row.rank}`}
                    </td>
                    <td className="px-4 py-3 font-semibold text-text-primary">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="rounded border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                        {row.badge}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                      {row.contributions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center text-base" aria-label="country flag">
                      {row.country}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Leaderboard resets monthly. Contributions = verified events, tips, and methodology
            reviews accepted by the editorial team.
          </p>
        </section>

        {/* Community channels */}
        <section id="channels">
          <h2 className="text-xl font-semibold text-text-primary">Community channels</h2>
          <p className="mt-2 text-sm text-text-secondary">
            All channels are moderated under the same code of conduct.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {/* Discord */}
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-text-primary">Discord</h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Chat
                </span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">Join 1,200+ members</p>
              <p className="mt-1 text-xs text-text-muted">
                Real-time discussion: methodology, geolocation help, source tips, general OSINT.
              </p>
              <p className="mt-4">
                <a
                  href="#"
                  className="font-mono text-xs text-accent underline-offset-2 hover:underline"
                >
                  Join Discord →
                </a>
              </p>
            </div>

            {/* Telegram */}
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-text-primary">Telegram</h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Channel
                </span>
              </div>
              <p className="mt-2 font-mono text-sm text-accent">@aegislens_community</p>
              <p className="mt-1 text-xs text-text-muted">
                Major verified events, methodology updates, and dataset releases. EN + UK feeds.
              </p>
              <p className="mt-4">
                <a
                  href="https://t.me/aegislens_community"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-accent underline-offset-2 hover:underline"
                >
                  Join Channel →
                </a>
              </p>
            </div>

            {/* GitHub */}
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-text-primary">GitHub</h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Open Source
                </span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Open-source tools and datasets
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Tooling, data schemas, public API spec. Issues and discussions welcome.
              </p>
              <p className="mt-4">
                <a
                  href="https://github.com/aegislens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-accent underline-offset-2 hover:underline"
                >
                  View on GitHub →
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Upcoming events */}
        <section id="events">
          <h2 className="text-xl font-semibold text-text-primary">Upcoming events</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Workshops, live challenges, and AMA sessions. Free for all community members.
          </p>
          <div className="mt-5 space-y-3">
            {EVENTS.map((ev) => (
              <div
                key={ev.title}
                className="flex flex-col gap-3 rounded border border-border-subtle bg-bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded border border-border-subtle bg-bg-elevated px-2.5 py-1.5 text-center font-mono">
                    <p className="text-[10px] uppercase tracking-wider text-text-muted">
                      {new Date(ev.date).toLocaleDateString("en-GB", { month: "short" })}
                    </p>
                    <p className="text-lg font-bold leading-none text-text-primary">
                      {new Date(ev.date).getDate()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{ev.title}</p>
                    <p className="mt-0.5 font-mono text-xs text-text-muted">{ev.format}</p>
                  </div>
                </div>
                <div className="shrink-0 sm:text-right">
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                      ev.spots === "Open"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {ev.spots}
                  </span>
                  <p className="mt-1 font-mono text-[10px] text-text-muted">
                    {formatDate(ev.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-text-muted">
            Events announced on Discord and Telegram.{" "}
            <a href="#channels" className="text-accent underline-offset-2 hover:underline">
              Join a channel to be notified →
            </a>
          </p>
        </section>

        {/* Code of conduct */}
        <section id="conduct">
          <h2 className="text-xl font-semibold text-text-primary">Code of conduct</h2>
          <p className="mt-2 text-sm text-text-secondary max-w-2xl">
            All community spaces operate under these principles. Violations — especially those that
            put sources or civilians at risk — result in immediate removal.
          </p>
          <ol className="mt-5 space-y-3">
            {CODE_OF_CONDUCT_POINTS.map((point, i) => (
              <li key={i} className="flex items-start gap-4 text-sm">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-subtle font-mono text-[10px] text-text-muted">
                  {i + 1}
                </span>
                <span className="text-text-secondary">{point}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-text-muted">
            Report violations to{" "}
            <a
              href="mailto:abuse@aegislens.io"
              className="text-accent underline-offset-2 hover:underline"
            >
              abuse@aegislens.io
            </a>
            . All reports are treated confidentially.
          </p>
        </section>

      </div>
    </>
  );
}
