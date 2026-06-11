import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "SDKs and code samples";
const DESCRIPTION =
  "Call the Aegis Lens public API from JavaScript, TypeScript, Python, Go, Ruby, PHP, and the command line. Includes downloadable Postman collection and OpenAPI specification.";

const PRE_CLASS =
  "rounded border border-border-subtle bg-bg-elevated p-3 font-mono text-xs text-text-secondary overflow-x-auto whitespace-pre";

const JS_SAMPLE = `const res = await fetch("https://aegislens.io/api/events?country=ua&limit=10");
const { data } = await res.json();
console.log(data);`;

const TS_SAMPLE = `type AegisEvent = {
  eventId: string;
  occurredAt: string;
  class: string;
  dangerScore: number;
};

type EventsResponse = { data: AegisEvent[]; meta: { count: number; total: number } };

const res = await fetch("https://aegislens.io/api/events?country=ua&limit=10");
const { data }: EventsResponse = await res.json();
for (const e of data) {
  console.log(e.eventId, e.class, e.dangerScore);
}`;

const PYTHON_SAMPLE = `import requests

r = requests.get(
    "https://aegislens.io/api/events",
    params={"country": "ua", "limit": 10},
    timeout=10,
)
r.raise_for_status()
for event in r.json()["data"]:
    print(event["eventId"], event["class"], event["dangerScore"])`;

const CURL_SAMPLE = `curl -s "https://aegislens.io/api/events?country=ua&limit=10" | jq '.data[0]'`;

const GO_SAMPLE = `package main

import (
\t"encoding/json"
\t"fmt"
\t"net/http"
)

type Event struct {
\tEventID     string  \`json:"eventId"\`
\tOccurredAt  string  \`json:"occurredAt"\`
\tClass       string  \`json:"class"\`
\tDangerScore float64 \`json:"dangerScore"\`
}

type EventsResponse struct {
\tData []Event \`json:"data"\`
}

func main() {
\tresp, err := http.Get("https://aegislens.io/api/events?country=ua&limit=10")
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer resp.Body.Close()

\tvar out EventsResponse
\tif err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
\t\tpanic(err)
\t}
\tfor _, e := range out.Data {
\t\tfmt.Println(e.EventID, e.Class, e.DangerScore)
\t}
}`;

const RUBY_SAMPLE = `require "net/http"
require "json"
require "uri"

uri = URI("https://aegislens.io/api/events")
uri.query = URI.encode_www_form(country: "ua", limit: 10)

body = JSON.parse(Net::HTTP.get(uri))
body["data"].each do |e|
  puts "#{e['eventId']} #{e['class']} #{e['dangerScore']}"
end`;

const PHP_SAMPLE = `<?php
$query = http_build_query(["country" => "ua", "limit" => 10]);
$raw = file_get_contents("https://aegislens.io/api/events?{$query}");
$body = json_decode($raw, true);
foreach ($body["data"] as $event) {
    echo "{$event['eventId']} {$event['class']} {$event['dangerScore']}\\n";
}`;

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
    pathFor: (lc) => localePath(lc, "/docs/sdks"),
  });
}

export default async function SdksPage({
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
      <PageHeader eyebrow="Developers" title={TITLE} description={DESCRIPTION} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-4xl px-4 py-12 text-text-secondary">
        <section>
          <h2 className="text-2xl font-semibold text-text-primary">Overview</h2>
          <p className="mt-3">
            The Aegis Lens public API is a plain JSON HTTP service — any language with an
            HTTP client can consume it directly, no SDK required. The samples below cover the
            most common stacks. All examples target the read-only{" "}
            <code className="font-mono text-text-primary">/api/events</code> endpoint; the
            same patterns apply to{" "}
            <code className="font-mono text-text-primary">/api/sources</code>,{" "}
            <code className="font-mono text-text-primary">/api/reports</code>, and the rest of
            the public surface.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-text-primary">Downloads</h2>
          <p className="mt-3">
            Import the entire API surface into your favourite tool. Both files are served from
            the same domain and are safe to fetch from CI.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <a
                href="/api/postman.json"
                className="text-text-primary underline underline-offset-4 hover:text-accent-primary"
                download
              >
                Download Postman Collection
              </a>{" "}
              — Postman v2.1 collection compatible with Postman and Insomnia.
            </li>
            <li>
              <a
                href="/api/openapi.json"
                className="text-text-primary underline underline-offset-4 hover:text-accent-primary"
                download
              >
                Download OpenAPI spec
              </a>{" "}
              — OpenAPI 3.1 specification for client codegen.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">JavaScript (fetch)</h2>
          <p className="mt-3">
            Works unchanged in modern browsers, Node 18+, Deno, Bun, and any edge runtime that
            implements the WHATWG Fetch API.
          </p>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{JS_SAMPLE}</code>
          </pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">TypeScript (fetch)</h2>
          <p className="mt-3">
            Same wire format, with hand-written types. For a fully-typed client, generate one
            from the OpenAPI spec linked above using{" "}
            <code className="font-mono text-text-primary">openapi-typescript</code> or{" "}
            <code className="font-mono text-text-primary">openapi-fetch</code>.
          </p>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{TS_SAMPLE}</code>
          </pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Python (requests)</h2>
          <p className="mt-3">
            The{" "}
            <code className="font-mono text-text-primary">requests</code> library is the
            simplest path; <code className="font-mono text-text-primary">httpx</code> works
            identically and adds async support.
          </p>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{PYTHON_SAMPLE}</code>
          </pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">cURL</h2>
          <p className="mt-3">
            Useful for quick smoke tests, shell pipelines, and CI checks. Pipe through{" "}
            <code className="font-mono text-text-primary">jq</code> to inspect specific
            fields.
          </p>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{CURL_SAMPLE}</code>
          </pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Go (net/http)</h2>
          <p className="mt-3">
            Standard library only — no third-party dependencies. For production code, set a
            custom <code className="font-mono text-text-primary">http.Client</code> with an
            explicit timeout.
          </p>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{GO_SAMPLE}</code>
          </pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Ruby (net/http)</h2>
          <p className="mt-3">
            Ships with the Ruby standard library. The{" "}
            <code className="font-mono text-text-primary">faraday</code> gem is a drop-in
            replacement if you want middleware.
          </p>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{RUBY_SAMPLE}</code>
          </pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">PHP</h2>
          <p className="mt-3">
            Vanilla PHP works for a quick script. For production, use{" "}
            <code className="font-mono text-text-primary">Guzzle</code> or{" "}
            <code className="font-mono text-text-primary">Symfony HttpClient</code>.
          </p>
          <pre className={`${PRE_CLASS} mt-3`}>
            <code>{PHP_SAMPLE}</code>
          </pre>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-text-primary">Next steps</h2>
          <p className="mt-3">
            See the full endpoint reference, including query parameters, response shapes, rate
            limits, and error codes, on the{" "}
            <a
              href={localePath(locale, "/docs/api")}
              className="text-text-primary underline underline-offset-4 hover:text-accent-primary"
            >
              Public API documentation
            </a>{" "}
            page.
          </p>
        </section>
      </article>
    </>
  );
}
