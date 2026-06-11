"use client";

import { useState } from "react";

type ApiKey = {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string | null;
  scopes: string[];
  requests: number;
};

const ALL_SCOPES = [
  { id: "events:read", label: "events:read", rw: "read", desc: "Read verified events from the events feed and search API." },
  { id: "events:write", label: "events:write", rw: "write", desc: "Submit event corrections and attach source documents." },
  { id: "copilot:query", label: "copilot:query", rw: "read", desc: "Send natural-language queries to the Aegis Copilot." },
  { id: "map:embed", label: "map:embed", rw: "read", desc: "Embed authenticated map tiles in external apps." },
  { id: "reports:generate", label: "reports:generate", rw: "write", desc: "Trigger automated intelligence report generation." },
  { id: "admin", label: "admin", rw: "write", desc: "Full administrative access — all endpoints. Use with extreme care." },
];

const INITIAL_KEYS: ApiKey[] = [
  {
    id: "key-1",
    name: "Production",
    key: "alens_prod_sk_a3f9c2d1e8b74056",
    created: "2026-05-01",
    lastUsed: "2026-06-03",
    scopes: ["events:read", "copilot:query"],
    requests: 14832,
  },
  {
    id: "key-2",
    name: "Development",
    key: "alens_dev_sk_7b1e4f2a9c083d5e",
    created: "2026-06-01",
    lastUsed: null,
    scopes: ["events:read"],
    requests: 47,
  },
];

function randomHex(len = 16): string {
  const arr = new Uint8Array(len / 2);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    arr.fill(0).forEach((_, i) => (arr[i] = Math.floor(Math.random() * 256)));
  }
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function maskKey(key: string): string {
  const prefix = key.slice(0, 12);
  return `${prefix}***...***`;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(["events:read"]);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);

  function handleReveal(id: string) {
    setRevealedKey(id);
    setTimeout(() => setRevealedKey(null), 10_000);
  }

  function handleRevoke(id: string) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setRevokeConfirm(null);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const id = `key-${Date.now()}`;
    const key = `alens_sk_${randomHex(16)}`;
    const today = new Date().toISOString().slice(0, 10);
    setKeys((prev) => [
      ...prev,
      {
        id,
        name: newKeyName.trim(),
        key,
        created: today,
        lastUsed: null,
        scopes: newKeyScopes,
        requests: 0,
      },
    ]);
    setNewKeyName("");
    setNewKeyScopes(["events:read"]);
    setShowCreate(false);
    setRevealedKey(id);
    setTimeout(() => setRevealedKey(null), 10_000);
  }

  function toggleScope(scope: string) {
    setNewKeyScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">API Keys</h1>
          <p className="mt-1 text-sm text-text-muted">
            Keys authenticate your requests to the Aegis Lens API. The full secret is shown
            only once — store it securely. Revoke unused keys promptly.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent/90"
        >
          {showCreate ? "Cancel" : "Create new key"}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded border border-border-default bg-bg-surface p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-text-primary">New API key</h2>

          <div>
            <label
              htmlFor="key-name"
              className="block text-xs font-medium text-text-secondary"
            >
              Name
            </label>
            <input
              id="key-name"
              type="text"
              required
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Production backend"
              className="mt-1.5 w-full rounded border border-border-default bg-bg-base px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
            />
          </div>

          <fieldset>
            <legend className="block text-xs font-medium text-text-secondary">
              Scopes
            </legend>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ALL_SCOPES.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2.5 rounded border border-border-subtle bg-bg-base px-3 py-2 text-sm cursor-pointer hover:bg-bg-elevated"
                >
                  <input
                    type="checkbox"
                    checked={newKeyScopes.includes(s.id)}
                    onChange={() => toggleScope(s.id)}
                    className="h-4 w-4 accent-accent"
                  />
                  <span className="font-mono text-xs text-text-primary">{s.id}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="rounded bg-accent px-4 py-2 text-sm font-semibold text-black hover:bg-accent/90"
            >
              Generate key
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded border border-border-default px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Keys table */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-text-primary">
          Your keys{" "}
          <span className="ml-1 font-mono text-[11px] text-text-muted">
            ({keys.length})
          </span>
        </h2>

        {keys.length === 0 ? (
          <p className="mt-3 rounded border border-border-subtle bg-bg-surface px-4 py-8 text-center text-sm text-text-muted">
            No API keys. Create one above to get started.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded border border-border-subtle bg-bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Key</th>
                  <th className="px-3 py-2.5">Scopes</th>
                  <th className="px-3 py-2.5">Created</th>
                  <th className="px-3 py-2.5">Last used</th>
                  <th className="px-3 py-2.5 text-right">Requests</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <>
                    <tr key={k.id} className="border-t border-border-subtle hover:bg-bg-elevated/50">
                      {/* Name */}
                      <td className="px-3 py-3 font-medium text-text-primary whitespace-nowrap">
                        {k.name}
                      </td>

                      {/* Key preview */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-xs text-text-secondary whitespace-nowrap">
                            {revealedKey === k.id ? k.key : maskKey(k.key)}
                          </code>
                          <button
                            type="button"
                            onClick={() =>
                              revealedKey === k.id
                                ? setRevealedKey(null)
                                : handleReveal(k.id)
                            }
                            className="shrink-0 rounded border border-border-subtle px-2 py-0.5 font-mono text-[10px] text-text-muted hover:text-text-primary"
                          >
                            {revealedKey === k.id ? "hide" : "show"}
                          </button>
                        </div>
                        {revealedKey === k.id && (
                          <p className="mt-1 font-mono text-[10px] text-accent">
                            Visible for 10 s — copy now
                          </p>
                        )}
                      </td>

                      {/* Scopes */}
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {k.scopes.map((s) => (
                            <span
                              key={s}
                              className="rounded bg-bg-base px-1.5 py-0.5 font-mono text-[10px] text-text-secondary border border-border-subtle"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Created */}
                      <td className="px-3 py-3 font-mono text-xs text-text-muted whitespace-nowrap">
                        {k.created}
                      </td>

                      {/* Last used */}
                      <td className="px-3 py-3 font-mono text-xs text-text-muted whitespace-nowrap">
                        {k.lastUsed ?? (
                          <span className="italic text-text-muted/60">never</span>
                        )}
                      </td>

                      {/* Requests */}
                      <td className="px-3 py-3 text-right font-mono text-xs text-text-secondary whitespace-nowrap">
                        {k.requests.toLocaleString()}
                      </td>

                      {/* Revoke */}
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        {revokeConfirm === k.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRevoke(k.id)}
                              className="rounded border border-danger px-2 py-1 text-xs text-danger hover:bg-danger/10"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setRevokeConfirm(null)}
                              className="rounded border border-border-subtle px-2 py-1 text-xs text-text-muted hover:text-text-primary"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRevokeConfirm(k.id)}
                            className="rounded border border-border-default px-3 py-1 text-xs text-text-muted hover:border-danger hover:text-danger"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Scopes reference */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold text-text-primary">Scope reference</h2>
        <p className="mt-1 text-xs text-text-muted">
          Grant only the scopes your integration needs. Admin scope should never be used in
          client-side code.
        </p>
        <div className="mt-3 overflow-hidden rounded border border-border-subtle bg-bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left font-mono text-[10px] uppercase tracking-widest text-text-muted">
                <th className="px-3 py-2.5">Scope</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Description</th>
              </tr>
            </thead>
            <tbody>
              {ALL_SCOPES.map((s) => (
                <tr key={s.id} className="border-t border-border-subtle">
                  <td className="px-3 py-2.5">
                    <code className="font-mono text-xs text-text-primary">{s.id}</code>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                        s.rw === "read"
                          ? "bg-accent/10 text-accent"
                          : "bg-orange-400/10 text-orange-400"
                      }`}
                    >
                      {s.rw}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-text-secondary">{s.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
