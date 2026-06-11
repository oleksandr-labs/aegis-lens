# Planet Labs Compliance

## Activation gate
Planet Labs is a **Phase 2** feature. The client throws `PlanetLabsNotAvailableError` unless `PLANET_API_KEY` is present. Do not route production traffic to this integration without a signed contract.

## Licensing tiers

### Education & Research Program
- Free or heavily discounted access for qualifying academic / non-profit organisations.
- Apply at: https://www.planet.com/markets/education-and-research/
- Restrictions: imagery may not be sublicensed or used for commercial revenue generation.

### Commercial Plans
- Requires a signed Master Subscription Agreement (MSA) with Planet Labs PBC.
- Pricing: based on area (km²), cadence, and resolution tier.
- Contact: https://www.planet.com/contact-sales/

## Imagery redistribution
- **Publishing / redistribution of Planet imagery is prohibited** without explicit written permission from Planet Labs.
- Derived works (e.g. change-detection maps, annotations) are generally permissible under commercial plans — confirm with Planet legal.
- Screenshots and limited excerpts for editorial / journalism are covered under fair-use principles in most jurisdictions; attribution required.

## Attribution
All uses must credit: "© YYYY Planet Labs PBC" with year of acquisition.

## Data residency
API endpoints are hosted in the United States. Data accessed through the API may be subject to US export controls (EAR). Consult legal before activating in sanctioned-territory contexts.

## Key storage
- `PLANET_API_KEY`: store in GitHub Actions secrets / server env, never in VCS.
- Rotate keys quarterly or upon any suspected compromise.
