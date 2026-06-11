import type { Metadata } from "next";
import Link from "next/link";

/**
 * Per-vessel SEO surface — /vessels/[mmsi]
 *
 * Server-rendered detail page for a maritime vessel: identity, flag/operator,
 * AIS + sanctions + shadow-fleet status, and a port-call timeline. Demo dataset
 * mirrors the /api/layers/maritime route so the surface is fully self-contained.
 * EN + UK strings on every user-facing field.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

type Bilingual = { en: string; uk: string };

interface PortCall {
  port: Bilingual;
  country: string;
  isSts: boolean;
  arrivedAt: string;
  departedAt: string | null;
  durationH: number | null;
}

interface VesselDetail {
  mmsi: string;
  imo: string | null;
  nameEn: string;
  nameUk: string;
  shipType: Bilingual;
  cargoClass: Bilingual | null;
  flag: string;
  flagName: Bilingual;
  flagOfConvenience: boolean;
  operator: { name: string; country: string; opaque: boolean } | null;
  lat: number;
  lon: number;
  speedKnots: number | null;
  headingDeg: number | null;
  destination: string | null;
  aisStatus: "transmitting" | "intermittent" | "dark";
  sanctioned: boolean;
  sanctionsLists: string[];
  sanctionsStatus: Bilingual;
  shadowScore: number;
  shadowTier: "none" | "watch" | "likely" | "high";
  shadowFactors: Bilingual[];
  summary: Bilingual;
  sourceUrls: string[];
  lastReportAt: string;
  portCalls: PortCall[];
}

// ── Demo data (mirrors /api/layers/maritime) ────────────────────────────────────

const DEMO_VESSELS: Record<string, VesselDetail> = {
  "273345678": {
    mmsi: "273345678",
    imo: "9512345",
    nameEn: "Volga Star",
    nameUk: "Волга Стар",
    shipType: { en: "Crude oil tanker", uk: "Нафтовий танкер" },
    cargoClass: { en: "Crude oil", uk: "Сира нафта" },
    flag: "GA",
    flagName: { en: "Gabon", uk: "Габон" },
    flagOfConvenience: true,
    operator: { name: "Opaque Maritime Ltd", country: "AE", opaque: true },
    lat: 45.2,
    lon: 36.55,
    speedKnots: 0.3,
    headingDeg: 210,
    destination: "STS KAVKAZ",
    aisStatus: "dark",
    sanctioned: true,
    sanctionsLists: ["OFAC SDN", "EU Consolidated"],
    sanctionsStatus: { en: "Sanctioned (OFAC + EU)", uk: "Під санкціями (OFAC + ЄС)" },
    shadowScore: 0.82,
    shadowTier: "high",
    shadowFactors: [
      { en: "Ageing tanker (19 yrs).", uk: "Старий танкер (19 р.)." },
      { en: "Flag of convenience (Gabon).", uk: "Зручний прапор (Габон)." },
      { en: "Opaque / shell-company ownership.", uk: "Непрозора власність (компанії-оболонки)." },
      { en: "Extended AIS gaps / dark running.", uk: "Тривалі прогалини AIS / рух без AIS." },
      { en: "Ship-to-ship transfer in a known STS zone.", uk: "Перевалка «судно-судно» у відомій зоні STS." },
    ],
    summary: {
      en: "Ageing Gabon-flagged crude tanker, OFAC + EU listed, conducting ship-to-ship transfer near the Kerch Strait with AIS switched off.",
      uk: "Старий танкер під прапором Габону, у списках OFAC та ЄС, виконує перевалку «судно-судно» поблизу Керченської протоки з вимкненим AIS.",
    },
    sourceUrls: ["https://www.marinetraffic.com/en/ais/details/ships/mmsi:273345678"],
    lastReportAt: new Date(Date.now() - 6 * 3600_000).toISOString(),
    portCalls: [
      { port: { en: "Novorossiysk", uk: "Новоросійськ" }, country: "RU", isSts: false, arrivedAt: new Date(Date.now() - 9 * 86400_000).toISOString(), departedAt: new Date(Date.now() - 8 * 86400_000).toISOString(), durationH: 26 },
      { port: { en: "Kerch / Kavkaz STS anchorage", uk: "Керченський / Кавказький рейд STS" }, country: "RU", isSts: true, arrivedAt: new Date(Date.now() - 6 * 3600_000).toISOString(), departedAt: null, durationH: null },
    ],
  },
  "272123456": {
    mmsi: "272123456",
    imo: "9456789",
    nameEn: "Koroleva",
    nameUk: "Королева",
    shipType: { en: "Bulk carrier", uk: "Балкер" },
    cargoClass: { en: "Grain", uk: "Зерно" },
    flag: "UA",
    flagName: { en: "Ukraine", uk: "Україна" },
    flagOfConvenience: false,
    operator: { name: "Odesa Shipping Co", country: "UA", opaque: false },
    lat: 46.35,
    lon: 30.9,
    speedKnots: 11.4,
    headingDeg: 195,
    destination: "ISTANBUL",
    aisStatus: "transmitting",
    sanctioned: false,
    sanctionsLists: [],
    sanctionsStatus: { en: "Not listed", uk: "Не у списках" },
    shadowScore: 0,
    shadowTier: "none",
    shadowFactors: [],
    summary: {
      en: "Ukraine-flagged bulk carrier on the Black Sea grain corridor, outbound from Odesa to Istanbul.",
      uk: "Балкер під прапором України на зерновому коридорі Чорного моря, прямує з Одеси до Стамбула.",
    },
    sourceUrls: ["https://www.marinetraffic.com/en/ais/details/ships/mmsi:272123456"],
    lastReportAt: new Date(Date.now() - 4 * 60_000).toISOString(),
    portCalls: [
      { port: { en: "Odesa", uk: "Одеса" }, country: "UA", isSts: false, arrivedAt: new Date(Date.now() - 3 * 86400_000).toISOString(), departedAt: new Date(Date.now() - 5 * 3600_000).toISOString(), durationH: 67 },
    ],
  },
};

const ALL_MMSI = Object.keys(DEMO_VESSELS);

// ── Static params + metadata ────────────────────────────────────────────────────

export function generateStaticParams(): { mmsi: string }[] {
  return ALL_MMSI.map((mmsi) => ({ mmsi }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mmsi: string }>;
}): Promise<Metadata> {
  const { mmsi } = await params;
  const v = DEMO_VESSELS[mmsi];
  if (!v) return { title: `Vessel ${mmsi}`, robots: { index: false } };
  const title = `${v.nameEn} (MMSI ${v.mmsi}) — ${v.shipType.en}`;
  return {
    title,
    description: v.summary.en,
    alternates: { canonical: `/vessels/${mmsi}` },
    openGraph: { title, description: v.summary.en, type: "profile" },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────────

function aisCls(status: VesselDetail["aisStatus"]): string {
  if (status === "transmitting") return "text-green-400";
  if (status === "intermittent") return "text-yellow-400";
  return "text-red-400";
}

function shadowCls(tier: VesselDetail["shadowTier"]): string {
  if (tier === "high") return "text-red-400";
  if (tier === "likely") return "text-orange-400";
  if (tier === "watch") return "text-yellow-400";
  return "text-text-muted";
}

function fmt(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

// ── Page ─────────────────────────────────────────────────────────────────────────

export default async function VesselPage({
  params,
}: {
  params: Promise<{ mmsi: string }>;
}) {
  const { mmsi } = await params;
  const v = DEMO_VESSELS[mmsi];

  if (!v) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-text-muted">404</div>
        <h1 className="mt-3 text-3xl font-semibold text-text-primary">Vessel not found</h1>
        <p className="mt-3 text-text-secondary">
          No vessel with MMSI <code className="font-mono text-accent">{mmsi}</code> exists in the
          current dataset. / Судно з MMSI {mmsi} відсутнє в наборі даних.
        </p>
        <Link
          href="/vessels"
          className="mt-6 inline-flex items-center gap-1.5 rounded border border-accent/30 px-4 py-2 font-mono text-sm text-accent hover:bg-accent/10"
        >
          ← All vessels
        </Link>
      </div>
    );
  }

  const mapHref = `https://www.openstreetmap.org/?mlat=${v.lat}&mlon=${v.lon}&zoom=8`;

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-10">

      {/* ── Header ── */}
      <div className={`rounded border p-4 ${v.sanctioned ? "border-red-500/50 bg-red-500/10" : "border-border-subtle bg-bg-surface"}`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm uppercase tracking-widest text-text-primary">
            {v.shipType.en} · {v.shipType.uk}
          </span>
          {v.sanctioned && (
            <span className="rounded border border-red-500/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-red-400">
              {v.sanctionsStatus.en} / {v.sanctionsStatus.uk}
            </span>
          )}
          <span className={`ml-auto font-mono text-sm ${aisCls(v.aisStatus)}`}>
            AIS: {v.aisStatus}
          </span>
        </div>
      </div>

      {/* ── Title ── */}
      <section>
        <nav className="mb-3 font-mono text-[11px] text-text-muted">
          <Link href="/vessels" className="hover:text-accent">Vessels</Link>
          {" / "}
          <span>MMSI {v.mmsi}</span>
        </nav>
        <h1 className="text-2xl font-semibold leading-snug text-text-primary">
          {v.nameEn} <span className="text-text-muted">/ {v.nameUk}</span>
        </h1>
        <p className="mt-3 text-text-secondary">{v.summary.en}</p>
        <p className="mt-1 text-sm text-text-muted">{v.summary.uk}</p>
      </section>

      {/* ── Identity ── */}
      <section aria-label="Identity">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Identity / Ідентифікація
        </h2>
        <dl className="grid grid-cols-2 gap-3 rounded border border-border-subtle bg-bg-surface p-4 font-mono text-sm">
          <div><dt className="text-text-muted">MMSI</dt><dd className="text-text-primary">{v.mmsi}</dd></div>
          <div><dt className="text-text-muted">IMO</dt><dd className="text-text-primary">{v.imo ?? "—"}</dd></div>
          <div>
            <dt className="text-text-muted">Flag / Прапор</dt>
            <dd className="text-text-primary">
              {v.flagName.en} ({v.flag}){v.flagOfConvenience ? " ⚑ FoC" : ""}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Cargo / Вантаж</dt>
            <dd className="text-text-primary">{v.cargoClass ? `${v.cargoClass.en} / ${v.cargoClass.uk}` : "—"}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Operator / Оператор</dt>
            <dd className="text-text-primary">
              {v.operator ? `${v.operator.name} (${v.operator.country})${v.operator.opaque ? " · opaque" : ""}` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-text-muted">Destination / Призначення</dt>
            <dd className="text-text-primary">{v.destination ?? "—"}</dd>
          </div>
        </dl>
      </section>

      {/* ── Position + status ── */}
      <section aria-label="Position">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Position & Status / Позиція та статус
        </h2>
        <div className="rounded border border-border-subtle bg-bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-sm">
            <div className="space-y-1">
              <div><span className="text-text-muted">Lat:</span> <span className="text-text-primary">{v.lat.toFixed(4)}°</span></div>
              <div><span className="text-text-muted">Lon:</span> <span className="text-text-primary">{v.lon.toFixed(4)}°</span></div>
              <div><span className="text-text-muted">Speed:</span> <span className="text-text-primary">{v.speedKnots ?? "?"} kn</span></div>
              <div><span className="text-text-muted">Heading:</span> <span className="text-text-primary">{v.headingDeg ?? "?"}°</span></div>
              <div className="text-[10px] text-text-muted">Last report: {fmt(v.lastReportAt)}</div>
            </div>
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-accent/30 px-3 py-1.5 font-mono text-xs text-accent hover:bg-accent/10"
            >
              View on map →
            </a>
          </div>
        </div>
      </section>

      {/* ── Sanctions ── */}
      <section aria-label="Sanctions">
        <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
          Sanctions Screening / Санкційний скринінг
        </h2>
        <div className={`rounded border p-4 ${v.sanctioned ? "border-red-500/40 bg-red-500/5" : "border-border-subtle bg-bg-surface"}`}>
          <div className="font-mono text-sm">
            <span className={v.sanctioned ? "text-red-400" : "text-green-400"}>
              {v.sanctionsStatus.en} / {v.sanctionsStatus.uk}
            </span>
          </div>
          {v.sanctionsLists.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {v.sanctionsLists.map((l) => (
                <li key={l} className="rounded border border-red-500/40 px-2 py-0.5 font-mono text-[10px] text-red-400">{l}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Shadow fleet ── */}
      {v.shadowFactors.length > 0 && (
        <section aria-label="Shadow fleet assessment">
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Shadow-Fleet Assessment / Оцінка тіньового флоту
          </h2>
          <div className="rounded border border-border-subtle bg-bg-surface p-4">
            <div className="font-mono text-sm">
              <span className={shadowCls(v.shadowTier)}>Tier: {v.shadowTier}</span>
              <span className="ml-3 text-text-muted">Score: {v.shadowScore.toFixed(2)}</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {v.shadowFactors.map((f, i) => (
                <li key={i} className="text-text-secondary">
                  • {f.en} <span className="text-text-muted">/ {f.uk}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-[10px] text-text-muted">
              Heuristic assessment, not an accusation. / Евристична оцінка, не звинувачення.
            </p>
          </div>
        </section>
      )}

      {/* ── Port-call timeline ── */}
      {v.portCalls.length > 0 && (
        <section aria-label="Port-call timeline">
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Port-Call Timeline / Хронологія заходів у порти
          </h2>
          <ol className="relative space-y-0 border-l border-border-subtle pl-6">
            {v.portCalls.map((c, idx) => (
              <li key={idx} className="relative pb-6 last:pb-0">
                <span className={`absolute -left-[9px] top-1.5 inline-block h-3.5 w-3.5 rounded-full border-2 border-bg-base ${c.isSts ? "bg-red-500" : "bg-accent"}`} />
                <div className="rounded border border-border-subtle bg-bg-surface p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium text-text-primary">
                      {c.port.en} <span className="text-text-muted">/ {c.port.uk}</span> ({c.country})
                      {c.isSts ? <span className="ml-2 text-red-400">STS</span> : null}
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">
                      {c.durationH !== null ? `${c.durationH}h` : "in port"}
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-text-muted">
                    {fmt(c.arrivedAt)} → {c.departedAt ? fmt(c.departedAt) : "—"}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── Sources ── */}
      {v.sourceUrls.length > 0 && (
        <section aria-label="Sources">
          <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            Sources / Джерела
          </h2>
          <div className="space-y-2">
            {v.sourceUrls.map((u) => (
              <a
                key={u}
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate rounded border border-border-subtle bg-bg-surface px-4 py-2 font-mono text-xs text-accent hover:bg-bg-elevated"
              >
                {u}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <section className="flex flex-wrap gap-3 border-t border-border-subtle pt-6">
        <Link
          href="/vessels"
          className="rounded border border-border-subtle px-4 py-2 font-mono text-sm text-text-muted hover:text-text-primary"
        >
          ← All vessels / Усі судна
        </Link>
      </section>

    </div>
  );
}
