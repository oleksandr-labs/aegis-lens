import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Careers at Aegis Lens";
const DESCRIPTION =
  "Build intelligence infrastructure for the world. Join a small team at the intersection of AI, OSINT, and conflict journalism.";

const ORG_NAME = "Aegis Lens";

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
    pathFor: (lc) => localePath(lc, "/careers"),
  });
}

type OpenRole = {
  id: string;
  title: string;
  team: string;
  location: string;
  type: string;
  salary: string;
  tags: string[];
  description: string;
  priority: boolean;
};

const OPEN_ROLES: OpenRole[] = [
  {
    id: "sr-engineer",
    title: "Senior Full-Stack Engineer",
    team: "Engineering",
    location: "Remote (EU/UA)",
    type: "Full-time",
    salary: "€70-110k",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Kafka"],
    description:
      "Build the core intelligence platform — real-time data pipelines, AI integrations, and the map workspace.",
    priority: true,
  },
  {
    id: "ml-engineer",
    title: "ML Engineer — Computer Vision",
    team: "AI Research",
    location: "Remote (Global)",
    type: "Full-time",
    salary: "€80-130k",
    tags: ["PyTorch", "YOLOv8", "Python", "GCP"],
    description:
      "Train and deploy military equipment detection, image geolocation, and deepfake detection models.",
    priority: true,
  },
  {
    id: "osint-analyst",
    title: "Senior OSINT Analyst",
    team: "Intelligence",
    location: "Kyiv / Remote",
    type: "Full-time",
    salary: "₴120-180k",
    tags: ["OSINT", "Geolocation", "Ukrainian/Russian"],
    description:
      "Verify conflict events, train the human-review team, and build verification methodology documentation.",
    priority: false,
  },
  {
    id: "product-designer",
    title: "Product Designer",
    team: "Design",
    location: "Remote (EU)",
    type: "Full-time",
    salary: "€50-80k",
    tags: ["Figma", "Design Systems", "Data Viz"],
    description:
      "Design the intelligence workspace, map overlays, and reporting surfaces. Tactical UI meets editorial UX.",
    priority: false,
  },
  {
    id: "devops-engineer",
    title: "DevOps / Platform Engineer",
    team: "Infrastructure",
    location: "Remote (Global)",
    type: "Full-time",
    salary: "€70-100k",
    tags: ["Kubernetes", "Terraform", "AWS", "Kafka"],
    description:
      "Build and operate the infrastructure powering real-time intelligence at scale.",
    priority: false,
  },
  {
    id: "data-engineer",
    title: "Data Engineer",
    team: "Data",
    location: "Remote (EU/UA)",
    type: "Full-time",
    salary: "€60-90k",
    tags: ["dbt", "Kafka", "PostGIS", "Python"],
    description:
      "Build the data pipeline from raw source ingestion through enrichment, verification, and serving.",
    priority: false,
  },
];

const CULTURE_CARDS = [
  {
    label: "Remote-first globally",
    body: "Async culture with overlap-friendly hours. Work from anywhere we can legally employ — Kyiv and EU hubs available but never required.",
  },
  {
    label: "Mission-driven",
    body: "We work on things that matter to real people in difficult situations. Your output shows up in newsrooms, courtrooms, and human-rights reports.",
  },
  {
    label: "Technically ambitious",
    body: "Real-time AI pipelines, WebGL maps, satellite imagery processing, and verification infrastructure — not another CRUD app.",
  },
];

const BENEFITS = [
  "Competitive salary in USD/EUR/UAH",
  "Full equipment budget",
  "30 days PTO + local holidays",
  "War-risk insurance (UA team)",
  "Learning budget: €2,000/year",
  "Conference travel",
  "Home office setup allowance",
  "Equity (ESOP)",
];

const HIRING_STEPS = [
  {
    step: "1",
    title: "Application",
    description:
      "Send a short note and a link to something you have built, written, or investigated. No formal cover letter. Reference the role in the subject line.",
  },
  {
    step: "2",
    title: "Async screen",
    description:
      "A brief async task or structured conversation — usually 30–60 min of effort. We respect your time and won't ask for unpaid week-long projects.",
  },
  {
    step: "3",
    title: "Technical interview",
    description:
      "A focused technical conversation with a future teammate. Practical, relevant to your role — no whiteboard puzzles.",
  },
  {
    step: "4",
    title: "Team fit",
    description:
      "One or two conversations with future teammates — not a panel, not a gauntlet. We're assessing fit both ways.",
  },
  {
    step: "5",
    title: "Offer",
    description:
      "Explicit compensation range shared before the final call. Offer letters within 48 hours of a positive decision. We don't move slowly.",
  },
];

// Group roles by team
function groupByTeam(roles: OpenRole[]): Map<string, OpenRole[]> {
  const map = new Map<string, OpenRole[]>();
  for (const role of roles) {
    const existing = map.get(role.team) ?? [];
    existing.push(role);
    map.set(role.team, existing);
  }
  return map;
}

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const datePosted = "2026-05-01";
  const validThrough = "2026-12-31";

  const jobJsonLd = OPEN_ROLES.map((r) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: r.title,
    description: r.description,
    datePosted,
    validThrough,
    employmentType: "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: ORG_NAME,
      sameAs: "https://aegislens.io",
    },
    jobLocationType: r.location.toLowerCase().includes("remote")
      ? "TELECOMMUTE"
      : undefined,
    applicantLocationRequirements: r.location.toLowerCase().includes("remote")
      ? { "@type": "Country", name: "Worldwide" }
      : undefined,
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: r.salary.startsWith("₴") ? "UAH" : "EUR",
      value: {
        "@type": "QuantitativeValue",
        unitText: "YEAR",
        value: r.salary,
      },
    },
    inLanguage: locale,
  }));

  const teamGroups = groupByTeam(OPEN_ROLES);

  return (
    <>
      {jobJsonLd.map((j, i) => (
        <script
          key={OPEN_ROLES[i]!.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }}
        />
      ))}

      <PageHeader
        eyebrow="We're hiring"
        title="Build intelligence infrastructure for the world"
        description="Join a small team doing important work at the intersection of AI, OSINT, and conflict journalism."
      />

      <div className="mx-auto max-w-4xl px-4 py-10 space-y-16">

        {/* Culture cards */}
        <section id="culture">
          <h2 className="text-xl font-semibold text-text-primary">Why Aegis Lens</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {CULTURE_CARDS.map((card) => (
              <li
                key={card.label}
                className="rounded border border-border-subtle bg-bg-surface p-5"
              >
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  {card.label}
                </p>
                <p className="mt-3 text-sm text-text-secondary">{card.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Benefits */}
        <section id="benefits">
          <h2 className="text-xl font-semibold text-text-primary">
            Benefits &amp; compensation
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Ranges are shared before the first conversation — no anchoring, no games.
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <li
                key={b}
                className="flex items-center gap-2 text-sm text-text-secondary"
              >
                <span className="font-mono text-accent">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </section>

        {/* Open roles grouped by team */}
        <section id="roles">
          <h2 className="text-xl font-semibold text-text-primary">Open roles</h2>
          <p className="mt-2 text-sm text-text-secondary">
            {OPEN_ROLES.length} open positions across {teamGroups.size} teams.
          </p>

          <div className="mt-8 space-y-10">
            {Array.from(teamGroups.entries()).map(([team, roles]) => (
              <div key={team}>
                <h3 className="font-mono text-xs uppercase tracking-widest text-text-muted border-b border-border-subtle pb-2">
                  {team}
                </h3>
                <ul className="mt-4 space-y-4">
                  {roles.map((role) => (
                    <li
                      key={role.id}
                      className="rounded border border-border-subtle bg-bg-surface p-5"
                    >
                      {/* Header row */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-semibold text-text-primary">
                            {role.title}
                          </h4>
                          {role.priority && (
                            <span className="rounded bg-accent/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                              Priority
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-sm font-semibold text-text-primary">
                          {role.salary}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className="mt-2 flex flex-wrap gap-4">
                        <span className="font-mono text-xs text-text-muted">
                          {role.location}
                        </span>
                        <span className="font-mono text-xs text-text-muted">
                          {role.type}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mt-3 text-sm text-text-secondary">
                        {role.description}
                      </p>

                      {/* Tags + apply */}
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <ul className="flex flex-wrap gap-2">
                          {role.tags.map((tag) => (
                            <li
                              key={tag}
                              className="rounded border border-border-subtle px-2 py-0.5 font-mono text-xs text-text-muted"
                            >
                              {tag}
                            </li>
                          ))}
                        </ul>
                        <Link
                          href={localePath(locale, `/careers/${role.id}`)}
                          className="font-mono text-sm text-accent hover:underline underline-offset-2"
                        >
                          Apply →
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Hiring process */}
        <section id="process">
          <h2 className="text-xl font-semibold text-text-primary">How we hire</h2>
          <p className="mt-2 text-sm text-text-secondary">
            We aim to complete every process in under three weeks. Every application receives a
            response — no ghosting.
          </p>
          <ol className="mt-8 space-y-5">
            {HIRING_STEPS.map((s) => (
              <li key={s.step} className="flex gap-4">
                <div
                  aria-hidden
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent font-mono text-xs font-semibold text-accent"
                >
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{s.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{s.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Bottom CTA */}
        <section id="apply" className="rounded border border-border-subtle bg-bg-surface p-8 text-center">
          <p className="text-text-secondary">
            Don&rsquo;t see your role? We still want to hear from you.
          </p>
          <a
            href="mailto:jobs@aegislens.io"
            className="mt-4 inline-block rounded border border-accent px-5 py-2.5 font-mono text-sm text-accent hover:bg-accent hover:text-bg-base transition-colors"
          >
            Send us a note →
          </a>
          <p className="mt-4 text-xs text-text-muted">
            We do not discriminate on the basis of nationality, gender, age, or background. See our{" "}
            <Link
              href={localePath(locale, "/about#team")}
              className="text-accent underline-offset-2 hover:underline"
            >
              team page
            </Link>{" "}
            for who we are.
          </p>
        </section>
      </div>
    </>
  );
}
