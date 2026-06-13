# Hub — Drone Intelligence

## URLs
- `/drones` · `/drones/<sub>` (uav · counter-uav · swarms · loitering-munitions · fpv · maritime-drones)

## Content
- [x] Pillar overview — apps/web/src/lib/hubs/drones.ts (`dronesPillarNarrative`, EN + UK; `DroneSubCategory` type; `DRONES_HUB_URLS`)
- [x] Per-model equipment pages — apps/web/src/lib/hubs/drones.ts (`DRONE_EQUIPMENT_PAGES`, 6 models: Shahed-136, Bayraktar TB2, Lancet-3, FPV generic UA, Sea Baby USV, Uran-9)
- [x] Threat trends — apps/web/src/lib/hubs/drones.ts (`DRONE_THREAT_TRENDS`, 4 monthly trend entries with severity and region)
- [x] Counter-UAV ecosystem — apps/web/src/lib/hubs/drones.ts (`COUNTER_UAV_ECOSYSTEM`, 5 systems: Gepard, Bukovel-AD, IRIS-T SLM, Palyanytsia, Tor-M2)
- [x] Linked civilian-safety guidance — apps/web/src/lib/hubs/drones.ts (`CIVILIAN_SAFETY_GUIDANCE`, EN + UK, 8 shelter-in-place steps; `DRONES_FAQ` 10 Q&As + `dronesFaqJsonLd()`)
