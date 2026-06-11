import type { Metadata } from "next";
import { urls, localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { ALL_CLASSES, CLASS_COLOR } from "@/lib/filter-config";
import { AlertRulesSection } from "./AlertRulesSection";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Alerts & Subscriptions";
const DESCRIPTION = "Get notified when verified events happen.";

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
    pathFor: (lc) => localePath(lc, "/alerts"),
  });
}

function RssIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4 text-accent"
      aria-hidden="true"
    >
      <path d="M4 11a9 9 0 0 1 9 9h-2.5A6.5 6.5 0 0 0 4 13.5V11zm0-6a15 15 0 0 1 15 15h-2.5A12.5 12.5 0 0 0 4 7.5V5zm1.75 11.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5z" />
    </svg>
  );
}

type FeedRow = { title: string; url: string };

export default async function AlertsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const feeds: FeedRow[] = [
    { title: "All news (EN)", url: "/news/feed.xml" },
    { title: "All news (UK)", url: "/uk/news/feed.xml" },
    ...ALL_CLASSES.map((c) => ({
      title: `Topic — ${c.label}`,
      url: `/topics/${c.id}/feed.xml`,
    })),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    potentialAction: {
      "@type": "SubscribeAction",
      target: "/api/subscribe",
      name: "Subscribe to Aegis Lens alerts",
    },
  };

  return (
    <>
      <PageHeader eyebrow="Alerts" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* My Alert Rules — interactive client section */}
        <AlertRulesSection locale={locale} />

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">RSS feeds</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Subscribe in any reader. Feeds update as new verified events publish.
          </p>
          <ul className="mt-6 divide-y divide-border-subtle rounded border border-border-subtle bg-bg-surface">
            {feeds.map((f) => (
              <li
                key={f.url}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <RssIcon />
                <span className="text-sm font-medium text-text-primary">{f.title}</span>
                <code className="ml-auto rounded bg-bg-base px-2 py-1 font-mono text-xs text-text-secondary">
                  {f.url}
                </code>
                <a
                  href={f.url}
                  className="text-xs text-accent hover:underline"
                  rel="alternate"
                  type="application/rss+xml"
                >
                  Open
                </a>
                <button
                  type="button"
                  data-copy={f.url}
                  className="rounded border border-border-subtle px-2 py-1 text-xs text-text-secondary hover:text-text-primary"
                >
                  Copy
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Email alerts</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Email delivery launches Sprint 2.x — your address is queued.
          </p>
          <form
            action="/api/subscribe"
            method="POST"
            className="mt-6 space-y-5 rounded border border-border-subtle bg-bg-surface p-5"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-primary"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded border border-border-subtle bg-bg-surface px-3 py-2 text-text-primary outline-none focus:border-accent"
              />
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-text-primary">
                Topics
              </legend>
              <p className="mt-1 text-xs text-text-secondary">
                Leave all unchecked to receive everything.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ALL_CLASSES.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 rounded border border-border-subtle bg-bg-base px-3 py-2 text-sm text-text-primary"
                  >
                    <input
                      type="checkbox"
                      name="topics"
                      value={c.id}
                      className="h-4 w-4 accent-accent"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              className="rounded bg-accent px-4 py-2 text-bg-base hover:bg-accent/90"
            >
              Subscribe
            </button>
          </form>
        </section>

        {/* Telegram */}
        <section id="telegram" className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Telegram channel</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Receive verified alerts directly in Telegram. The bot sends a message for each
            high-confidence event within minutes of publication.
          </p>
          <div className="mt-6 rounded border border-border-subtle bg-bg-surface p-5">
            <ol className="space-y-3 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/10 font-mono text-[11px] font-semibold text-accent">
                  1
                </span>
                Open Telegram and search{" "}
                <code className="mx-1 rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-xs">
                  @aegislens_bot
                </code>
                or click the invite link below.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/10 font-mono text-[11px] font-semibold text-accent">
                  2
                </span>
                Send{" "}
                <code className="mx-1 rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-xs">
                  /start
                </code>{" "}
                to activate the bot and choose your topic filters.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/10 font-mono text-[11px] font-semibold text-accent">
                  3
                </span>
                Use{" "}
                <code className="mx-1 rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-xs">
                  /topics
                </code>{" "}
                to subscribe to specific event classes (military, cyber, humanitarian, etc.).
              </li>
            </ol>
            <a
              href="https://t.me/aegislens"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded bg-accent px-4 py-2 text-sm text-bg-base hover:bg-accent/90"
            >
              Join on Telegram →
            </a>
          </div>
        </section>

        {/* Webhooks */}
        <section id="webhooks" className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Webhooks</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Push verified events to your own endpoint in real time. Available on Pro and above.
            Aegis Lens sends a signed HTTP POST to your URL for each matching event.
          </p>

          <div className="mt-6 space-y-6">
            {/* Setup */}
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <h3 className="text-sm font-semibold text-text-primary">Setup</h3>
              <ol className="mt-3 space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/10 font-mono text-[11px] font-semibold text-accent">
                    1
                  </span>
                  In your account settings, go to <strong>Integrations → Webhooks</strong> and click
                  &ldquo;Add endpoint&rdquo;.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/10 font-mono text-[11px] font-semibold text-accent">
                    2
                  </span>
                  Paste your HTTPS endpoint URL and select which event classes should trigger it.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/10 font-mono text-[11px] font-semibold text-accent">
                    3
                  </span>
                  Aegis Lens signs each request with{" "}
                  <code className="mx-1 rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-xs">
                    X-Aegis-Signature
                  </code>
                  . Verify using the shared secret shown in settings.
                </li>
              </ol>
            </div>

            {/* Payload */}
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <h3 className="text-sm font-semibold text-text-primary">Payload format</h3>
              <p className="mt-2 text-xs text-text-secondary">
                Each webhook delivery is a JSON object with the following top-level fields:
              </p>
              <pre className="mt-3 overflow-x-auto rounded bg-bg-elevated p-3 font-mono text-xs text-text-primary">
{`{
  "event_id": "evt_01hxyz...",
  "class": "military_action",
  "occurred_at": "2025-05-24T14:32:00Z",
  "confidence": 0.91,
  "location": { "lat": 48.4647, "lon": 35.0462, "name": "Dnipro, UA" },
  "headline": "Strike on rail infrastructure reported — 2 sources",
  "source_count": 2,
  "url": "https://aegislens.io/events/evt_01hxyz..."
}`}
              </pre>
            </div>

            {/* Retry + security */}
            <div className="rounded border border-border-subtle bg-bg-surface p-5">
              <h3 className="text-sm font-semibold text-text-primary">Retries & security</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent">Retries</span>
                  <span>Failed deliveries (non-2xx or timeout) are retried up to 5 times with exponential backoff (5 s, 30 s, 2 min, 10 min, 1 h).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent">Signature</span>
                  <span>
                    Each request carries{" "}
                    <code className="rounded bg-bg-elevated px-1 py-0.5 font-mono text-xs">
                      X-Aegis-Signature: sha256=...
                    </code>
                    . Compute HMAC-SHA256 over the raw body with your secret to verify.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] uppercase tracking-wider text-accent">Timeout</span>
                  <span>Your endpoint must respond within 10 seconds. Return any 2xx to acknowledge.</span>
                </li>
              </ul>
            </div>

            <p className="text-sm">
              <a
                href={urls.docsWebhooks(locale)}
                className="text-accent hover:underline underline-offset-2"
              >
                Full webhook documentation →
              </a>
            </p>
          </div>
        </section>

        {/* Delivery channels summary */}
        <section id="channels" className="mt-12">
          <h2 className="text-xl font-semibold text-text-primary">Delivery channels</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Overview of all notification channels and which plans they are available on.
          </p>
          <div className="mt-5 overflow-x-auto rounded border border-border-subtle bg-bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="px-4 py-3 font-medium text-text-primary">Channel</th>
                  <th className="px-4 py-3 font-medium text-text-primary">Latency</th>
                  <th className="px-4 py-3 font-medium text-text-primary">Filter support</th>
                  <th className="px-4 py-3 font-medium text-text-primary">Plans</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-secondary">
                <tr>
                  <td className="px-4 py-3 font-medium text-text-primary">RSS / Atom</td>
                  <td className="px-4 py-3">~1 min</td>
                  <td className="px-4 py-3">Per topic, per country</td>
                  <td className="px-4 py-3">All (free)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-text-primary">Email digest</td>
                  <td className="px-4 py-3">15 min / 1 h / daily</td>
                  <td className="px-4 py-3">Topic, region, confidence threshold</td>
                  <td className="px-4 py-3">Free+</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-text-primary">Telegram bot</td>
                  <td className="px-4 py-3">~1 min</td>
                  <td className="px-4 py-3">Topic, confidence threshold</td>
                  <td className="px-4 py-3">Free+</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-text-primary">Webhook (HTTP POST)</td>
                  <td className="px-4 py-3">&lt;30 s</td>
                  <td className="px-4 py-3">Full — topic, region, class, confidence</td>
                  <td className="px-4 py-3">Pro+</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-text-primary">Slack integration</td>
                  <td className="px-4 py-3">&lt;1 min</td>
                  <td className="px-4 py-3">Topic, region</td>
                  <td className="px-4 py-3">Team+</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-text-primary">API streaming (SSE)</td>
                  <td className="px-4 py-3">Real-time</td>
                  <td className="px-4 py-3">Full filter API</td>
                  <td className="px-4 py-3">Pro+</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
