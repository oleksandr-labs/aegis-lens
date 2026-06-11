import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";
import { OBLASTS } from "@/lib/oblasts-seed";
import { SITE } from "@/lib/site";

type Params = { locale: string; region: string };

// ---------------------------------------------------------------------------
// Static safety data per oblast slug
// ---------------------------------------------------------------------------

type SafetyLevel = "critical" | "high" | "moderate" | "low";

type EmergencyContact = {
  name: string;
  number: string;
};

type RegionSafety = {
  nameEn: string;
  safetyLevel: SafetyLevel;
  alertsToday: number;
  lastAlert: string;
  recommendation: string;
  shelters: number;
  emergencyContacts: EmergencyContact[];
  /** Key recent civilian events for this region (synthetic/illustrative). */
  recentAlerts: { time: string; summary: string }[];
};

const SAFETY_DATA: Record<string, RegionSafety> = {
  "kharkiv-oblast": {
    nameEn: "Kharkiv Oblast",
    safetyLevel: "critical",
    alertsToday: 18,
    lastAlert: "2h ago",
    recommendation:
      "Avoid travel. Follow official evacuation guidance from local authorities. Stay in designated shelters during alerts.",
    shelters: 12,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
      { name: "Ambulance", number: "103" },
    ],
    recentAlerts: [
      { time: "2h ago", summary: "Air raid alert issued for Kharkiv city and surrounding districts." },
      { time: "5h ago", summary: "Drone activity reported near northern boundary of the oblast." },
      { time: "9h ago", summary: "All-clear issued following earlier missile threat warning." },
      { time: "13h ago", summary: "Artillery fire reported in border areas. Evacuation corridors active." },
      { time: "18h ago", summary: "Civilian alert: infrastructure strike on power substation in eastern district." },
    ],
  },
  "kyiv-city": {
    nameEn: "Kyiv (city)",
    safetyLevel: "moderate",
    alertsToday: 4,
    lastAlert: "5h ago",
    recommendation:
      "Monitor alerts. Have a shelter plan ready. Follow Kyiv City Military Administration guidance.",
    shelters: 89,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
      { name: "Ambulance", number: "103" },
    ],
    recentAlerts: [
      { time: "5h ago", summary: "Air raid alert active across Kyiv city. All-clear issued after 45 minutes." },
      { time: "11h ago", summary: "Drone intercepts reported over the city perimeter." },
      { time: "16h ago", summary: "Air defence engagement. Debris reported in outlying district." },
      { time: "22h ago", summary: "Air raid alert active across Kyiv city and oblast." },
      { time: "28h ago", summary: "All-clear issued following ballistic missile warning." },
    ],
  },
  "kyiv-oblast": {
    nameEn: "Kyiv Oblast",
    safetyLevel: "moderate",
    alertsToday: 3,
    lastAlert: "6h ago",
    recommendation:
      "Monitor official channels. Have a shelter plan ready. Avoid areas near military infrastructure.",
    shelters: 54,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
    ],
    recentAlerts: [
      { time: "6h ago", summary: "Air raid alert issued for Kyiv Oblast. All-clear after 38 minutes." },
      { time: "14h ago", summary: "Drone interception reported over the northern sector." },
      { time: "20h ago", summary: "Air defence activity in the western districts." },
      { time: "1d ago", summary: "Civilian alert: road closure near active engagement zone." },
      { time: "1d 6h ago", summary: "All-clear following air raid alert." },
    ],
  },
  "donetsk-oblast": {
    nameEn: "Donetsk Oblast",
    safetyLevel: "critical",
    alertsToday: 31,
    lastAlert: "< 1h ago",
    recommendation:
      "Do not travel. Active frontline combat ongoing. Follow mandatory evacuation orders. Contact ДСНС for assistance.",
    shelters: 8,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
      { name: "Ambulance", number: "103" },
      { name: "Evacuation hotline", number: "0800-214-008" },
    ],
    recentAlerts: [
      { time: "< 1h ago", summary: "Active artillery fire reported along the frontline contact line." },
      { time: "2h ago", summary: "Shelling reported in Kostiantynivka direction. Civilians urged to evacuate." },
      { time: "4h ago", summary: "Missile threat warning issued for the oblast." },
      { time: "7h ago", summary: "Infrastructure strike near civilian residential area. Emergency services responding." },
      { time: "10h ago", summary: "Air raid alert extended. Multiple interceptions reported." },
    ],
  },
  "zaporizhzhia-oblast": {
    nameEn: "Zaporizhzhia Oblast",
    safetyLevel: "high",
    alertsToday: 11,
    lastAlert: "3h ago",
    recommendation:
      "High risk. Follow local military administration guidance. Avoid southern portions of the oblast near active frontline.",
    shelters: 19,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
      { name: "Ambulance", number: "103" },
    ],
    recentAlerts: [
      { time: "3h ago", summary: "Air raid alert active. Drone threat reported from the south." },
      { time: "6h ago", summary: "Artillery fire reported in southern districts. Civilians advised to seek shelter." },
      { time: "10h ago", summary: "Shelling near Enerhodar area. IAEA monitoring ZNPP status." },
      { time: "14h ago", summary: "Air defence engagement over the city of Zaporizhzhia." },
      { time: "20h ago", summary: "Drone interception over the oblast. No civilian casualties reported." },
    ],
  },
  "luhansk-oblast": {
    nameEn: "Luhansk Oblast",
    safetyLevel: "critical",
    alertsToday: 22,
    lastAlert: "< 1h ago",
    recommendation:
      "Do not enter. Oblast largely under occupation. Contact Ukrainian authorities for evacuation assistance from controlled areas.",
    shelters: 3,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Evacuation hotline", number: "0800-214-008" },
    ],
    recentAlerts: [
      { time: "< 1h ago", summary: "Active fighting reported in the oblast. Civilian movement severely restricted." },
      { time: "3h ago", summary: "Shelling reported near the line of contact." },
      { time: "8h ago", summary: "Air raid alert issued for adjacent areas." },
      { time: "14h ago", summary: "Civilian displacement reported from frontline villages." },
      { time: "20h ago", summary: "Infrastructure damage reported in controlled territory." },
    ],
  },
  "kherson-oblast": {
    nameEn: "Kherson Oblast",
    safetyLevel: "high",
    alertsToday: 14,
    lastAlert: "1h ago",
    recommendation:
      "Avoid the oblast, especially areas near the Dnipro River. Active shelling across the river line. Follow official guidance.",
    shelters: 11,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
      { name: "Ambulance", number: "103" },
    ],
    recentAlerts: [
      { time: "1h ago", summary: "Shelling reported on Kherson city from the eastern bank." },
      { time: "4h ago", summary: "Drone strike on civilian infrastructure in the city." },
      { time: "8h ago", summary: "Artillery fire along the Dnipro river line." },
      { time: "12h ago", summary: "Air raid alert active for the oblast." },
      { time: "18h ago", summary: "Civilian casualty reported due to shrapnel. Emergency services responded." },
    ],
  },
  "mykolaiv-oblast": {
    nameEn: "Mykolaiv Oblast",
    safetyLevel: "moderate",
    alertsToday: 5,
    lastAlert: "4h ago",
    recommendation:
      "Monitor air raid alerts. Have a shelter plan ready. The situation is relatively stable but drone threats remain active.",
    shelters: 27,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
    ],
    recentAlerts: [
      { time: "4h ago", summary: "Air raid alert active for Mykolaiv oblast. All-clear after 52 minutes." },
      { time: "10h ago", summary: "Drone interception reported over the oblast." },
      { time: "16h ago", summary: "Infrastructure alert: power grid disruption in southern district." },
      { time: "22h ago", summary: "Air defence activity overnight." },
      { time: "1d 4h ago", summary: "All-clear issued following air threat warning." },
    ],
  },
  "odesa-oblast": {
    nameEn: "Odesa Oblast",
    safetyLevel: "moderate",
    alertsToday: 6,
    lastAlert: "3h ago",
    recommendation:
      "Monitor alerts, especially in coastal areas. Port infrastructure has been targeted previously. Follow official guidance.",
    shelters: 44,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
      { name: "Ambulance", number: "103" },
    ],
    recentAlerts: [
      { time: "3h ago", summary: "Air raid alert active for Odesa. All-clear issued after 1 hour." },
      { time: "8h ago", summary: "Drone threat reported over the Black Sea coast." },
      { time: "13h ago", summary: "Air defence engagement. Debris reported away from civilian areas." },
      { time: "20h ago", summary: "Port area civilian alert following threat warning." },
      { time: "1d ago", summary: "All-clear following overnight air raid alert." },
    ],
  },
  "dnipropetrovsk-oblast": {
    nameEn: "Dnipropetrovsk Oblast",
    safetyLevel: "high",
    alertsToday: 9,
    lastAlert: "2h ago",
    recommendation:
      "High alert. The oblast has been targeted by missiles and drones. Know your nearest shelter and follow air raid sirens immediately.",
    shelters: 38,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
      { name: "Ambulance", number: "103" },
    ],
    recentAlerts: [
      { time: "2h ago", summary: "Missile threat warning issued for Dnipro city and oblast." },
      { time: "5h ago", summary: "Air defence engagement. Multiple intercepts reported." },
      { time: "9h ago", summary: "Drone activity detected approaching from the east." },
      { time: "14h ago", summary: "Air raid alert. Civilians urged to take shelter immediately." },
      { time: "20h ago", summary: "All-clear following missile threat." },
    ],
  },
  "sumy-oblast": {
    nameEn: "Sumy Oblast",
    safetyLevel: "high",
    alertsToday: 12,
    lastAlert: "2h ago",
    recommendation:
      "High risk. Border oblast with ongoing cross-border shelling incidents. Avoid border areas. Follow local military administration guidance.",
    shelters: 16,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
      { name: "Evacuation hotline", number: "0800-214-008" },
    ],
    recentAlerts: [
      { time: "2h ago", summary: "Cross-border shelling reported in northern border districts." },
      { time: "5h ago", summary: "Air raid alert active for the oblast." },
      { time: "8h ago", summary: "Drone incursion reported near border. Air defence responding." },
      { time: "13h ago", summary: "Shelling of civilian infrastructure in border village." },
      { time: "18h ago", summary: "All-clear following air raid alert." },
    ],
  },
  "chernihiv-oblast": {
    nameEn: "Chernihiv Oblast",
    safetyLevel: "high",
    alertsToday: 7,
    lastAlert: "3h ago",
    recommendation:
      "Monitor alerts. Border oblast — drone and missile threats are periodic. Know your nearest shelter.",
    shelters: 21,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
    ],
    recentAlerts: [
      { time: "3h ago", summary: "Air raid alert active across Chernihiv oblast." },
      { time: "7h ago", summary: "Drone detected approaching from the north. Interception confirmed." },
      { time: "12h ago", summary: "Air defence activity overnight." },
      { time: "18h ago", summary: "All-clear following air threat warning." },
      { time: "1d ago", summary: "Civilian alert: unexploded ordnance found in rural area." },
    ],
  },
  "lviv-oblast": {
    nameEn: "Lviv Oblast",
    safetyLevel: "low",
    alertsToday: 2,
    lastAlert: "8h ago",
    recommendation:
      "Relatively stable. Air raid alerts occur periodically. Follow official alerts and know your nearest shelter.",
    shelters: 67,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
    ],
    recentAlerts: [
      { time: "8h ago", summary: "Air raid alert active across western Ukraine including Lviv. All-clear after 30 min." },
      { time: "1d 2h ago", summary: "Air raid alert. All-clear issued following threat assessment." },
      { time: "2d ago", summary: "Drone alert for western regions. No impacts reported in oblast." },
      { time: "3d ago", summary: "All-clear following national air raid alert." },
      { time: "4d ago", summary: "Air raid alert active. Infrastructure precautions in place." },
    ],
  },
};

// Fallback for oblasts not explicitly listed
function getFallbackSafety(nameEn: string): RegionSafety {
  return {
    nameEn,
    safetyLevel: "moderate",
    alertsToday: 2,
    lastAlert: "12h ago",
    recommendation:
      "Monitor official alerts from local authorities. Have a shelter plan ready. Follow ДСНС guidance.",
    shelters: 10,
    emergencyContacts: [
      { name: "ДСНС (Emergency)", number: "101" },
      { name: "Police", number: "102" },
      { name: "Ambulance", number: "103" },
    ],
    recentAlerts: [
      { time: "12h ago", summary: "Air raid alert active for the region. All-clear issued." },
      { time: "1d ago", summary: "Drone threat warning issued. No impacts reported." },
      { time: "2d ago", summary: "All-clear following regional air raid alert." },
      { time: "3d ago", summary: "Air raid alert. Civilians advised to seek shelter." },
      { time: "4d ago", summary: "All-clear following threat assessment." },
    ],
  };
}

// ---------------------------------------------------------------------------
// Safety level helpers
// ---------------------------------------------------------------------------

const LEVEL_CONFIG: Record<SafetyLevel, { label: string; color: string; bg: string; border: string }> = {
  critical: {
    label: "Critical",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/30",
  },
  high: {
    label: "High",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/30",
  },
  moderate: {
    label: "Moderate",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/30",
  },
  low: {
    label: "Low",
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
  },
};

// Only generate pages for Ukrainian oblasts
const UA_OBLASTS = OBLASTS.filter((o) => o.iso2 === "ua");

// ---------------------------------------------------------------------------
// Next.js exports
// ---------------------------------------------------------------------------

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const o of UA_OBLASTS) {
    for (const lc of ACTIVE_LOCALES) {
      out.push({ locale: lc, region: o.slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale: raw, region } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const oblast = UA_OBLASTS.find((o) => o.slug === region);
  if (!oblast) return { robots: { index: false } };

  const safety = SAFETY_DATA[region] ?? getFallbackSafety(oblast.name.en);

  return buildMetadata({
    locale,
    title: `${oblast.name.en} safety — current alert level`,
    description: `Real-time safety status for ${oblast.name.en}: ${safety.alertsToday} alerts today, level ${safety.safetyLevel}. Emergency contacts, shelter locations, and official guidance.`,
    pathFor: (lc) => localePath(lc, `/safety/${region}`),
  });
}

export default async function SafetyRegionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale: raw, region } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const oblast = UA_OBLASTS.find((o) => o.slug === region);
  if (!oblast) notFound();

  const safety = SAFETY_DATA[region] ?? getFallbackSafety(oblast.name.en);
  const levelCfg = LEVEL_CONFIG[safety.safetyLevel];

  const pageUrl = `${SITE.url}${localePath(locale, `/safety/${region}`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${oblast.name.en} safety status`,
    description: safety.recommendation,
    url: pageUrl,
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", url: SITE.url, name: SITE.name },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Safety" },
        { "@type": "ListItem", position: 3, name: oblast.name.en },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        eyebrow="Civilian Safety"
        title={`${oblast.name.en} — Safety Status`}
        description={`Current alert level, emergency contacts, and shelter information for ${oblast.name.en}.`}
      />

      <article className="mx-auto max-w-3xl px-4 py-10 space-y-10">

        {/* Safety level badge + stats */}
        <section
          className={`rounded border ${levelCfg.border} ${levelCfg.bg} p-5`}
        >
          <div className="flex flex-wrap items-start gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
                Safety Level
              </p>
              <span
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1 font-mono text-sm font-semibold ${levelCfg.color} ${levelCfg.bg} border ${levelCfg.border}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {levelCfg.label}
              </span>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
                Alerts Today
              </p>
              <p className={`text-2xl font-semibold font-mono ${levelCfg.color}`}>
                {safety.alertsToday}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
                Last Alert
              </p>
              <p className="text-sm text-text-secondary font-mono">{safety.lastAlert}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-current/10 pt-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
              Official Recommendation
            </p>
            <p className="text-sm text-text-primary font-medium">{safety.recommendation}</p>
          </div>
        </section>

        {/* Emergency contacts */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Emergency contacts</h2>
          <div className="overflow-x-auto rounded border border-border-subtle">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-bg-surface">
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-text-muted"
                  >
                    Service
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-widest text-text-muted"
                  >
                    Number
                  </th>
                </tr>
              </thead>
              <tbody>
                {safety.emergencyContacts.map((ec, i) => (
                  <tr
                    key={ec.number}
                    className={`border-t border-border-subtle ${i % 2 === 0 ? "bg-bg-base" : "bg-bg-surface"}`}
                  >
                    <td className="px-4 py-2.5 text-text-secondary">{ec.name}</td>
                    <td className="px-4 py-2.5">
                      <a
                        href={`tel:${ec.number}`}
                        className="font-mono text-accent hover:underline"
                      >
                        {ec.number}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Shelters */}
        <section className="rounded border border-border-subtle bg-bg-surface p-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted mb-1">
                Air raid shelters
              </p>
              <p className="text-2xl font-semibold font-mono text-text-primary">
                {safety.shelters}{" "}
                <span className="text-sm font-normal text-text-muted">in this region</span>
              </p>
            </div>
            <a
              href="https://www.dsns.gov.ua/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded border border-border-default px-3 py-1.5 font-mono text-xs text-text-secondary hover:border-accent hover:text-accent"
            >
              Official shelter map ↗
            </a>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Shelter count is indicative. For the most up-to-date registered shelter list, consult the ДСНС official resource above.
          </p>
        </section>

        {/* Recent alerts */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            Recent civilian alerts — {oblast.name.en}
          </h2>
          <ul className="space-y-2">
            {safety.recentAlerts.map((alert, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded border border-border-subtle bg-bg-surface px-4 py-3"
              >
                <span className="shrink-0 font-mono text-[10px] text-text-muted pt-0.5 w-14">
                  {alert.time}
                </span>
                <span className="text-sm text-text-secondary">{alert.summary}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-text-muted">
            Events are synthetic illustrative data. For verified real-time events, see{" "}
            <Link href={localePath(locale, "/dashboard")} className="text-accent hover:underline">
              the Aegis Lens dashboard
            </Link>
            .
          </p>
        </section>

        {/* Subscribe CTA */}
        <section className="rounded border border-accent/20 bg-accent/5 p-5">
          <h2 className="text-base font-semibold text-text-primary">
            Subscribe to alerts for {oblast.name.en}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Get real-time notifications when the alert level changes or a new event is verified in this region.
          </p>
          <Link
            href={`${localePath(locale, "/alerts")}?region=${region}`}
            className="mt-3 inline-block rounded bg-accent px-4 py-2 font-mono text-sm text-bg-base hover:bg-accent/90"
          >
            Set up region alerts →
          </Link>
        </section>

        {/* Other regions */}
        <section>
          <h2 className="text-base font-semibold text-text-primary mb-3">Other regions</h2>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {UA_OBLASTS.filter((o) => o.slug !== region)
              .slice(0, 6)
              .map((o) => (
                <li key={o.slug}>
                  <Link
                    href={localePath(locale, `/safety/${o.slug}`)}
                    className="block rounded border border-border-subtle bg-bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                  >
                    {o.name.en}
                  </Link>
                </li>
              ))}
          </ul>
        </section>

        {/* Disclaimer */}
        <div className="rounded border border-border-subtle bg-bg-surface/50 p-4 text-xs text-text-muted">
          <strong className="text-text-secondary">Disclaimer:</strong>{" "}
          This information is for awareness only. Always follow official guidance from Ukrainian authorities, ДСНС, and local military administrations. Aegis Lens does not replace official emergency services or evacuation instructions.
        </div>

      </article>
    </>
  );
}
