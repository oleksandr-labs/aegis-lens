# BlackSky / Capella Compliance

## Phase 3 activation requirements
Both providers are **Phase 3** features. No imagery data flows until both conditions are met:
1. A signed **Commercial Imagery License Agreement** with the respective provider.
2. A valid API key set in the server environment (`BLACKSKY_API_KEY` or `CAPELLA_API_KEY`).

## BlackSky

- **Provider**: BlackSky Technology Inc. (HQ: Seattle, USA)
- **Sensor type**: Electro-optical (EO), sub-1 m resolution
- **Terms**: Master License and Services Agreement required.
  Contact: https://www.blacksky.com/contact/
- **Redistribution**: Prohibited without written permission. Derived works (annotations, change maps) subject to negotiation.
- **Export controls**: Subject to US EAR / ITAR. Do not use in OFAC-sanctioned jurisdiction workflows without legal review.
- **Attribution**: "© YYYY BlackSky Technology Inc."

## Capella Space

- **Provider**: Capella Space Corp. (HQ: San Francisco, USA)
- **Sensor type**: Synthetic Aperture Radar (SAR), 0.35–1 m resolution
- **Terms**: Commercial License Agreement required. SAR imagery has additional national-security licensing requirements in the USA (15 CFR Part 960).
  Contact: https://www.capellaspace.com/contact/
- **Special note**: SAR imagery can penetrate cloud cover and darkness — operationally valuable but subject to stricter export review.
- **Redistribution**: Strictly prohibited without Capella's written consent.
- **Attribution**: "© YYYY Capella Space Corp."

## Tasking (future satellite collection)
Ordering new tasking collections (directing a satellite to collect imagery over a specific AOI) requires:
- An active commercial contract with tasking credits.
- Lead time: 24–72 h depending on orbital geometry.
- The `HighResClient.order()` method currently supports archive orders only; extend with a dedicated `task()` method for new collections.

## Key storage
- `BLACKSKY_API_KEY`, `CAPELLA_API_KEY`: GitHub Actions secrets / server env only. Never commit to VCS.
- Keys are provider-specific — do not share between environments.
