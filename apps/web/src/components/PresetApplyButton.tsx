"use client";

import { useRouter } from "next/navigation";
import type { WorkspacePreset } from "@/lib/workspace-presets";

export function PresetApplyButton({ preset }: { preset: WorkspacePreset }) {
  const router = useRouter();

  const handleApply = () => {
    window.dispatchEvent(
      new CustomEvent("aegis:apply-preset", { detail: preset }),
    );
    const sp = new URLSearchParams({
      country: preset.filters.country,
      hours: String(preset.filters.hours),
      ...(preset.filters.classes.length
        ? { classes: preset.filters.classes.join(",") }
        : {}),
    });
    router.push(`/map?${sp.toString()}`);
    window.dispatchEvent(
      new CustomEvent("aegis:toast", {
        detail: { message: `Applied preset: ${preset.name}`, variant: "success" },
      }),
    );
  };

  return (
    <button
      type="button"
      onClick={handleApply}
      className="flex-1 rounded border border-accent/60 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
    >
      Apply preset →
    </button>
  );
}
