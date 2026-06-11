/**
 * Scroll-driven storytelling configuration for Aegis Lens marketing pages.
 *
 * Each ScrollSection maps to a full-viewport narrative block.
 * buildScrollTimeline() produces a JSON config string consumable by GSAP
 * ScrollTrigger or an equivalent driver.
 */

export interface ScrollSection {
  id: string;
  title_en: string;
  title_uk: string;
  animationType:
    | "fade-up"
    | "slide-left"
    | "slide-right"
    | "scale-in"
    | "radar-scan";
  delayMs: number;
  durationMs: number;
  /** What to do when prefers-reduced-motion is active. */
  reducedMotionFallback: "static" | "instant";
}

export const AEGIS_SCROLL_SECTIONS: ScrollSection[] = [
  {
    id: "intro",
    title_en: "The intelligence gap",
    title_uk: "Розрив у розвідці",
    animationType: "fade-up",
    delayMs: 0,
    durationMs: 800,
    reducedMotionFallback: "static",
  },
  {
    id: "live-map-demo",
    title_en: "Live map — right now",
    title_uk: "Жива карта — просто зараз",
    animationType: "radar-scan",
    delayMs: 100,
    durationMs: 1200,
    reducedMotionFallback: "instant",
  },
  {
    id: "ai-analysis",
    title_en: "AI that reads the conflict",
    title_uk: "AI, що читає конфлікт",
    animationType: "slide-left",
    delayMs: 0,
    durationMs: 900,
    reducedMotionFallback: "static",
  },
  {
    id: "data-sources",
    title_en: "Open data, rigorously verified",
    title_uk: "Відкриті дані, суворо верифіковані",
    animationType: "slide-right",
    delayMs: 0,
    durationMs: 900,
    reducedMotionFallback: "static",
  },
  {
    id: "use-cases",
    title_en: "Built for every team on the front line",
    title_uk: "Для кожної команди на передовій",
    animationType: "scale-in",
    delayMs: 50,
    durationMs: 700,
    reducedMotionFallback: "instant",
  },
  {
    id: "cta",
    title_en: "Start in under 60 seconds",
    title_uk: "Почніть менш ніж за 60 секунд",
    animationType: "fade-up",
    delayMs: 0,
    durationMs: 600,
    reducedMotionFallback: "static",
  },
];

/**
 * Serialise sections into a GSAP ScrollTrigger-compatible timeline config.
 * The consumer feeds this into `gsap.fromJSON()` or a custom driver.
 */
export function buildScrollTimeline(sections: ScrollSection[]): string {
  const timeline = sections.map((section, index) => ({
    id: section.id,
    trigger: `[data-section="${section.id}"]`,
    start: "top 80%",
    end: "bottom 20%",
    scrub: false,
    once: true,
    animation: {
      type: section.animationType,
      delay: section.delayMs / 1000,
      duration: section.durationMs / 1000,
      ease: "power2.out",
    },
    reducedMotion: section.reducedMotionFallback,
    order: index,
  }));

  return JSON.stringify({ version: "1.0", timeline }, null, 2);
}

/** Subtle motif dividers inserted between scroll sections. */
export const SECTION_DIVIDERS: {
  id: string;
  motif: "radar" | "scan" | "grid" | "pulse";
  opacity: number;
}[] = [
  { id: "divider-intro-map",      motif: "radar",  opacity: 0.12 },
  { id: "divider-map-ai",         motif: "scan",   opacity: 0.10 },
  { id: "divider-ai-sources",     motif: "grid",   opacity: 0.08 },
  { id: "divider-sources-cases",  motif: "pulse",  opacity: 0.10 },
  { id: "divider-cases-cta",      motif: "radar",  opacity: 0.14 },
];
