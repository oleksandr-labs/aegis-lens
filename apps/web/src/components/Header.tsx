import Link from "next/link";
import { urls } from "@aegis/url-builder";
import { ACTIVE_LOCALES, LOCALE_LABELS, type Locale } from "@aegis/i18n-config";
import { getT } from "@/lib/i18n";
import { HeaderSearch } from "@/components/HeaderSearch";
import { NavLink } from "@/components/NavLink";
import { WhatsNewTrigger } from "@/components/WhatsNewTrigger";

export async function Header({ locale }: { locale: Locale }) {
  const t = await getT(locale, "common");

  return (
    <header role="banner" className="sticky top-0 z-40 border-b border-border-subtle bg-bg-base/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href={urls.home(locale)}
          className="font-mono text-sm font-semibold tracking-tight text-text-primary hover:text-accent"
        >
          AEGIS LENS
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-5 md:flex">
          <NavLink href={urls.map(locale)} className="text-sm text-text-secondary hover:text-text-primary">
            {t("nav.map")}
          </NavLink>
          <NavLink href={urls.dashboard(locale)} className="text-sm text-text-secondary hover:text-text-primary">
            Dashboard
          </NavLink>
          <NavLink href={urls.presets(locale)} className="text-sm text-text-secondary hover:text-text-primary">
            Presets
          </NavLink>
          <NavLink href={urls.companies(locale)} className="text-sm text-text-secondary hover:text-text-primary">
            {t("nav.companies")}
          </NavLink>
          <NavLink href={urls.tools(locale)} className="text-sm text-text-secondary hover:text-text-primary">
            {t("nav.tools")}
          </NavLink>
          <NavLink href={urls.pricing(locale)} className="text-sm text-text-secondary hover:text-text-primary">
            {t("nav.pricing")}
          </NavLink>
          <NavLink href={urls.docs(locale)} className="text-sm text-text-secondary hover:text-text-primary">
            {t("nav.docs")}
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <HeaderSearch
            searchHref={urls.search(locale)}
            triggerLabel="Search"
          />
          <WhatsNewTrigger />
          <LocaleSwitcher current={locale} />
          <Link
            href={urls.settings(locale)}
            className="rounded border border-border-subtle px-2.5 py-1.5 text-sm text-text-secondary hover:bg-bg-surface"
            title="Settings"
            aria-label="Settings"
          >
            <span aria-hidden="true">⚙</span>
          </Link>
          <Link
            href={urls.login(locale)}
            className="rounded border border-border-default px-3 py-1.5 text-sm text-text-primary hover:bg-bg-surface"
          >
            {t("nav.signin")}
          </Link>
        </div>
      </div>
    </header>
  );
}

function LocaleSwitcher({ current }: { current: Locale }) {
  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      {ACTIVE_LOCALES.map((lc) => (
        <Link
          key={lc}
          href={lc === "en" ? "/" : `/${lc}`}
          className={
            lc === current
              ? "rounded bg-bg-surface px-2 py-1 text-text-primary"
              : "rounded px-2 py-1 text-text-muted hover:text-text-primary"
          }
          aria-current={lc === current ? "page" : undefined}
          title={LOCALE_LABELS[lc]}
        >
          {lc.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
