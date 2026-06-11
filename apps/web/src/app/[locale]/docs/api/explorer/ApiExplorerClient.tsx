"use client";

import { useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ParamDef = {
  name: string;
  type: "string" | "number";
  default: string;
  description: string;
  isPathParam?: boolean;
};

type Endpoint = {
  id: string;
  method: "GET" | "POST";
  path: string;
  summary: string;
  description: string;
  params: ParamDef[];
  body?: string;
};

type ResponseState = {
  status: number;
  data: unknown;
  time: number;
} | null;

type SnippetTab = "curl" | "typescript" | "python";

// ---------------------------------------------------------------------------
// Endpoint catalogue
// ---------------------------------------------------------------------------

const ENDPOINTS: Endpoint[] = [
  {
    id: "list-events",
    method: "GET",
    path: "/api/events",
    summary: "List events",
    description:
      "Retrieve verified events with filtering. Supports time window, country, event class, severity, and confidence filters.",
    params: [
      { name: "country", type: "string", default: "ua", description: "ISO 3166-1 alpha-2 country code" },
      { name: "hours", type: "number", default: "24", description: "Time window in hours (0 = all time)" },
      { name: "class", type: "string", default: "", description: "Filter by event class (repeatable)" },
      { name: "limit", type: "number", default: "20", description: "Max results (1–100)" },
      { name: "minSeverity", type: "number", default: "0", description: "Minimum severity (0–5)" },
      { name: "minConfidence", type: "number", default: "0", description: "Minimum confidence (0–100)" },
    ],
  },
  {
    id: "get-event",
    method: "GET",
    path: "/api/events/{id}",
    summary: "Get event by ID",
    description:
      "Retrieve a single event with full detail including sources and verification chain.",
    params: [
      {
        name: "id",
        type: "string",
        default: "01HXKHARKIVDRONE001",
        description: "Event ID (path param)",
        isPathParam: true,
      },
    ],
  },
  {
    id: "copilot",
    method: "POST",
    path: "/api/copilot",
    summary: "AI Copilot query",
    description: "Query the AI analyst copilot with a natural language prompt.",
    params: [],
    body: `{\n  "prompt": "Summarize last 6h in Kharkiv Oblast",\n  "country": "ua",\n  "hours": 6\n}`,
  },
  {
    id: "search",
    method: "GET",
    path: "/api/search/suggest",
    summary: "Search suggestions",
    description: "Get typeahead suggestions for the search interface.",
    params: [
      { name: "q", type: "string", default: "kharkiv", description: "Search query" },
      { name: "limit", type: "number", default: "6", description: "Max suggestions" },
    ],
  },
  {
    id: "list-layers",
    method: "GET",
    path: "/api/layers",
    summary: "List map layers",
    description: "Get available map layers with metadata.",
    params: [],
  },
  {
    id: "health",
    method: "GET",
    path: "/api/health",
    summary: "Health check",
    description: "API health and version.",
    params: [],
  },
];

const DEMO_KEY = "demo_key_aegis_lens_2026";
const BASE_URL = "https://aegislens.io";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildUrl(endpoint: Endpoint, paramValues: Record<string, string>): string {
  let path = endpoint.path;

  // Substitute path params
  for (const p of endpoint.params) {
    if (p.isPathParam) {
      path = path.replace(`{${p.name}}`, encodeURIComponent(paramValues[p.name] ?? p.default));
    }
  }

  // Append query params for GET endpoints
  const queryParams: [string, string][] = [];
  if (endpoint.method === "GET") {
    for (const p of endpoint.params) {
      if (p.isPathParam) continue;
      const val = paramValues[p.name] ?? p.default;
      if (val !== "") queryParams.push([p.name, val]);
    }
  }

  const qs = queryParams.length
    ? "?" + queryParams.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")
    : "";

  return path + qs;
}

function buildFullUrl(endpoint: Endpoint, paramValues: Record<string, string>): string {
  return BASE_URL + buildUrl(endpoint, paramValues);
}

function buildDisplayUrl(endpoint: Endpoint, paramValues: Record<string, string>): string {
  // Human-readable (not encoded) for display
  let path = endpoint.path;
  for (const p of endpoint.params) {
    if (p.isPathParam) {
      path = path.replace(`{${p.name}}`, paramValues[p.name] ?? p.default);
    }
  }
  const queryParams: [string, string][] = [];
  if (endpoint.method === "GET") {
    for (const p of endpoint.params) {
      if (p.isPathParam) continue;
      const val = paramValues[p.name] ?? p.default;
      if (val !== "") queryParams.push([p.name, val]);
    }
  }
  const qs = queryParams.length
    ? "?" + queryParams.map(([k, v]) => `${k}=${v}`).join("&")
    : "";
  return BASE_URL + path + qs;
}

function buildDefaultParams(endpoint: Endpoint): Record<string, string> {
  return Object.fromEntries(endpoint.params.map((p) => [p.name, p.default]));
}

function statusLabel(status: number): string {
  const labels: Record<number, string> = {
    200: "OK", 201: "Created", 204: "No Content",
    400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
    404: "Not Found", 429: "Too Many Requests", 500: "Internal Server Error",
  };
  return labels[status] ?? "Unknown";
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return "text-success";
  if (status >= 400) return "text-danger";
  if (status === 0) return "text-warning";
  return "text-text-muted";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MethodBadge({ method }: { method: "GET" | "POST" }) {
  return (
    <span
      className={
        method === "GET"
          ? "rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-success/15 text-success"
          : "rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent"
      }
    >
      {method}
    </span>
  );
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative ml-1 cursor-help">
      <span className="font-mono text-[10px] text-text-muted select-none">?</span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 w-max max-w-[220px] -translate-x-1/2 rounded border border-border-default bg-bg-elevated px-2 py-1 text-xs text-text-secondary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Code snippet generator
// ---------------------------------------------------------------------------

function buildCurl(endpoint: Endpoint, paramValues: Record<string, string>, apiKey: string, bodyText: string): string {
  const url = buildFullUrl(endpoint, paramValues);
  if (endpoint.method === "POST") {
    return (
      `curl -X POST "${url}" \\\n` +
      `  -H "Authorization: Bearer ${apiKey}" \\\n` +
      `  -H "Content-Type: application/json" \\\n` +
      `  -d '${bodyText}'`
    );
  }
  return `curl -X GET "${url}" \\\n  -H "Authorization: Bearer ${apiKey}"`;
}

function buildTypescript(endpoint: Endpoint, paramValues: Record<string, string>, bodyText: string): string {
  const relUrl = buildUrl(endpoint, paramValues);
  if (endpoint.method === "POST") {
    return (
      `const res = await fetch('${relUrl}', {\n` +
      `  method: 'POST',\n` +
      `  headers: { 'Content-Type': 'application/json' },\n` +
      `  body: JSON.stringify(${bodyText}),\n` +
      `});\n` +
      `const data = await res.json();`
    );
  }
  return `const res = await fetch('${relUrl}');\nconst data = await res.json();`;
}

function buildPython(endpoint: Endpoint, paramValues: Record<string, string>, bodyText: string): string {
  let path = endpoint.path;
  for (const p of endpoint.params) {
    if (p.isPathParam) {
      path = path.replace(`{${p.name}}`, paramValues[p.name] ?? p.default);
    }
  }

  if (endpoint.method === "POST") {
    return (
      `import requests\n\n` +
      `r = requests.post(\n` +
      `    '${BASE_URL}${path}',\n` +
      `    json=${bodyText}\n` +
      `)\n` +
      `data = r.json()`
    );
  }

  const qp = endpoint.params
    .filter((p) => !p.isPathParam)
    .map((p) => {
      const val = paramValues[p.name] ?? p.default;
      if (val === "") return null;
      const pyVal = p.type === "number" ? val : `'${val}'`;
      return `    '${p.name}': ${pyVal}`;
    })
    .filter(Boolean);

  if (qp.length === 0) {
    return (
      `import requests\n\n` +
      `r = requests.get('${BASE_URL}${path}')\n` +
      `data = r.json()`
    );
  }

  return (
    `import requests\n\n` +
    `r = requests.get(\n` +
    `    '${BASE_URL}${path}',\n` +
    `    params={\n${qp.join(",\n")}\n    }\n` +
    `)\n` +
    `data = r.json()`
  );
}

// ---------------------------------------------------------------------------
// Snippet panel
// ---------------------------------------------------------------------------

function CodeSnippets({
  endpoint,
  paramValues,
  apiKey,
  bodyText,
}: {
  endpoint: Endpoint;
  paramValues: Record<string, string>;
  apiKey: string;
  bodyText: string;
}) {
  const [tab, setTab] = useState<SnippetTab>("curl");
  const [copied, setCopied] = useState(false);

  const snippets: Record<SnippetTab, string> = {
    curl: buildCurl(endpoint, paramValues, apiKey, bodyText),
    typescript: buildTypescript(endpoint, paramValues, bodyText),
    python: buildPython(endpoint, paramValues, bodyText),
  };

  const code = snippets[tab];

  function copySnippet() {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="mt-6 rounded border border-border-subtle bg-bg-elevated">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <div className="flex gap-1">
          {(["curl", "typescript", "python"] as SnippetTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                tab === t
                  ? "rounded px-2.5 py-1 font-mono text-xs bg-bg-surface text-text-primary"
                  : "rounded px-2.5 py-1 font-mono text-xs text-text-muted hover:text-text-secondary"
              }
            >
              {t === "curl" ? "cURL" : t === "typescript" ? "TypeScript" : "Python"}
            </button>
          ))}
        </div>
        <button
          onClick={copySnippet}
          className="font-mono text-[10px] text-text-muted hover:text-text-primary"
        >
          {copied ? "copied!" : "copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-text-secondary">
        {code}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Response panel
// ---------------------------------------------------------------------------

function ResponsePanel({ response, loading }: { response: ResponseState; loading: boolean }) {
  const [copied, setCopied] = useState(false);

  function copyResponse() {
    if (!response) return;
    void navigator.clipboard.writeText(JSON.stringify(response.data, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Response
        </h3>
        {response && (
          <div className="flex items-center gap-3">
            <span className={`font-mono text-xs font-bold ${statusColor(response.status)}`}>
              {response.status} {statusLabel(response.status)}
            </span>
            <span className="font-mono text-[10px] text-text-muted">{response.time}ms</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
          <span className="animate-pulse">Sending request…</span>
        </div>
      )}

      {!loading && !response && (
        <div className="flex flex-1 items-center justify-center rounded border border-border-subtle bg-bg-elevated">
          <p className="text-center text-xs text-text-muted">
            Hit <span className="text-accent">Send Request</span> to see the response here.
          </p>
        </div>
      )}

      {!loading && response && (
        <div className="flex flex-1 flex-col gap-2 overflow-hidden">
          <pre className="flex-1 overflow-auto rounded border border-border-subtle bg-bg-base p-3 font-mono text-xs text-text-primary">
            {JSON.stringify(response.data, null, 2)}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={copyResponse}
              className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            >
              {copied ? "Copied!" : "Copy response"}
            </button>
            <a
              href={`data:application/json,${encodeURIComponent(JSON.stringify(response.data, null, 2))}`}
              download="response.json"
              className="rounded border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
            >
              Download JSON
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main client component
// ---------------------------------------------------------------------------

export function ApiExplorerClient() {
  const [selectedId, setSelectedId] = useState<string>(ENDPOINTS[0].id);
  const [paramValues, setParamValues] = useState<Record<string, string>>(
    buildDefaultParams(ENDPOINTS[0]),
  );
  const [bodyText, setBodyText] = useState<string>(ENDPOINTS[0].body ?? "");
  const [apiKey, setApiKey] = useState(DEMO_KEY);
  const [showKey, setShowKey] = useState(false);
  const [response, setResponse] = useState<ResponseState>(null);
  const [loading, setLoading] = useState(false);

  const endpoint = ENDPOINTS.find((e) => e.id === selectedId) ?? ENDPOINTS[0];

  function selectEndpoint(ep: Endpoint) {
    setSelectedId(ep.id);
    setParamValues(buildDefaultParams(ep));
    setBodyText(ep.body ?? "");
    setResponse(null);
  }

  function setParam(name: string, value: string) {
    setParamValues((prev) => ({ ...prev, [name]: value }));
  }

  const sendRequest = useCallback(async () => {
    setLoading(true);
    const start = Date.now();
    try {
      const url = buildUrl(endpoint, paramValues);
      const options: RequestInit =
        endpoint.method === "POST"
          ? {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: bodyText,
            }
          : {
              method: "GET",
              headers: { Authorization: `Bearer ${apiKey}` },
            };
      const res = await fetch(url, options);
      let data: unknown;
      try {
        data = await res.json();
      } catch {
        data = { raw: await res.text() };
      }
      setResponse({ status: res.status, data, time: Date.now() - start });
    } catch (e) {
      setResponse({ status: 0, data: { error: String(e) }, time: Date.now() - start });
    }
    setLoading(false);
  }, [endpoint, paramValues, apiKey, bodyText]);

  const displayUrl = buildDisplayUrl(endpoint, paramValues);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      {/* 3-panel layout */}
      <div className="flex gap-0 rounded border border-border-subtle overflow-hidden" style={{ minHeight: "680px" }}>

        {/* ── Left panel: endpoint list ── */}
        <aside className="w-60 shrink-0 border-r border-border-subtle bg-bg-elevated">
          <div className="border-b border-border-subtle px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
              Endpoints
            </p>
          </div>
          <nav className="py-1">
            {ENDPOINTS.map((ep) => (
              <button
                key={ep.id}
                onClick={() => selectEndpoint(ep)}
                className={
                  "flex w-full items-start gap-2.5 border-l-2 px-3 py-2.5 text-left transition-colors " +
                  (ep.id === selectedId
                    ? "border-accent bg-bg-surface text-text-primary"
                    : "border-transparent text-text-secondary hover:bg-bg-surface/50 hover:text-text-primary")
                }
              >
                <span className="mt-0.5 shrink-0">
                  <MethodBadge method={ep.method} />
                </span>
                <span className="text-xs leading-snug">{ep.summary}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Center panel: request builder ── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Header bar */}
          <div className="border-b border-border-subtle bg-bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <MethodBadge method={endpoint.method} />
              <code className="flex-1 truncate font-mono text-xs text-text-primary">
                {displayUrl}
              </code>
            </div>
            <p className="mt-1.5 text-xs text-text-muted">{endpoint.description}</p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {/* Authorization */}
            <section>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
                Authorization
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 rounded border border-border-default bg-bg-base px-2.5 py-1.5 font-mono text-xs text-text-primary outline-none focus:border-accent"
                  placeholder="API key"
                />
                <button
                  onClick={() => setShowKey((v) => !v)}
                  className="shrink-0 rounded border border-border-subtle bg-bg-surface px-2.5 py-1.5 font-mono text-[10px] text-text-muted hover:text-text-primary"
                >
                  {showKey ? "hide" : "show"}
                </button>
              </div>
            </section>

            {/* Parameters / body */}
            {endpoint.params.length > 0 && (
              <section>
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
                  Parameters
                </h3>
                <div className="space-y-2">
                  {endpoint.params.map((p) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <label className="flex w-36 shrink-0 items-center gap-1">
                        <span className="font-mono text-xs text-text-secondary">{p.name}</span>
                        {p.isPathParam && (
                          <span className="rounded px-1 font-mono text-[9px] bg-warning/10 text-warning">
                            path
                          </span>
                        )}
                        <Tooltip text={`${p.description} (${p.type})`} />
                      </label>
                      <input
                        type={p.type === "number" ? "number" : "text"}
                        value={paramValues[p.name] ?? p.default}
                        onChange={(e) => setParam(p.name, e.target.value)}
                        placeholder={p.default || p.name}
                        className="flex-1 rounded border border-border-default bg-bg-base px-2.5 py-1.5 font-mono text-xs text-text-primary outline-none focus:border-accent"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {endpoint.method === "POST" && (
              <section>
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-2">
                  Request body (JSON)
                </h3>
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={8}
                  spellCheck={false}
                  className="w-full rounded border border-border-default bg-bg-base px-2.5 py-2 font-mono text-xs text-text-primary outline-none focus:border-accent resize-y"
                />
              </section>
            )}

            {/* Send */}
            <button
              onClick={() => void sendRequest()}
              disabled={loading}
              className="w-full rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent-hover disabled:opacity-50 transition-opacity"
            >
              {loading ? "Sending…" : "Send Request"}
            </button>

            {/* Code snippets */}
            <CodeSnippets
              endpoint={endpoint}
              paramValues={paramValues}
              apiKey={apiKey}
              bodyText={bodyText}
            />
          </div>
        </main>

        {/* ── Right panel: response ── */}
        <aside className="w-80 shrink-0 border-l border-border-subtle bg-bg-elevated px-4 py-4">
          <ResponsePanel response={response} loading={loading} />
        </aside>
      </div>
    </div>
  );
}
