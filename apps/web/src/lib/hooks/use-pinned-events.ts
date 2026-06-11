"use client";

/**
 * usePinnedEvents — reads/writes the user store's pinnedEventIds and resolves
 * the full AegisEvent objects from the seed data.
 *
 * Pins are persisted to localStorage via the UserStore (aegis:user key).
 */

import { useCallback } from "react";
import { useUserStore } from "@/lib/store/index";
import { eventsInCountry } from "@/lib/events-seed";
import type { AegisEvent } from "@aegis/types";

export interface UsePinnedEventsResult {
  /** Full AegisEvent objects for every pinned ID that resolves in the seed. */
  pinnedEvents: AegisEvent[];
  /** Pin an event by ID. No-op if already pinned. */
  pinEvent: (id: string) => void;
  /** Unpin an event by ID. No-op if not pinned. */
  unpinEvent: (id: string) => void;
  /** Returns true if the given event ID is currently pinned. */
  isPinned: (id: string) => boolean;
  /** Toggle pin state for the given event ID. */
  toggle: (id: string) => void;
}

export function usePinnedEvents(): UsePinnedEventsResult {
  const { pinnedEventIds, pinEvent, unpinEvent } = useUserStore();

  // Resolve pinned IDs against the seed (replace with API call once DB lands).
  // We look up across all UA events for now; extend to other countries as needed.
  const allUaEvents = eventsInCountry("ua");
  const pinnedEvents = allUaEvents.filter((e) => pinnedEventIds.includes(e.eventId));

  const toggle = useCallback(
    (id: string) => {
      if (pinnedEventIds.includes(id)) {
        unpinEvent(id);
      } else {
        pinEvent(id);
      }
    },
    [pinnedEventIds, pinEvent, unpinEvent],
  );

  const isPinned = useCallback(
    (id: string) => pinnedEventIds.includes(id),
    [pinnedEventIds],
  );

  return { pinnedEvents, pinEvent, unpinEvent, isPinned, toggle };
}
