"use client";

import { parseAsArrayOf, parseAsString, parseAsInteger, useQueryStates } from "nuqs";
import type { EventClass, VerificationState } from "@aegis/types";
import { FILTER_DEFAULTS } from "./filter-config";

/**
 * URL-synced filter state. The map workspace + filter UI both read & write here.
 *
 * Defaults are omitted from the URL (cleaner shareable links).
 * See TODO/features/TODO_filters_search.md.
 */
export function useFilters() {
  const [values, setValues] = useQueryStates(
    {
      country: parseAsString.withDefault(FILTER_DEFAULTS.country),
      hours: parseAsInteger.withDefault(FILTER_DEFAULTS.hours),
      classes: parseAsArrayOf(parseAsString).withDefault([]),
      minSeverity: parseAsInteger.withDefault(FILTER_DEFAULTS.minSeverity),
      minConfidence: parseAsInteger.withDefault(FILTER_DEFAULTS.minConfidence),
      verification: parseAsString.withDefault(""),
      minDanger: parseAsInteger.withDefault(FILTER_DEFAULTS.minDanger),
      hasMedia: parseAsString.withDefault(""),
    },
    {
      history: "replace",
      clearOnDefault: true,
      shallow: true,
    },
  );

  return {
    country: values.country,
    hours: values.hours,
    classes: values.classes as EventClass[],
    minSeverity: values.minSeverity,
    minConfidence: values.minConfidence,
    verification: values.verification as VerificationState | "",
    minDanger: values.minDanger,
    hasMedia: values.hasMedia,
    setCountry: (c: string) => setValues({ country: c }),
    setHours: (h: number) => setValues({ hours: h }),
    setMinSeverity: (v: number) => setValues({ minSeverity: v }),
    setMinConfidence: (v: number) => setValues({ minConfidence: v }),
    setVerification: (v: VerificationState | "") => setValues({ verification: v }),
    setMinDanger: (v: number) => setValues({ minDanger: v }),
    setHasMedia: (v: string) => setValues({ hasMedia: v }),
    toggleClass: (c: EventClass) =>
      setValues({
        classes: values.classes.includes(c)
          ? values.classes.filter((x) => x !== c)
          : [...values.classes, c],
      }),
    setClasses: (cs: EventClass[]) => setValues({ classes: cs }),
    clearAll: () =>
      setValues({
        country: FILTER_DEFAULTS.country,
        hours: FILTER_DEFAULTS.hours,
        classes: [],
        minSeverity: FILTER_DEFAULTS.minSeverity,
        minConfidence: FILTER_DEFAULTS.minConfidence,
        verification: "",
        minDanger: FILTER_DEFAULTS.minDanger,
        hasMedia: "",
      }),
  };
}

/**
 * Build the API query string from current filters.
 */
export function buildEventsQuery(args: {
  country: string;
  hours: number;
  classes: string[];
  minSeverity?: number;
  minConfidence?: number;
  verification?: string;
  minDanger?: number;
  hasMedia?: string;
}): string {
  const sp = new URLSearchParams();
  sp.set("country", args.country);
  if (args.hours > 0) sp.set("hours", String(args.hours));
  for (const cls of args.classes) sp.append("class", cls);
  if (args.minSeverity && args.minSeverity > 0) sp.set("minSeverity", String(args.minSeverity));
  if (args.minConfidence && args.minConfidence > 0) sp.set("minConfidence", String(args.minConfidence));
  if (args.verification) sp.set("verification", args.verification);
  if (args.minDanger && args.minDanger > 0) sp.set("minDanger", String(args.minDanger));
  if (args.hasMedia) sp.set("hasMedia", args.hasMedia);
  return sp.toString();
}
