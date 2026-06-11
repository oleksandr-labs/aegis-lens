import type { Metadata } from "next";
import { urls } from "@aegis/url-builder";
import { isLocale, type Locale } from "@aegis/i18n-config";
import { getT } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { AegisMap } from "@/components/Map/AegisMap";
import { LayerToggles } from "@/components/Map/LayerToggles";
import { LayerPresets } from "@/components/Map/LayerPresets";
import { MapTimelineBar } from "@/components/Map/MapTimelineBar";
import { Copilot } from "@/components/Map/Copilot";
import { MapTopBar } from "@/components/Map/MapTopBar";
import { AoiDrawPanel } from "@/components/Map/AoiDrawPanel";
import { MobileMapLayout } from "@/components/Mobile/MobileMapLayout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = await getT(locale, "map");
  return buildMetadata({
    locale,
    title: t("title"),
    description: t("placeholder.body"),
    pathFor: (lc) => urls.map(lc),
  });
}

export default async function MapPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : "en") as Locale;
  const t = await getT(locale, "map");

  return (
    <>
      {/* ── Mobile layout (< md) ── */}
      <MobileMapLayout />

      {/* ── Desktop layout (≥ md) ── */}
      <div className="hidden md:flex h-[calc(100vh-3.5rem)] flex-col">
        <MapTopBar />

        <div className="grid flex-1 grid-cols-[260px_1fr_320px] overflow-hidden">
          {/* Left rail — layers */}
          <aside className="overflow-y-auto border-r border-border-subtle bg-bg-elevated p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              {t("layers.title")}
            </h2>

            {/* Layer presets */}
            <LayerPresets />

            {/* Layer toggles (with opacity sliders) */}
            <div className="mt-3 border-t border-border-subtle pt-3">
              <LayerToggles />
            </div>

            <p className="mt-6 text-xs text-text-muted">
              Click any class to filter the map. Empty selection shows all.
            </p>

            {/* AOI draw panel */}
            <AoiDrawPanel />
          </aside>

          {/* Map canvas */}
          <section className="relative">
            <AegisMap />
          </section>

          {/* Right rail — copilot */}
          <aside className="flex flex-col border-l border-border-subtle bg-bg-elevated p-4">
            <Copilot />
          </aside>
        </div>

        {/* Timeline bar — bottom of the full-width layout */}
        <MapTimelineBar />
      </div>
    </>
  );
}
