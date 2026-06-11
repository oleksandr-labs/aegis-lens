import { notFound } from "next/navigation";
import { ACTIVE_LOCALES, isLocale, type Locale } from "@aegis/i18n-config";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { ViewTransitionsProvider } from "@/components/ViewTransitionsProvider";
import { PageLoader } from "@/components/PageLoader";

export function generateStaticParams() {
  // EN lives at root (no /en prefix), so static-param it for non-EN only.
  return ACTIVE_LOCALES.filter((lc) => lc !== "en").map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw) || !ACTIVE_LOCALES.includes(raw)) notFound();
  const locale = raw as Locale;

  return (
    <ViewTransitionsProvider>
      <PageLoader />
      <div lang={locale} className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black focus:outline-none"
        >
          Skip to content
        </a>
        <Header locale={locale} />
        <WelcomeBanner />
        <main id="main-content" role="main" className="flex-1">{children}</main>
        <Footer locale={locale} />
      </div>
    </ViewTransitionsProvider>
  );
}
