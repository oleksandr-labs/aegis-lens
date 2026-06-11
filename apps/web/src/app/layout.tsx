import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { SITE } from "@/lib/site";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import CookieConsent from "@/components/CookieConsent";
import { CommandPaletteProvider } from "@/components/CommandPalette";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { OnboardingTour } from "@/components/OnboardingTour";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { StoreProvider } from "@/components/StoreProvider";
import { PresetApplier } from "@/components/PresetApplier";
import { DevFlagsPanel } from "@/components/DevFlagsPanel";
import { ThemeApplier } from "@/components/ThemeApplier";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s — ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  formatDetection: { telephone: false, email: false, address: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external tile/data services used on the map */}
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://unpkg.com" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        {/* ARIA live regions — populated by lib/a11y-announcer.ts / lib/announce.ts */}
        <div id="aria-announcer" aria-live="polite" aria-atomic="true" className="sr-only" />
        <ThemeApplier />
        <StoreProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </StoreProvider>
        <CookieConsent />
        <CommandPaletteProvider />
        <ToastProvider />
        <OnboardingTour />
        <OnboardingChecklist />
        <KeyboardShortcuts />
        <PresetApplier />
        <DevFlagsPanel />
      </body>
    </html>
  );
}
