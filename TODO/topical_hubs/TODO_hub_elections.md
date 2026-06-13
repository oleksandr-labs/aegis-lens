# Hub — Election Integrity

## URLs
- `/elections` · `/elections/<country>` · `/elections/<country>/<year>`

## Content
- [x] Per-election: timeline · key signals · risks — apps/web/src/lib/hubs/elections.ts (`TRACKED_ELECTIONS`, 6 elections: UA/2025, US/2026, DE/2025, PL/2025, RO/2024, FR/2027; `ElectionRecord` interface)
- [x] Disinfo monitoring for the cycle — apps/web/src/lib/hubs/elections.ts (`disinfoMonitoring` flag on each ElectionRecord; `ELECTIONS_FAQ` coverage)
- [x] Foreign-interference watch — apps/web/src/lib/hubs/elections.ts (`foreignInterference` flag; `risks[]` per record; interference definition in FAQ)
- [x] Election-day live coverage hub — apps/web/src/lib/hubs/elections.ts (`liveCoverageUrl` optional field on `ElectionRecord`; `ELECTIONS_HUB_URLS` helpers)
- [x] Editorial neutrality strict — apps/web/src/lib/hubs/elections.ts (`ELECTION_EDITORIAL_POLICY` const: 5 principles + 5 prohibitions; `electionsPillarNarrative` editorial notice)
