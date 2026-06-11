"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { WorkspacePreset } from "@/lib/workspace-presets";

export function PresetApplier() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: Event) => {
      const preset = (e as CustomEvent<WorkspacePreset>).detail;
      // Build URL with preset filters
      const sp = new URLSearchParams({
        country: preset.filters.country,
        hours: String(preset.filters.hours),
        ...(preset.filters.classes.length
          ? { classes: preset.filters.classes.join(",") }
          : {}),
      });
      router.push(`/map?${sp.toString()}`);
      // Show toast
      window.dispatchEvent(
        new CustomEvent("aegis:toast", {
          detail: {
            message: `Applied preset: ${preset.name}`,
            variant: "success",
          },
        }),
      );
    };

    window.addEventListener("aegis:apply-preset", handler);
    return () => window.removeEventListener("aegis:apply-preset", handler);
  }, [router]);

  return null;
}
