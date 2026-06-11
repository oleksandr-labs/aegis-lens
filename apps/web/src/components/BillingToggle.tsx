"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

interface Props {
  monthlyLabel: string;
  annualLabel: string;
  badgeLabel: string;
}

export function BillingToggle({ monthlyLabel, annualLabel, badgeLabel }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const isAnnual = searchParams.get("billing") === "annual";

  function toggle(billing: "monthly" | "annual") {
    const params = new URLSearchParams(searchParams.toString());
    if (billing === "monthly") {
      params.delete("billing");
    } else {
      params.set("billing", "annual");
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => toggle("monthly")}
        className={`rounded-l border px-4 py-1.5 text-sm font-semibold transition-colors ${
          !isAnnual
            ? "border-accent bg-accent text-black"
            : "border-border-default bg-bg-surface text-text-secondary hover:bg-bg-elevated"
        }`}
      >
        {monthlyLabel}
      </button>
      <button
        type="button"
        onClick={() => toggle("annual")}
        className={`flex items-center gap-2 rounded-r border px-4 py-1.5 text-sm font-semibold transition-colors ${
          isAnnual
            ? "border-accent bg-accent text-black"
            : "border-border-default bg-bg-surface text-text-secondary hover:bg-bg-elevated"
        }`}
      >
        {annualLabel}
        <span className="rounded bg-green-500/20 px-1.5 py-0.5 font-mono text-[10px] text-green-400">
          {badgeLabel}
        </span>
      </button>
    </div>
  );
}
