import { isAdminAuthenticated } from "@/lib/admin-gate";

type SourceKind = "telegram" | "satellite" | "news" | "official" | "cyber";

type Source = {
  slug: string;
  name: string;
  kind: SourceKind;
  language: string;
  reliability: number;
};

const SOURCES: Source[] = [
  { slug: "ua-mod-official", name: "Ministry of Defence (UA)", kind: "official", language: "uk", reliability: 0.92 },
  { slug: "kyiv-independent", name: "Kyiv Independent", kind: "news", language: "en", reliability: 0.86 },
  { slug: "tg-suspilne-news", name: "Suspilne News (Telegram)", kind: "telegram", language: "uk", reliability: 0.78 },
  { slug: "planet-labs-feed", name: "Planet Labs SkySat", kind: "satellite", language: "en", reliability: 0.88 },
  { slug: "tg-frontline-osint", name: "Frontline OSINT (Telegram)", kind: "telegram", language: "uk", reliability: 0.61 },
  { slug: "cert-ua-alerts", name: "CERT-UA Advisories", kind: "cyber", language: "en", reliability: 0.55 },
];

const KIND_COLOR: Record<SourceKind, string> = {
  telegram: "#4ea1ff",
  satellite: "#a855f7",
  news: "#22c55e",
  official: "#eab308",
  cyber: "#ef4444",
};

export default async function AdminSourcesPage() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    return (
      <div className="rounded border border-border-subtle bg-bg-surface p-6 text-sm text-text-muted">
        Sign in required. <a href="/admin" className="text-accent">Go to admin sign-in →</a>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-text-primary">Sources</h1>
      <p className="mt-1 text-sm text-text-muted">
        Curated source registry. {SOURCES.length} placeholder sources — DB-backed in Sprint 2.
      </p>

      <section className="mt-8 overflow-hidden rounded border border-border-subtle bg-bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border-subtle bg-bg-elevated">
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-text-muted">
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Kind</th>
              <th className="px-4 py-2">Lang</th>
              <th className="px-4 py-2 text-right">Reliability</th>
            </tr>
          </thead>
          <tbody>
            {SOURCES.map((s) => (
              <tr key={s.slug} className="border-t border-border-subtle">
                <td className="px-4 py-3 font-mono text-xs text-text-muted">{s.slug}</td>
                <td className="px-4 py-3 text-text-primary">{s.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: KIND_COLOR[s.kind] }}
                      aria-hidden
                    />
                    <span className="font-mono text-[11px] uppercase text-text-secondary">{s.kind}</span>
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs uppercase text-text-secondary">{s.language}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-text-primary">
                  {s.reliability.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-text-muted">
        planned · CRUD lands in Sprint 2
      </p>
    </>
  );
}
