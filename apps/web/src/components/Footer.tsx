import Link from "next/link";
import { urls, localePath } from "@aegis/url-builder";
import { type Locale } from "@aegis/i18n-config";
import { getT } from "@/lib/i18n";

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getT(locale, "common");
  const year = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="mt-12 border-t border-border-subtle bg-bg-elevated">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="font-mono text-sm font-semibold text-text-primary">AEGIS LENS</div>
          <p className="mt-2 text-sm text-text-secondary">{t("footer.tagline")}</p>
        </div>

        <FooterColumn title={t("footer.product")} id="footer-product">
          <FooterLink href={urls.map(locale)}>{t("nav.map")}</FooterLink>
          <FooterLink href={urls.pricing(locale)}>{t("nav.pricing")}</FooterLink>
          <FooterLink href={urls.docs(locale)}>{t("nav.docs")}</FooterLink>
        </FooterColumn>

        <FooterColumn title={t("footer.resources")} id="footer-resources">
          <FooterLink href={localePath(locale, "/travel")}>Travel Safety</FooterLink>
          <FooterLink href={urls.news(locale)}>News archive</FooterLink>
          <FooterLink href={urls.topics(locale)}>Topics</FooterLink>
          <FooterLink href={urls.entities(locale)}>Entities</FooterLink>
          <FooterLink href={urls.glossary(locale)}>Glossary</FooterLink>
          <FooterLink href={urls.reports(locale)}>Reports</FooterLink>
          <FooterLink href={urls.sources(locale)}>Sources</FooterLink>
          <FooterLink href={urls.incidents(locale)}>Incidents</FooterLink>
          <FooterLink href={urls.timeline(locale)}>Timeline</FooterLink>
          <FooterLink href={urls.stats(locale)}>Stats</FooterLink>
          <FooterLink href={urls.alerts(locale)}>Alerts</FooterLink>
          <FooterLink href={urls.compare(locale)}>Compare</FooterLink>
          <FooterLink href={urls.faq(locale)}>FAQ</FooterLink>
          <FooterLink href={urls.help(locale)}>Help</FooterLink>
          <FooterLink href={urls.investigations(locale)}>Investigations</FooterLink>
          <FooterLink href={urls.trends(locale)}>Trends</FooterLink>
          <FooterLink href={urls.datasets(locale)}>Datasets</FooterLink>
          <FooterLink href={urls.useCases(locale)}>Use cases</FooterLink>
          <FooterLink href={urls.contact(locale)}>Contact</FooterLink>
          <FooterLink href={urls.guides(locale)}>Guides</FooterLink>
          <FooterLink href={urls.industries(locale)}>Industries</FooterLink>
          <FooterLink href={urls.tags(locale)}>Tags</FooterLink>
          <FooterLink href={urls.threats(locale)}>Threats</FooterLink>
          <FooterLink href={urls.academy(locale)}>Academy</FooterLink>
          <FooterLink href={urls.cookbook(locale)}>Cookbook</FooterLink>
          <FooterLink href={urls.integrations(locale)}>Integrations</FooterLink>
          <FooterLink href={urls.countries(locale)}>Countries</FooterLink>
          <FooterLink href={urls.sanctions(locale)}>Sanctions</FooterLink>
          <FooterLink href={urls.newsArchive(locale)}>News archive</FooterLink>
          <FooterLink href={urls.caseStudies(locale)}>Case studies</FooterLink>
          <FooterLink href={urls.podcast(locale)}>Podcast</FooterLink>
          <FooterLink href={urls.videos(locale)}>Videos</FooterLink>
          <FooterLink href={urls.blog(locale)}>{t("nav.briefs")}</FooterLink>
        </FooterColumn>

        <FooterColumn title={t("footer.legal")} id="footer-legal">
          <FooterLink href={`/${locale === "en" ? "" : locale + "/"}legal/terms`}>Terms</FooterLink>
          <FooterLink href={`/${locale === "en" ? "" : locale + "/"}legal/privacy`}>Privacy</FooterLink>
          <FooterLink href={urls.legalDmca(locale)}>DMCA</FooterLink>
          <FooterLink href={urls.legalCookies(locale)}>Cookies</FooterLink>
          <FooterLink href={urls.security(locale)}>Security</FooterLink>
          <FooterLink href={urls.methodology(locale)}>Methodology</FooterLink>
          <FooterLink href={urls.docsApi(locale)}>API</FooterLink>
          <FooterLink href={urls.docsSdks(locale)}>SDKs</FooterLink>
          <FooterLink href={urls.trust(locale)}>Trust</FooterLink>
          <FooterLink href={urls.changelog(locale)}>Changelog</FooterLink>
          <FooterLink href={urls.press(locale)}>Press</FooterLink>
          <FooterLink href={urls.status(locale)}>Status</FooterLink>
          <FooterLink href={urls.careers(locale)}>Careers</FooterLink>
          <FooterLink href={urls.partners(locale)}>Partners</FooterLink>
          <FooterLink href={`/${locale === "en" ? "" : locale + "/"}trust`}>{t("footer.trust")}</FooterLink>
        </FooterColumn>
      </div>
      <div className="border-t border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-text-muted">
          {t("footer.copyright", { year })}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <div aria-labelledby={headingId}>
      <h3 id={headingId} className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-text-secondary hover:text-text-primary">
        {children}
      </Link>
    </li>
  );
}
