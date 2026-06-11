"use client";

import { useState } from "react";
import { AegisMap } from "@/components/Map/AegisMap";
import { MapTopBar } from "@/components/Map/MapTopBar";
import { MapTimelineBar } from "@/components/Map/MapTimelineBar";
import { MobileMapControls } from "./MobileMapControls";
import { MobileEventInspector } from "./MobileEventInspector";
import { MobileLayerBrowser } from "./MobileLayerBrowser";
import type { AegisEvent } from "@aegis/types";

export function MobileMapLayout() {
  const [selectedEvent, setSelectedEvent] = useState<AegisEvent | null>(null);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col md:hidden">
      {/* Top bar */}
      <MapTopBar />

      {/* Layer chips strip */}
      <div className="border-b border-border-subtle bg-bg-elevated px-3 pt-2">
        <MobileLayerBrowser />
      </div>

      {/* Map canvas — fills remaining space */}
      <div className="relative flex-1 overflow-hidden">
        <AegisMap />
        <MobileMapControls />
      </div>

      {/* Timeline bar */}
      <MapTimelineBar />

      {/* Mobile event inspector (renders as bottom sheet) */}
      <MobileEventInspector
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
