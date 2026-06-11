import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { FlagsTable } from "./FlagsTable";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Feature Flags";
const DESCRIPTION =
  "How to read, override, and request feature flags in the Aegis Lens codebase. Flags gate experimental features, graduated rollouts, and audience-specific capabilities.";

const H2 = "mt-12 text-2xl font-semibold text-text-primary scroll-mt-20";
const H3 = "mt-6 text-lg font-semibold text-text-primary";
const P = "mt-3 text-text-secondary";
const CODE = "rounded bg-bg-base px-1.5 py-0.5 font-mono text-sm text-text-primary";
const PRE =
  "rounded border border-border-subtle bg-bg-elevated p-4 font-mono text-xs text-text-secondary overflow-x-auto whitespace-pre leading-relaxed";

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
    pathFor: (lc) => localePath(lc, "/docs/feature-flags"),
  });
}

export default async function FeatureFlagsDocsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    author: { "@type": "Organization", name: "Aegis Lens" },
    publisher: { "@type": "Organization", name: "Aegis Lens" },
  };

  return (
    <>
      <PageHeader eyebrow="Developer Docs" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* On-page nav */}
        <nav className="mb-10 flex flex-wrap gap-2 text-sm" aria-label="Page sections">
          {[
            ["#what-are-flags", "What are flags?"],
            ["#reading-a-flag", "Reading a flag"],
            ["#dev-panel", "Dev panel"],
            ["#overriding", "Overriding in dev"],
            ["#all-flags", "All flags"],
            ["#requesting", "Requesting a flag"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href!}
              className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-text-secondary hover:border-accent hover:text-accent transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <article className="text-text-secondary">

          {/* ── What are feature flags? ── */}
          <section id="what-are-flags">
            <h2 className={H2}>What are feature flags?</h2>
            <p className={P}>
              A feature flag is a named boolean that gates a piece of functionality at runtime
              without requiring a code deploy. In Aegis Lens, flags serve three purposes:
            </p>
            <ul className="mt-4 space-y-2 pl-5 list-disc text-text-secondary">
              <li>
                <strong className="text-text-primary">Graduated rollout</strong> — ship to 10% of
                users, verify metrics, expand to 100%.
              </li>
              <li>
                <strong className="text-text-primary">Audience gating</strong> — show a feature
                only to <code className={CODE}>enterprise</code> or <code className={CODE}>team+</code> plan users.
              </li>
              <li>
                <strong className="text-text-primary">Kill-switch</strong> — disable a misbehaving
                feature instantly without reverting a deploy.
              </li>
            </ul>
            <p className={P}>
              All flag definitions live in{" "}
              <code className={CODE}>src/lib/feature-flags.ts</code>. The admin UI is at{" "}
              <Link href="/admin/flags" className="text-accent hover:underline">
                /admin/flags
              </Link>
              .
            </p>
          </section>

          {/* ── Reading a flag ── */}
          <section id="reading-a-flag">
            <h2 className={H2}>Reading a flag in your component</h2>

            <h3 className={H3}>Client components</h3>
            <p className={P}>
              Import <code className={CODE}>useFlagEnabled</code> from{" "}
              <code className={CODE}>@/lib/feature-flags</code>. The hook checks localStorage
              for a dev override first, then falls back to the compiled default.
            </p>
            <pre className={`${PRE} mt-4`}>
              <code>{`import { useFlagEnabled } from "@/lib/feature-flags";

export function MyComponent() {
  const hasHeatmap = useFlagEnabled("heatmap_layer");

  if (!hasHeatmap) return null;

  return <HeatmapLayer />;
}`}</code>
            </pre>

            <h3 className={H3}>Server components / Route handlers</h3>
            <p className={P}>
              Import <code className={CODE}>isFlagEnabled</code> for server-side checks. This
              function does not access localStorage and is safe to call in RSC, API routes, and
              middleware.
            </p>
            <pre className={`${PRE} mt-4`}>
              <code>{`import { isFlagEnabled } from "@/lib/feature-flags";

// In an API route or Server Component:
if (!isFlagEnabled("ai_reports")) {
  return new Response("Feature not available", { status: 403 });
}`}</code>
            </pre>

            <h3 className={H3}>TypeScript: valid flag IDs</h3>
            <p className={P}>
              Both functions accept a <code className={CODE}>FlagId</code> union type — if you
              pass an unknown string, TypeScript will error at compile time. You can import the
              type directly if you need it:
            </p>
            <pre className={`${PRE} mt-4`}>
              <code>{`import type { FlagId } from "@/lib/feature-flags";

function checkFlag(id: FlagId) {
  return isFlagEnabled(id);
}`}</code>
            </pre>
          </section>

          {/* ── Dev panel ── */}
          <section id="dev-panel">
            <h2 className={H2}>Dev flags panel</h2>
            <p className={P}>
              When <code className={CODE}>NODE_ENV === "development"</code>, a floating{" "}
              <strong className="text-text-primary">🚩 button</strong> appears in the bottom-left
              corner of every page. Click it to open the Dev Flags Panel.
            </p>
            <div className="mt-4 rounded border border-purple-500/30 bg-purple-900/10 px-4 py-3 text-sm text-text-secondary">
              <span className="font-semibold text-purple-400">Dev-only</span> — the panel is
              stripped at build time in production. It is rendered by{" "}
              <code className={CODE}>DevFlagsPanel</code> in{" "}
              <code className={CODE}>src/components/DevFlagsPanel.tsx</code>, injected into the
              root layout.
            </div>
            <p className={P}>
              The panel lists every flag defined in <code className={CODE}>FLAG_DEFINITIONS</code>.
              Each row shows the flag label, a toggle switch, and — if overridden — an{" "}
              <em>overridden</em> badge with a ✕ clear button. Changes take effect immediately
              without a page reload (client components that call <code className={CODE}>useFlagEnabled</code>{" "}
              will re-read localStorage on next render).
            </p>
            <p className={P}>
              <strong className="text-text-primary">Reset all</strong> clears every override and
              reloads the page, restoring all flags to their compiled defaults.
            </p>
          </section>

          {/* ── Manual overrides ── */}
          <section id="overriding">
            <h2 className={H2}>Overriding flags manually</h2>
            <p className={P}>
              Under the hood, overrides are stored as{" "}
              <code className={CODE}>localStorage.aegis_flag_{"<id>"}</code> with the string
              value <code className={CODE}>"true"</code> or <code className={CODE}>"false"</code>.
              You can set them directly from the browser console:
            </p>
            <pre className={`${PRE} mt-4`}>
              <code>{`// Enable a flag
localStorage.setItem("aegis_flag_mapbox_swap", "true");

// Disable a flag
localStorage.setItem("aegis_flag_heatmap_layer", "false");

// Clear an override (reverts to default)
localStorage.removeItem("aegis_flag_heatmap_layer");`}</code>
            </pre>
            <p className={P}>
              Changes are picked up immediately by <code className={CODE}>useFlagEnabled</code>{" "}
              on the next render. The admin page at{" "}
              <Link href="/admin/flags" className="text-accent hover:underline">
                /admin/flags
              </Link>{" "}
              also writes to localStorage when you click <strong className="text-text-primary">Save</strong>,
              so admin changes apply immediately in dev without a reload.
            </p>
          </section>

          {/* ── All flags table ── */}
          <section id="all-flags">
            <h2 className={H2}>All flags</h2>
            <p className={P}>
              The table below is generated directly from{" "}
              <code className={CODE}>FLAG_DEFINITIONS</code> and is always in sync with the
              codebase.
            </p>
            <div className="mt-6">
              <FlagsTable />
            </div>
          </section>

          {/* ── Requesting a new flag ── */}
          <section id="requesting">
            <h2 className={H2}>Requesting a new flag</h2>
            <p className={P}>
              To add a new feature flag, follow these steps:
            </p>
            <ol className="mt-4 space-y-4 list-none pl-0">
              {[
                {
                  n: "1",
                  title: "Add the ID to the FlagId union type",
                  body: (
                    <>
                      Open <code className={CODE}>src/lib/feature-flags.ts</code> and add your
                      new ID to the <code className={CODE}>FlagId</code> union. Use{" "}
                      <code className={CODE}>snake_case</code> and keep it descriptive.
                    </>
                  ),
                },
                {
                  n: "2",
                  title: "Add a Flag definition to FLAG_DEFINITIONS",
                  body: (
                    <>
                      Add an entry to the <code className={CODE}>FLAG_DEFINITIONS</code> array
                      with <code className={CODE}>id</code>, <code className={CODE}>label</code>,{" "}
                      <code className={CODE}>description</code>,{" "}
                      <code className={CODE}>defaultEnabled</code>, and{" "}
                      <code className={CODE}>audience</code>.
                    </>
                  ),
                },
                {
                  n: "3",
                  title: "Use the flag in your component",
                  body: (
                    <>
                      Gate your feature with <code className={CODE}>useFlagEnabled("your_flag_id")</code>{" "}
                      (client) or <code className={CODE}>isFlagEnabled("your_flag_id")</code>{" "}
                      (server). Both are type-safe.
                    </>
                  ),
                },
                {
                  n: "4",
                  title: "Open a PR",
                  body: (
                    <>
                      The flag will appear automatically in the Dev Panel and the Admin flags
                      table once merged. No other registration is needed.
                    </>
                  ),
                },
              ].map((step) => (
                <li key={step.n} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent font-mono text-sm text-accent">
                    {step.n}
                  </span>
                  <div>
                    <p className="font-medium text-text-primary">{step.title}</p>
                    <p className="mt-1 text-text-secondary">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 rounded border border-border-subtle bg-bg-elevated p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                Audience values
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="py-2 pr-6 text-left font-mono text-xs uppercase tracking-widest text-text-muted">Value</th>
                      <th className="py-2 text-left font-mono text-xs uppercase tracking-widest text-text-muted">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {[
                      ["all", "Every authenticated user (and public visitors where applicable)"],
                      ["beta", "Users opted in to the beta programme"],
                      ["team+", "Team plan and above (Team, Enterprise)"],
                      ["enterprise", "Enterprise plan only"],
                      ["analyst+", "Analyst role or above, regardless of plan"],
                    ].map(([val, desc]) => (
                      <tr key={val}>
                        <td className="py-2 pr-6 font-mono text-xs text-text-primary align-top">
                          {val}
                        </td>
                        <td className="py-2 text-text-secondary">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Support footer */}
          <div className="mt-14 rounded border border-border-subtle bg-bg-elevated p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Questions?
            </p>
            <p className="mt-2 text-text-secondary">
              Ask in the <code className={CODE}>#eng-platform</code> Slack channel or open an
              issue tagged <code className={CODE}>feature-flags</code>. For urgent flag changes in
              production, use the{" "}
              <Link href="/admin/flags" className="text-accent hover:underline">
                Admin → Feature Flags
              </Link>{" "}
              kill-switch.
            </p>
          </div>
        </article>
      </div>
    </>
  );
}
