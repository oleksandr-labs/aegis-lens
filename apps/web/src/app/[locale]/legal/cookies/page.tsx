import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, Prose } from "@/components/PageHeader";

const lp = (lc: Locale) => (lc === "en" ? "/legal/cookies" : `/${lc}/legal/cookies`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "Cookie Policy",
    description: "What cookies Aegis Lens uses, why, and how you can control them.",
    pathFor: lp,
    noindex: true,
  });
}

export default function CookiesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Cookie Policy"
        description="DRAFT — counsel review pending. Last updated: 2026-05-24."
      />
      <Prose>
        <h2>1. What cookies are</h2>
        <p>
          Cookies are small text files stored in your browser when you visit a website. They allow
          the site to remember your preferences and to measure how its pages are used.
        </p>

        <h2>2. Cookies we use</h2>
        <h3>Essential session cookies</h3>
        <p>
          We set a single first-party session cookie to keep you signed in, remember your selected
          locale, and protect form submissions against cross-site request forgery. These cookies
          are strictly necessary and cannot be disabled while using the authenticated parts of the
          service.
        </p>

        <h3>Analytics cookies</h3>
        <p>
          When enabled, a privacy-respecting analytics cookie (Plausible) records aggregate,
          anonymized usage — which pages are visited, how long sessions last, and which referrers
          send traffic. We do not use these cookies to build advertising profiles, and they do not
          contain identifying information.
        </p>

        <h2>3. Third-party cookies</h2>
        <p>
          We do not embed third-party advertising or social-media trackers. Map tiles are served
          from OpenStreetMap; tile requests are subject to that project&apos;s own policy.
        </p>

        <h2>4. Your choices</h2>
        <ul>
          <li>
            You can clear or block cookies in your browser settings. Blocking essential cookies will
            sign you out and may break form submissions.
          </li>
          <li>
            You can opt out of analytics via the consent banner or the toggle in your account
            settings. We honor the browser <code>Do Not Track</code> signal.
          </li>
        </ul>

        <h2>5. Changes</h2>
        <p>
          If we add a new cookie category we will update this page and, where required, ask for
          your consent before setting the cookie.
        </p>

        <h2>6. Contact</h2>
        <p>
          Questions? Email <a href="mailto:privacy@aegislens.example">privacy@aegislens.example</a>.
        </p>
      </Prose>
    </>
  );
}
