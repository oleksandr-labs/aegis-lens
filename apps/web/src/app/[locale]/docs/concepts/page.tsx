import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Core concepts";
const DESCRIPTION =
  "The eight primitives behind every Aegis Lens response: Event, Source, Region, Topic, Verification State, Confidence, Danger Score, and Severity.";

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
    pathFor: (lc) => localePath(lc, "/docs/concepts"),
  });
}

export default async function ConceptsPage({
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
      <PageHeader eyebrow="Docs" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-4xl px-4 py-10 text-text-secondary">
        <p>
          Everything Aegis Lens publishes is built from a small set of stable primitives. Once
          you understand these eight, the rest of the API and product surface follows directly.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Event</h2>
          <p className="mt-3">
            An <strong className="text-text-primary">Event</strong> is a single observable
            incident with a time, a place, and a class. Events are the atomic unit of the feed.
            Each event has a stable identifier, an occurrence timestamp, a publication
            timestamp, at least one source citation, and a numeric confidence score. Events are
            immutable once published; corrections appear as a new event with a reference back to
            the corrected one.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Source</h2>
          <p className="mt-3">
            A <strong className="text-text-primary">Source</strong> is anything that can produce
            a claim — a wire service, an official channel, a regional administration feed, a
            researcher account. Sources are organised into three tiers based on track record and
            verifiability. A higher tier mix increases the confidence score of any event that
            cites them.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Region</h2>
          <p className="mt-3">
            A <strong className="text-text-primary">Region</strong> is an administrative or
            operational geography — typically a country, oblast, raion, or named theatre.
            Regions are hierarchical: filtering by{" "}
            <code className="font-mono text-text-primary">ua</code> includes every oblast inside
            it. Regions are stable slugs; they do not change when underlying borders or
            administrative names change.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Topic</h2>
          <p className="mt-3">
            A <strong className="text-text-primary">Topic</strong> is a thematic grouping — for
            example <code className="font-mono text-text-primary">energy</code>,{" "}
            <code className="font-mono text-text-primary">cyber</code>, or{" "}
            <code className="font-mono text-text-primary">maritime</code>. An event can belong
            to multiple topics. Reports, subscriptions, and feeds are normally scoped to a topic
            plus a region.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Verification State</h2>
          <p className="mt-3">
            Each event carries a{" "}
            <strong className="text-text-primary">Verification State</strong>:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>
              <code className="font-mono text-text-primary">reported</code> — a single source claim,
              not yet corroborated.
            </li>
            <li>
              <code className="font-mono text-text-primary">corroborated</code> — at least two
              independent sources, or one tier-1 source with primary evidence.
            </li>
            <li>
              <code className="font-mono text-text-primary">verified</code> — corroborated and
              cross-checked against primary evidence such as imagery, geolocation, or official
              acknowledgement.
            </li>
            <li>
              <code className="font-mono text-text-primary">disputed</code> — sources disagree on
              material facts; the event remains visible with the dispute noted.
            </li>
            <li>
              <code className="font-mono text-text-primary">retracted</code> — the event has been
              withdrawn; included only when explicitly requested.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Confidence</h2>
          <p className="mt-3">
            <strong className="text-text-primary">Confidence</strong> is a 0&ndash;100 score
            expressing how sure we are that the event happened as described. It is a function of
            source count, source tier, corroboration, geolocation precision, and time since
            first report. A score of 100 is reserved for events we have directly verified
            against primary evidence; in practice useful filters live around{" "}
            <code className="font-mono text-text-primary">min_confidence=60</code>.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Danger Score</h2>
          <p className="mt-3">
            <strong className="text-text-primary">Danger Score</strong> is a 0&ndash;100 score
            expressing the assessed harm at the event location at the time of occurrence. It
            combines the event class, magnitude, population density, and proximity of critical
            infrastructure. Unlike confidence, danger is about consequence, not certainty: a
            confirmed near-miss has low danger, an unconfirmed but credible strike on a power
            substation has high danger.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Severity</h2>
          <p className="mt-3">
            <strong className="text-text-primary">Severity</strong> is a coarse human-readable
            label derived from the danger score, suitable for UI badges and alert routing:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>
              <code className="font-mono text-text-primary">info</code> — danger 0&ndash;19.
            </li>
            <li>
              <code className="font-mono text-text-primary">low</code> — danger 20&ndash;39.
            </li>
            <li>
              <code className="font-mono text-text-primary">moderate</code> — danger 40&ndash;59.
            </li>
            <li>
              <code className="font-mono text-text-primary">high</code> — danger 60&ndash;79.
            </li>
            <li>
              <code className="font-mono text-text-primary">critical</code> — danger 80&ndash;100.
            </li>
          </ul>
        </section>

        <p className="mt-10">
          For the full scoring rationale, see the{" "}
          <Link className="text-text-primary underline" href={localePath(locale, "/methodology")}>
            methodology
          </Link>{" "}
          page.
        </p>
      </article>
    </>
  );
}
