import type { Metadata } from "next";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { buildMetadata } from "@/lib/seo";
import { PageHeader, Prose } from "@/components/PageHeader";

const lp = (lc: Locale) => (lc === "en" ? "/legal/dmca" : `/${lc}/legal/dmca`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  return buildMetadata({
    locale,
    title: "DMCA & Takedown Policy",
    description: "How to submit a copyright or takedown notice for content hosted on Aegis Lens.",
    pathFor: lp,
    noindex: true,
  });
}

export default function DmcaPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="DMCA & Takedown Policy"
        description="DRAFT — counsel review pending. Last updated: 2026-05-24."
      />
      <Prose>
        <h2>1. Overview</h2>
        <p>
          Aegis Lens aggregates publicly available information. If you believe that content
          accessible through our service infringes your copyright or otherwise should be removed,
          you may submit a notice using the procedure below.
        </p>

        <h2>2. What to include</h2>
        <ul>
          <li>Your full name, postal address, telephone number, and email address.</li>
          <li>A description of the copyrighted work or material you claim has been infringed.</li>
          <li>The exact URL(s) on Aegis Lens where the material appears.</li>
          <li>
            A statement that you have a good-faith belief that the use is not authorized by the
            copyright owner, its agent, or the law.
          </li>
          <li>
            A statement, under penalty of perjury, that the information in the notice is accurate
            and that you are the owner or authorized to act on behalf of the owner.
          </li>
          <li>Your physical or electronic signature.</li>
        </ul>

        <h2>3. Where to send</h2>
        <p>
          Email <a href="mailto:legal@aegislens.example">legal@aegislens.example</a> with the
          subject line <code>[DMCA]</code>. Postal mail is also accepted at the address published
          in our Terms of Service.
        </p>

        <h2>4. Counter-notice</h2>
        <p>
          If your content was removed and you believe the removal was a mistake or misidentification,
          you may file a counter-notice including your contact information, identification of the
          removed material, and a statement under penalty of perjury that you have a good-faith
          belief the material was removed in error.
        </p>

        <h2>5. Repeat infringers</h2>
        <p>
          We terminate, in appropriate circumstances, accounts of users who are repeat infringers.
        </p>

        <h2>6. Misrepresentation</h2>
        <p>
          Knowingly submitting a false notice or counter-notice may result in liability for damages
          under applicable law.
        </p>
      </Prose>
    </>
  );
}
