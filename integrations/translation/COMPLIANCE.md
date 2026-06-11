# Translation Provider Compliance

## DeepL

- **Free tier**: 500,000 characters / month. Free tier endpoint: `api-free.deepl.com`.
- **Pro tier**: Pay-per-character; higher rate limits; same API surface.
- **Terms**: https://www.deepl.com/en/pro-license
- **Data use**: DeepL does not use API translations to train its models. Customer data is not retained beyond the time required to process requests.
- **GDPR**: DeepL is GDPR-compliant; EU data residency available. DPA available on request.
- **Prohibited**: Using the API to train competing ML models; reverse engineering; embedding in offline products without an Enterprise license.
- **Key storage**: `DEEPL_API_KEY` — secrets only. Set `DEEPL_PLAN=pro` for the Pro endpoint.

## Lingvanex

- **Terms**: https://lingvanex.com/terms-of-service/
- **Data use**: Lingvanex may log API requests for quality improvement — review their current DPA before using for PII-containing content.
- **Free tier**: Limited; intended for evaluation.
- **Key storage**: `LINGVANEX_API_KEY` — secrets only.

## Operational notes

- Translation of sensitive OSINT content: prefer providers with explicit no-training / no-retention clauses (DeepL Pro).
- Ukrainian (`UK`) and Russian (`RU`) are supported by both providers.
- For machine-translated content displayed to users, add a visible "Machine-translated — verify independently" disclaimer for YMYL content (medical / legal / safety information).
