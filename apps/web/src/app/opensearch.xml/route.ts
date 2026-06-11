export const dynamic = "force-static";

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>Aegis Lens</ShortName>
  <Description>Search verified conflict and security events</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/x-icon">https://aegislens.io/favicon.ico</Image>
  <Url type="text/html" template="https://aegislens.io/search?q={searchTerms}"/>
  <Url type="application/json" template="https://aegislens.io/api/events?class={searchTerms}"/>
</OpenSearchDescription>
`;

export async function GET() {
  return new Response(XML, {
    headers: {
      "Content-Type": "application/opensearchdescription+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
