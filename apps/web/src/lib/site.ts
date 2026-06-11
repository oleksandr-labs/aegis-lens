export const SITE = {
  name: "Aegis Lens",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  tagline: "Intelligence at the speed of events.",
  description:
    "AI-native OSINT intelligence platform — Ukraine first, global next. Verified events, multilingual analysis, real-time map.",
} as const;
