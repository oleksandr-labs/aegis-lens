"use client";

/**
 * useEvents — data-fetching hook for Aegis events.
 *
 * Implemented with useEffect + useState (no @tanstack/react-query installed).
 * Uses the in-memory cache in lib/store/query-client.ts to avoid redundant
 * network calls within the 30 s stale window.
 *
 * When @tanstack/react-query is added, replace this with:
 *   return useQuery({ queryKey: ["events", filters], queryFn: … , staleTime: 30_000 });
 */

import { useState, useEffect, useRef } from "react";
import type { AegisEvent } from "@aegis/types";
import { buildEventsQuery } from "@/lib/use-filters";
import { getFromCache, setCache, buildCacheKey } from "@/lib/store/query-client";

export interface EventFilters {
  country: string;
  hours: number;
  classes: string[];
  minSeverity?: number;
  minConfidence?: number;
  verification?: string;
}

export interface UseEventsResult {
  data: AegisEvent[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useEvents(filters: EventFilters): UseEventsResult {
  const [data, setData] = useState<AegisEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fetchTick, setFetchTick] = useState(0);

  // Stable cache key derived from filters
  const cacheKey = buildCacheKey("events", {
    country: filters.country,
    hours: filters.hours,
    classes: [...filters.classes].sort().join(","),
    minSeverity: filters.minSeverity ?? 0,
    minConfidence: filters.minConfidence ?? 0,
    verification: filters.verification ?? "",
  });

  // Track the cache key to abort stale requests
  const cacheKeyRef = useRef(cacheKey);

  useEffect(() => {
    cacheKeyRef.current = cacheKey;

    // Serve from cache if still fresh
    const cached = getFromCache<AegisEvent[]>(cacheKey);
    if (cached) {
      setData(cached);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const qs = buildEventsQuery({
      country: filters.country,
      hours: filters.hours,
      classes: filters.classes,
      minSeverity: filters.minSeverity,
      minConfidence: filters.minConfidence,
      verification: filters.verification,
    });

    fetch(`/api/events?${qs}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ data?: AegisEvent[] }>;
      })
      .then((json) => {
        if (cacheKeyRef.current !== cacheKey) return; // stale response
        const events = json.data ?? [];
        setCache(cacheKey, events, 30_000);
        setData(events);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === "AbortError") return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (cacheKeyRef.current === cacheKey) setLoading(false);
      });

    return () => controller.abort();
    // fetchTick triggers manual refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.country,
    filters.hours,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    filters.classes.join(","),
    filters.minSeverity,
    filters.minConfidence,
    filters.verification,
    fetchTick,
  ]);

  const refetch = () => setFetchTick((t) => t + 1);

  return { data, loading, error, refetch };
}
