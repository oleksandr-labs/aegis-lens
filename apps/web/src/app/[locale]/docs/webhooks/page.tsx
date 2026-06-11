import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Webhooks";
const DESCRIPTION =
  "Receive real-time event notifications via HTTP POST to a URL you control. Webhooks are available on Pro and above, signed with HMAC-SHA256 for security.";

const PRE =
  "rounded border border-border-subtle bg-bg-elevated p-4 font-mono text-xs text-text-secondary overflow-x-auto whitespace-pre leading-relaxed";

const H2 = "mt-12 text-2xl font-semibold text-text-primary scroll-mt-20";
const H3 = "mt-6 text-lg font-semibold text-text-primary";
const P = "mt-3 text-text-secondary";
const CODE = "rounded bg-bg-base px-1.5 py-0.5 font-mono text-sm text-text-primary";

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
    pathFor: (lc) => localePath(lc, "/docs/webhooks"),
  });
}

export default async function WebhooksPage({
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

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* On-page nav */}
        <nav className="mb-10 flex flex-wrap gap-2 text-sm" aria-label="Page sections">
          {[
            ["#setup", "Quick Setup"],
            ["#payload", "Payload Format"],
            ["#signature", "Signature Verification"],
            ["#event-types", "Event Types"],
            ["#retries", "Retry Policy"],
            ["#testing", "Testing"],
            ["#security", "Security"],
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

          {/* ── Overview ── */}
          <section>
            <h2 className={H2} id="overview">Overview</h2>
            <p className={P}>
              A webhook delivers a verified event to a URL you control as soon as it is published
              and matches a saved subscription. Each subscription owns one delivery URL, one
              filter (region + topic + event class), and one signing secret. Aegis Lens sends
              an HTTP <code className={CODE}>POST</code> with a JSON body and an HMAC-SHA256
              signature header.
            </p>
            <p className={P}>
              Webhooks are available on <strong className="text-text-primary">Pro and above</strong>.
              You can manage subscriptions at{" "}
              <Link href={localePath(locale, "/account/integrations/webhooks")} className="text-accent hover:underline">
                /account/integrations/webhooks
              </Link>
              .
            </p>
          </section>

          {/* ── Quick Setup ── */}
          <section id="setup">
            <h2 className={H2}>Quick Setup</h2>
            <ol className="mt-4 space-y-4 pl-0 list-none">
              {[
                {
                  n: "1",
                  title: "Add your endpoint",
                  body: (
                    <>
                      Go to{" "}
                      <Link href={localePath(locale, "/account/integrations/webhooks")} className="text-accent hover:underline">
                        Account → Integrations → Webhooks
                      </Link>{" "}
                      and click <strong className="text-text-primary">Add endpoint</strong>. Enter
                      your HTTPS URL. HTTP endpoints are rejected — use a valid TLS certificate.
                    </>
                  ),
                },
                {
                  n: "2",
                  title: "Choose event types",
                  body: "Select which event types trigger deliveries. You can also add region and topic filters to narrow the signal.",
                },
                {
                  n: "3",
                  title: "Copy the signing secret",
                  body: "After saving, copy the generated signing secret. It is shown once. Store it in a secret manager — not in your source code.",
                },
                {
                  n: "4",
                  title: "Verify your endpoint",
                  body: "Send a test delivery from the dashboard to confirm your endpoint receives and acknowledges the request with a 2xx response.",
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
          </section>

          {/* ── Request headers ── */}
          <section>
            <h2 className={H2}>Request</h2>
            <p className={P}>
              Every delivery is an HTTP POST with the following headers:
            </p>
            <pre className={`${PRE} mt-4`}>
              <code>{`POST /your/webhook/path HTTP/1.1
Host: your-app.example.com
Content-Type: application/json
User-Agent: AegisLens-Webhook/1.0
X-Aegis-Delivery: dlv_01HZ8KX4P9T7
X-Aegis-Event: event.published
X-Aegis-Timestamp: 1748090160
X-Aegis-Signature: sha256=4f0d8b1c9a2e7b6f5d3c1a8e4b6d2f1c9e7a5b3d1f8c6a4e2b9d7f5a3c1e8b6d`}</code>
            </pre>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="py-2 pr-4 text-left font-mono text-xs uppercase tracking-widest text-text-muted">Header</th>
                    <th className="py-2 text-left font-mono text-xs uppercase tracking-widest text-text-muted">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {[
                    ["X-Aegis-Delivery", "Unique ID for this delivery attempt. Use for idempotency."],
                    ["X-Aegis-Event", "Event type that triggered this delivery (e.g. event.published)."],
                    ["X-Aegis-Timestamp", "Unix timestamp (seconds) when the delivery was initiated."],
                    ["X-Aegis-Signature", "HMAC-SHA256 signature in the format sha256=<hex>."],
                  ].map(([h, d]) => (
                    <tr key={h}>
                      <td className="py-2 pr-4 font-mono text-xs text-text-primary align-top">{h}</td>
                      <td className="py-2 text-text-secondary">{d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Payload ── */}
          <section id="payload">
            <h2 className={H2}>Payload Format</h2>
            <p className={P}>
              The body is a JSON object. The <code className={CODE}>data</code> field contains
              the full event record as it appears in the REST API.
            </p>
            <pre className={`${PRE} mt-4`}>
              <code>{`{
  "delivery_id": "dlv_01HZ8KX4P9T7",
  "subscription_id": "sub_01HZ7QW3R8M2",
  "type": "event.published",
  "created_at": "2026-05-24T11:36:00Z",
  "data": {
    "id": "evt_01HZ8KX4P9T7",
    "occurred_at": "2026-05-24T11:34:18Z",
    "published_at": "2026-05-24T11:35:55Z",
    "class": "kinetic",
    "subclass": "missile_strike",
    "country": "ua",
    "region": "kharkiv",
    "city": "kharkiv",
    "location": {
      "lat": 49.9935,
      "lon": 36.2304,
      "accuracy": "district"
    },
    "confidence": 87,
    "danger": 74,
    "severity": "high",
    "verification": "corroborated",
    "headline": "Multiple impacts reported in northern Kharkiv",
    "sources": ["src_reuters", "src_suspilne", "src_kharkiv_oba"],
    "url": "https://aegislens.io/events/evt_01HZ8KX4P9T7"
  }
}`}</code>
            </pre>
          </section>

          {/* ── Signature Verification ── */}
          <section id="signature">
            <h2 className={H2}>Signature Verification</h2>
            <p className={P}>
              The <code className={CODE}>X-Aegis-Signature</code> header is{" "}
              <code className={CODE}>sha256=&lt;hex&gt;</code>, where{" "}
              <code className={CODE}>hex</code> is the HMAC-SHA256 of the string{" "}
              <code className={CODE}>{`<X-Aegis-Timestamp>.<raw-body>`}</code> using your
              subscription&rsquo;s signing secret.
            </p>
            <p className={P}>
              Always verify the signature <strong className="text-text-primary">before</strong>{" "}
              parsing the JSON body. Use a constant-time equality function to prevent timing
              attacks. Reject requests where the timestamp is more than 5 minutes from your
              server clock.
            </p>

            <h3 className={H3}>Node.js / TypeScript</h3>
            <pre className={`${PRE} mt-3`}>
              <code>{`import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWebhook(
  rawBody: string,
  headers: Headers,
  secret: string,
): boolean {
  const ts = headers.get("X-Aegis-Timestamp");
  const sig = headers.get("X-Aegis-Signature");
  if (!ts || !sig?.startsWith("sha256=")) return false;

  // Reject stale requests (>5 min)
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;

  const expected = createHmac("sha256", secret)
    .update(\`\${ts}.\${rawBody}\`)
    .digest("hex");

  const a = Buffer.from(sig.slice("sha256=".length), "hex");
  const b = Buffer.from(expected, "hex");

  return a.length === b.length && timingSafeEqual(a, b);
}

// Express example
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  if (!verifyWebhook(req.body.toString(), new Headers(req.headers as Record<string, string>), process.env.AEGIS_WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: "Invalid signature" });
  }
  const payload = JSON.parse(req.body.toString());
  // Handle payload.type …
  res.status(200).json({ ok: true });
});`}</code>
            </pre>

            <h3 className={H3}>Python</h3>
            <pre className={`${PRE} mt-3`}>
              <code>{`import hashlib
import hmac
import time
from typing import Mapping

def verify_webhook(
    raw_body: bytes,
    headers: Mapping[str, str],
    secret: str,
) -> bool:
    ts = headers.get("X-Aegis-Timestamp")
    sig = headers.get("X-Aegis-Signature")
    if not ts or not sig or not sig.startswith("sha256="):
        return False

    # Reject stale requests (>5 min)
    if abs(time.time() - float(ts)) > 300:
        return False

    payload = f"{ts}.{raw_body.decode()}"
    expected = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    received = sig.removeprefix("sha256=")

    return hmac.compare_digest(expected, received)

# FastAPI example
@app.post("/webhook")
async def receive_webhook(request: Request):
    body = await request.body()
    if not verify_webhook(body, dict(request.headers), os.environ["AEGIS_WEBHOOK_SECRET"]):
        raise HTTPException(status_code=401, detail="Invalid signature")
    payload = json.loads(body)
    # Handle payload["type"] …
    return {"ok": True}`}</code>
            </pre>
          </section>

          {/* ── Event types ── */}
          <section id="event-types">
            <h2 className={H2}>Event Types</h2>
            <p className={P}>
              The <code className={CODE}>type</code> field in the payload identifies what
              triggered the delivery.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="py-2 pr-6 text-left font-mono text-xs uppercase tracking-widest text-text-muted">Type</th>
                    <th className="py-2 pr-6 text-left font-mono text-xs uppercase tracking-widest text-text-muted">Trigger</th>
                    <th className="py-2 text-left font-mono text-xs uppercase tracking-widest text-text-muted">Plans</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {[
                    ["event.published", "A new event passes verification and is published to the live map.", "Pro, Team, Enterprise"],
                    ["event.updated", "An existing event is materially updated (confidence, location, sources).", "Pro, Team, Enterprise"],
                    ["event.retracted", "An event is removed after being found inaccurate.", "Pro, Team, Enterprise"],
                    ["alert.triggered", "A saved alert rule matches a new event.", "Analyst, Pro, Team, Enterprise"],
                    ["incident.created", "A new incident group is created by an analyst.", "Team, Enterprise"],
                    ["incident.updated", "An incident is updated or closed.", "Team, Enterprise"],
                    ["subscription.limit_warning", "Your subscription is approaching a usage limit.", "All paid"],
                  ].map(([type, trigger, plans]) => (
                    <tr key={type}>
                      <td className="py-3 pr-6 font-mono text-xs text-text-primary align-top whitespace-nowrap">
                        {type}
                      </td>
                      <td className="py-3 pr-6 text-text-secondary align-top">{trigger}</td>
                      <td className="py-3 font-mono text-xs text-text-muted align-top">{plans}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Retry policy ── */}
          <section id="retries">
            <h2 className={H2}>Retry Policy</h2>
            <p className={P}>
              Your endpoint must return a <strong className="text-text-primary">2xx HTTP status within 10 seconds</strong>.
              Any other response — including 3xx redirects — is treated as a failure.
            </p>
            <p className={P}>
              Failed deliveries are retried automatically with exponential backoff:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="py-2 pr-6 text-left font-mono text-xs uppercase tracking-widest text-text-muted">Attempt</th>
                    <th className="py-2 text-left font-mono text-xs uppercase tracking-widest text-text-muted">Delay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {[
                    ["1st retry", "30 seconds"],
                    ["2nd retry", "5 minutes"],
                    ["3rd retry", "30 minutes"],
                    ["4th retry", "2 hours"],
                    ["5th retry", "8 hours"],
                    ["Final drop", "24 hours after first failure — surfaced in dashboard"],
                  ].map(([attempt, delay]) => (
                    <tr key={attempt}>
                      <td className="py-2 pr-6 font-mono text-xs text-text-primary">{attempt}</td>
                      <td className="py-2 text-text-secondary">{delay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={P}>
              Delivery is <strong className="text-text-primary">at-least-once</strong>.
              Deduplicate on <code className={CODE}>delivery_id</code> — the same{" "}
              <code className={CODE}>delivery_id</code> may arrive multiple times if your
              endpoint returns a 2xx but the connection drops before we receive it.
            </p>
            <p className={P}>
              Ordering is best-effort, not strict. Rely on{" "}
              <code className={CODE}>data.published_at</code> for chronology rather than
              delivery order.
            </p>
          </section>

          {/* ── Testing ── */}
          <section id="testing">
            <h2 className={H2}>Testing</h2>
            <h3 className={H3}>Webhook Playground</h3>
            <p className={P}>
              Use the webhook playground at{" "}
              <Link
                href={localePath(locale, "/api/integrations/webhooks/playground")}
                className="text-accent hover:underline"
              >
                /api/integrations/webhooks/playground
              </Link>{" "}
              to send test deliveries to any endpoint without waiting for a real event. Choose
              an event type, optionally paste a custom payload, and click{" "}
              <strong className="text-text-primary">Send test</strong>. The playground shows the
              full request and response including headers.
            </p>

            <h3 className={H3}>Local development with ngrok</h3>
            <p className={P}>
              To test against a local server, expose it with{" "}
              <code className={CODE}>ngrok http 3000</code> and paste the generated HTTPS URL
              as your endpoint. The playground will deliver directly to your localhost.
            </p>
            <pre className={`${PRE} mt-3`}>
              <code>{`# Install ngrok and expose local port 3000
npx ngrok http 3000

# ngrok outputs something like:
# Forwarding https://abc123.ngrok-free.app -> http://localhost:3000

# Use https://abc123.ngrok-free.app/webhook as your endpoint URL`}</code>
            </pre>

            <h3 className={H3}>Delivery logs</h3>
            <p className={P}>
              Every delivery attempt is logged at{" "}
              <Link
                href={localePath(locale, "/account/integrations/webhooks")}
                className="text-accent hover:underline"
              >
                Account → Integrations → Webhooks
              </Link>
              . Logs include the full request, response status, latency, and retry history.
              Logs are retained for 7 days.
            </p>
          </section>

          {/* ── Security ── */}
          <section id="security">
            <h2 className={H2}>Security Best Practices</h2>
            <ul className="mt-4 space-y-3 pl-0 list-none">
              {[
                {
                  title: "Always verify the signature",
                  body: "Never process a payload without first verifying X-Aegis-Signature. Accepting unsigned requests exposes you to spoofed events.",
                },
                {
                  title: "Use HTTPS only",
                  body: "We reject HTTP endpoints. Ensure your TLS certificate is valid and up to date.",
                },
                {
                  title: "Check the timestamp",
                  body: "Reject requests with a timestamp more than 5 minutes old to prevent replay attacks.",
                },
                {
                  title: "Store the secret securely",
                  body: "Keep the signing secret in a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.) — never commit it to source control.",
                },
                {
                  title: "Rotate secrets regularly",
                  body: "Rotate signing secrets every 90 days from Account → Integrations → Webhooks. Rotation is zero-downtime — both the old and new secrets are accepted for 30 minutes during cutover.",
                },
                {
                  title: "Respond quickly",
                  body: "Acknowledge receipt immediately (2xx within 10s) and process asynchronously. Slow endpoints risk being marked as failing and triggering the retry chain.",
                },
                {
                  title: "Deduplicate on delivery_id",
                  body: "Due to at-least-once delivery, the same event may arrive more than once. Treat delivery_id as the idempotency key.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 text-accent" aria-hidden="true">✓</span>
                  <div>
                    <p className="font-medium text-text-primary">{item.title}</p>
                    <p className="mt-0.5 text-text-secondary">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Support footer ── */}
          <div className="mt-14 rounded border border-border-subtle bg-bg-elevated p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Need help?
            </p>
            <p className="mt-2 text-text-secondary">
              Questions about webhooks? Check the{" "}
              <Link href={localePath(locale, "/help/webhook-signature-verification")} className="text-accent hover:underline">
                signature verification guide
              </Link>{" "}
              or{" "}
              <Link href={localePath(locale, "/contact")} className="text-accent hover:underline">
                contact support
              </Link>
              .
            </p>
          </div>
        </article>
      </div>
    </>
  );
}
