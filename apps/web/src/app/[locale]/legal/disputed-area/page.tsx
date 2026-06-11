import type { Metadata } from "next";
import Link from "next/link";
import { localePath } from "@aegis/url-builder";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, Prose } from "@/components/PageHeader";

export function generateStaticParams() {
  return ACTIVE_LOCALES.map((locale) => ({ locale }));
}

const TITLE = "Disputed-Area Display Policy";
const DESCRIPTION =
  "How Aegis Lens represents disputed, occupied, and contested territories on its maps, data, and publications — and the principles that govern these choices.";
const LAST_UPDATED = "2026-05-24";

const lp = (lc: Locale) =>
  lc === "en" ? "/legal/disputed-area" : `/${lc}/legal/disputed-area`;

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
    pathFor: lp,
  });
}

export default async function DisputedAreaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: locale,
    url: `https://aegislens.io${lp(locale)}`,
    dateModified: LAST_UPDATED,
    publisher: { "@type": "Organization", name: "Aegis Lens" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader eyebrow="Legal" title={TITLE} description={DESCRIPTION} />

      <Prose>
        <p className="font-mono text-xs text-text-muted">
          Last updated: {LAST_UPDATED} · Effective immediately upon publication
        </p>

        <h2>1. Purpose</h2>
        <p>
          Aegis Lens operates a conflict-intelligence platform that displays geospatial data about
          events occurring in or near territories subject to ongoing or historical dispute. This
          policy explains how we make display decisions in those contexts, so that users, partners,
          governments, and press can understand what our maps and data represent.
        </p>
        <p>
          Our goal is to be accurate, consistent, politically neutral, and transparent. We do not
          endorse any territorial claim. We follow the current international legal consensus and
          clearly label any deviation from that consensus required for operational accuracy.
        </p>

        <h2>2. Default: internationally recognised borders</h2>
        <p>
          Unless otherwise noted, Aegis Lens maps and data represent territories according to the
          borders recognised by the United Nations General Assembly and the majority of member
          states. This is the same approach used by major international media organizations and
          mapping platforms.
        </p>
        <p>
          Specifically, for the Russia–Ukraine war, our basemaps and administrative-boundary layers
          follow UN General Assembly resolution{" "}
          <strong>ES-11/1 (2 March 2022)</strong>, which affirmed Ukraine's sovereignty and
          territorial integrity within its internationally recognised borders, including Crimea,
          Donetsk, Luhansk, Zaporizhzhia, and Kherson oblasts.
        </p>

        <h2>3. Operational occupation lines</h2>
        <p>
          We separately display <strong>operational lines of control</strong> — the de facto
          positions of armed forces at a given point in time. These are drawn from:
        </p>
        <ul>
          <li>
            <strong>DeepStateMAP</strong> — open-source daily updates maintained by Ukrainian
            geospatial analysts
          </li>
          <li>
            <strong>Institute for the Study of War (ISW)</strong> — daily theatre assessments
          </li>
          <li>
            Internal Aegis Lens event-based inference from verified strike and movement data
          </li>
        </ul>
        <p>
          These operational lines are displayed as dynamic overlays, clearly distinguished from
          official border layers. They represent the best available open-source estimate of
          military positions and are updated as new information is corroborated. They are{" "}
          <strong>not</strong> a political statement about sovereignty.
        </p>

        <h2>4. Labelling of contested regions</h2>
        <p>
          Where a territory's status is disputed under international law, Aegis Lens applies the
          following labels in its data:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Administrative label</th>
                <th>Note displayed to users</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Crimea</td>
                <td>Ukraine (Autonomous Republic of Crimea)</td>
                <td>Under Russian military occupation since 2014; UN resolution ES-11/1 applies</td>
              </tr>
              <tr>
                <td>Donetsk (partial)</td>
                <td>Ukraine (Donetsk Oblast)</td>
                <td>Partially occupied; operational line displayed separately</td>
              </tr>
              <tr>
                <td>Luhansk (partial)</td>
                <td>Ukraine (Luhansk Oblast)</td>
                <td>Partially occupied; operational line displayed separately</td>
              </tr>
              <tr>
                <td>Zaporizhzhia (partial)</td>
                <td>Ukraine (Zaporizhzhia Oblast)</td>
                <td>Partially occupied; operational line displayed separately</td>
              </tr>
              <tr>
                <td>Kherson (partial)</td>
                <td>Ukraine (Kherson Oblast)</td>
                <td>Partially occupied; operational line displayed separately</td>
              </tr>
              <tr>
                <td>Kosovo</td>
                <td>Kosovo (partially recognised state)</td>
                <td>Status disputed; not recognised by all UN members; follows EU/US position</td>
              </tr>
              <tr>
                <td>Taiwan</td>
                <td>Taiwan (ROC)</td>
                <td>Status disputed; we display factual administrative geography</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          This table is illustrative and not exhaustive. For any region, users may request the
          source and rationale for our labelling by contacting{" "}
          <a href="mailto:data@aegislens.io">data@aegislens.io</a>.
        </p>

        <h2>5. Accuracy vs. operational reality</h2>
        <p>
          Aegis Lens is designed for analysts, journalists, humanitarian workers, and researchers
          who need accurate <em>operational</em> data — not only legal geography. We therefore
          distinguish clearly between:
        </p>
        <ul>
          <li>
            <strong>Administrative region</strong>: the legally recognised or internationally
            assigned administrative unit
          </li>
          <li>
            <strong>Operational control zone</strong>: the area under effective military or
            administrative control at a given date, per available open-source evidence
          </li>
        </ul>
        <p>
          Events in our database are tagged to both layers where applicable. API consumers
          receive both <code>admin_region</code> (legally recognised) and{" "}
          <code>control_zone</code> (operational, nullable) fields.
        </p>

        <h2>6. No political endorsement</h2>
        <p>
          Nothing in the Aegis Lens platform — including map layers, labels, event tags, or
          regional analytics — constitutes a political endorsement of any territorial claim,
          government, or armed party. All data is produced for informational purposes only.
        </p>
        <p>
          Users who require maps or data that reflect a specific political position should
          generate custom views using our API and apply their own labelling. Aegis Lens
          does not provide politically customised basemaps.
        </p>

        <h2>7. Errors and corrections</h2>
        <p>
          If you believe a boundary, label, or classification is factually incorrect, please{" "}
          <a href="mailto:data@aegislens.io">contact our data team</a>. We review correction
          requests within 5 business days and publish updates in our{" "}
          <Link href={localePath(locale, "/changelog")}>changelog</Link>.
        </p>

        <h2>8. References</h2>
        <ul>
          <li>
            UN General Assembly Resolution ES-11/1 (2 March 2022) —{" "}
            <em>Aggression against Ukraine</em>
          </li>
          <li>
            UN GA Resolution 68/262 (27 March 2014) —{" "}
            <em>Territorial integrity of Ukraine (Crimea)</em>
          </li>
          <li>
            ICRC guidelines on IHL applicability in occupied territories
          </li>
          <li>
            DeepStateMAP methodology documentation
          </li>
          <li>
            ISW — Institute for the Study of War conflict-mapping methodology
          </li>
        </ul>

        <hr />
        <p>
          Related policies:{" "}
          <Link href={localePath(locale, "/legal/methodology")}>
            OSINT methodology &amp; data-use policy
          </Link>{" "}
          ·{" "}
          <Link href={localePath(locale, "/legal/aup")}>Acceptable Use Policy</Link> ·{" "}
          <Link href={localePath(locale, "/legal/privacy")}>Privacy Policy</Link>
        </p>
      </Prose>
    </>
  );
}
