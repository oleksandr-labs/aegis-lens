import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { classifyText, extractCoords, extractEntities } from "@/lib/classifier";

/**
 * /tools/classifier — interactive demo of the heuristic classifier.
 *
 * Implemented as a plain GET form: the textarea posts `?text=...` back to
 * this same page, which then renders the classification + entities +
 * coordinate extraction server-side. For programmatic access use
 * `POST /api/classify`.
 */

const EXAMPLE_TEXT =
  "A Shahed drone struck a substation near Mykolaiv. Coords: 46.98, 31.99.";

const lp = (lc: Locale) => (lc === "en" ? "/tools/classifier" : `/${lc}/tools/classifier`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Classifier demo",
    description:
      "Heuristic text classifier + entity extractor for OSINT events. Paste a sentence to see class, signals, entities, and coordinates.",
    pathFor: lp,
  });
}

export default async function ClassifierDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ text?: string }>;
}) {
  const { text: raw } = await searchParams;
  const submitted = typeof raw === "string" ? raw.trim() : "";
  const initial = submitted || EXAMPLE_TEXT;

  const result = submitted
    ? {
        classification: classifyText(submitted),
        entities: extractEntities(submitted),
        coords: extractCoords(submitted),
      }
    : null;

  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Classifier"
        description="Paste a short event description. The page applies keyword rules + regex to classify the event, extract named entities, and find decimal-degrees coordinates. No LLM in the loop."
      />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <form method="GET" className="space-y-3">
          <label
            htmlFor="text"
            className="block font-mono text-[10px] uppercase tracking-wider text-text-muted"
          >
            Input text
          </label>
          <textarea
            id="text"
            name="text"
            rows={6}
            defaultValue={initial}
            className="w-full rounded border border-border-subtle bg-bg-surface p-3 font-mono text-sm text-text-primary"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded border border-border-subtle bg-bg-surface px-4 py-2 text-sm font-semibold text-text-primary hover:border-text-muted"
            >
              Classify
            </button>
            <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
              POST /api/classify for programmatic use
            </span>
          </div>
        </form>

        {result ? (
          <div className="mt-8 space-y-6">
            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <h2 className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Classification
              </h2>
              <dl className="mt-2 grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-text-muted">Class</dt>
                <dd className="text-text-primary">
                  {result.classification.class ?? <em className="text-text-muted">(none)</em>}
                </dd>
                <dt className="text-text-muted">Subclass</dt>
                <dd className="text-text-primary">
                  {result.classification.subclass ?? <em className="text-text-muted">—</em>}
                </dd>
                <dt className="text-text-muted">Confidence</dt>
                <dd className="text-text-primary">
                  {result.classification.confidence.toFixed(2)}
                </dd>
                <dt className="text-text-muted">Signals</dt>
                <dd className="text-text-primary">
                  {result.classification.signals.length ? (
                    <ul className="flex flex-wrap gap-1.5">
                      {result.classification.signals.map((s) => (
                        <li
                          key={s}
                          className="rounded border border-border-subtle px-1.5 py-0.5 font-mono text-[11px]"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <em className="text-text-muted">none</em>
                  )}
                </dd>
              </dl>
            </div>

            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <h2 className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Entities ({result.entities.length})
              </h2>
              {result.entities.length === 0 ? (
                <p className="mt-2 text-sm text-text-muted">No entities matched.</p>
              ) : (
                <ul className="mt-2 space-y-1 font-mono text-xs">
                  {result.entities.map((e) => (
                    <li
                      key={`${e.type}-${e.span[0]}-${e.span[1]}`}
                      className="flex items-center gap-3"
                    >
                      <span className="w-20 text-text-muted">{e.type}</span>
                      <span className="flex-1 text-text-primary">{e.value}</span>
                      <span className="text-text-muted">
                        [{e.span[0]}, {e.span[1]}]
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded border border-border-subtle bg-bg-surface p-4">
              <h2 className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Coordinates
              </h2>
              {result.coords ? (
                <p className="mt-2 font-mono text-sm text-text-primary">
                  {result.coords.lat}, {result.coords.lon}
                </p>
              ) : (
                <p className="mt-2 text-sm text-text-muted">No coordinates detected.</p>
              )}
            </div>

            <details className="rounded border border-border-subtle bg-bg-surface p-4">
              <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Raw JSON
              </summary>
              <pre className="mt-2 overflow-x-auto font-mono text-xs text-text-primary">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <p className="mt-8 text-sm text-text-muted">
            Submit the form to see classification, entities, and extracted coordinates.
          </p>
        )}
      </section>
    </>
  );
}
