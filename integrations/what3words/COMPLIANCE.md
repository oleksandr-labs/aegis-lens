# What3words Compliance

## Integration status
This integration is **optional** and **feature-gated** behind `W3W_API_KEY`. The client degrades to demo mode (5 pre-seeded UA addresses) when the key is absent.

## API Terms of Service
- **Free tier**: Available for non-commercial and limited commercial use with attribution.
- **Commercial use**: Applications with significant traffic or commercial purpose require a paid plan. Contact What3words for pricing: https://what3words.com/business
- **Attribution**: The what3words logo and "what3words" branding must appear adjacent to any displayed 3-word address. See brand guidelines: https://developer.what3words.com/tools
- **Prohibited**: Reverse engineering the address algorithm; using the API to build a competing product; bulk harvesting addresses.
- **Data residency**: API calls are processed by What3words servers (UK/EU). No PII is transmitted beyond the coordinate or address itself.
- **Full terms**: https://what3words.com/legal/api-terms/

## Implementation notes
- Store `W3W_API_KEY` in environment secrets, never in VCS.
- Cache coordinate lookups (`next: { revalidate: 86400 }`) — coordinates are stable; this reduces API quota consumption.
- If `W3W_API_KEY` is absent, the feature should be hidden in the UI rather than showing an error.
