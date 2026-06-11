# MapTiler / OSM Compliance

## MapTiler

- **Free tier**: 100,000 tile requests / month. Attribution `© MapTiler © OpenStreetMap contributors` must appear on every map view.
- **Paid tier**: Commercial plans remove rate limits; attribution still required.
- **Terms**: https://www.maptiler.com/terms/
- **Key storage**: `MAPTILER_API_KEY` env variable — never commit to VCS.
- **Allowed use**: All use cases including commercial, with attribution.
- **Prohibited**: Caching / proxying tiles beyond allowed CDN use; bulk downloading.

## OpenStreetMap Fallback (CC BY-SA 2.0)

- **Tile policy**: OSM tile servers are for light use only (development / fallback). Heavy production traffic must use a hosted tile service or self-hosted tile server.
- **Attribution**: `© OpenStreetMap contributors` must be visible on every map.
- **License**: OpenStreetMap data is licensed under the Open Database Licence (ODbL). Derived works must share-alike.
- **Full terms**: https://www.openstreetmap.org/copyright
- **Production**: Do not route significant tile traffic through tile.openstreetmap.org. Use MapTiler, self-hosted Tegola/Martin, or similar.
