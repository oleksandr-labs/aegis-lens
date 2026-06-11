export type CookbookSnippet = {
  language: "curl" | "typescript" | "python" | "go";
  label: string;
  code: string;
};

export type CookbookRecipe = {
  slug: string;
  title: string;
  goal: string;
  /** Plain-English step-by-step walkthrough. */
  steps: string[];
  /** Code snippets across languages. */
  snippets: CookbookSnippet[];
  /** Slugs of related recipes. */
  relatedSlugs?: string[];
  tags: string[];
};

export const RECIPES: CookbookRecipe[] = [
  {
    slug: "fetch-recent-events",
    title: "Fetch recent events for a country",
    goal: "Get the 50 most recent verified events for Ukraine using a single unauthenticated HTTP request.",
    steps: [
      "Hit `GET /api/events?country=ua&limit=50`.",
      "Iterate the `data[]` array; each item carries `eventId`, `class`, `dangerScore`, `confidence`, `location`, `summary`.",
      "Read `meta.hasMore` to decide whether to paginate further.",
    ],
    snippets: [
      {
        language: "curl",
        label: "cURL",
        code: `curl 'https://aegislens.io/api/events?country=ua&limit=50' \\
  -H 'Accept: application/json'`,
      },
      {
        language: "typescript",
        label: "TypeScript (fetch)",
        code: `const res = await fetch(
  'https://aegislens.io/api/events?country=ua&limit=50',
);
const { data, meta } = await res.json();
for (const ev of data) {
  console.log(ev.eventId, ev.class, ev.dangerScore);
}`,
      },
      {
        language: "python",
        label: "Python (requests)",
        code: `import requests

r = requests.get(
    "https://aegislens.io/api/events",
    params={"country": "ua", "limit": 50},
)
r.raise_for_status()
payload = r.json()
for ev in payload["data"]:
    print(ev["eventId"], ev["class"], ev["dangerScore"])`,
      },
    ],
    relatedSlugs: ["paginate-events", "filter-by-class"],
    tags: ["events", "api", "intro"],
  },
  {
    slug: "paginate-events",
    title: "Page through every event in a window",
    goal: "Use cursor pagination to walk the entire `/api/events` result set without missing or duplicating rows.",
    steps: [
      "Make the first request with your filters (`country`, `class`, `since`) and a `limit` (max 200).",
      "Each response includes `meta.nextCursor`. If it's null, stop.",
      "Otherwise call again with the same filters PLUS `cursor=<meta.nextCursor>`.",
      "Order is `occurredAt DESC, eventId DESC` — the cursor is base64url of `${occurredAt}|${eventId}` and is stable across page calls.",
    ],
    snippets: [
      {
        language: "typescript",
        label: "TypeScript",
        code: `let cursor: string | null = null;
const all: any[] = [];
do {
  const url = new URL('https://aegislens.io/api/events');
  url.searchParams.set('country', 'ua');
  url.searchParams.set('limit', '200');
  if (cursor) url.searchParams.set('cursor', cursor);
  const r = await fetch(url);
  const { data, meta } = await r.json();
  all.push(...data);
  cursor = meta.nextCursor;
} while (cursor);
console.log(\`fetched \${all.length} events\`);`,
      },
      {
        language: "python",
        label: "Python",
        code: `import requests

cursor = None
all_events = []
while True:
    params = {"country": "ua", "limit": 200}
    if cursor:
        params["cursor"] = cursor
    r = requests.get("https://aegislens.io/api/events", params=params)
    payload = r.json()
    all_events.extend(payload["data"])
    cursor = payload["meta"].get("nextCursor")
    if not cursor:
        break
print(f"fetched {len(all_events)} events")`,
      },
    ],
    relatedSlugs: ["fetch-recent-events"],
    tags: ["events", "pagination", "intermediate"],
  },
  {
    slug: "filter-by-class",
    title: "Filter events by multiple classes",
    goal: "Request only cyber + infrastructure events for the last 24 hours.",
    steps: [
      "Pass `class=cyber&class=infrastructure` (the parameter is repeatable).",
      "Use `hours=24` for a rolling window, or `since=2026-05-23T00:00:00Z` for an absolute lower bound.",
      "Combine with `country` and `limit` as needed.",
    ],
    snippets: [
      {
        language: "curl",
        label: "cURL",
        code: `curl 'https://aegislens.io/api/events?class=cyber&class=infrastructure&hours=24'`,
      },
    ],
    relatedSlugs: ["fetch-recent-events"],
    tags: ["events", "filtering", "intro"],
  },
  {
    slug: "subscribe-to-rss",
    title: "Subscribe to per-topic RSS feeds",
    goal: "Wire a dashboard or feed reader into the per-event-class RSS feeds — no authentication needed.",
    steps: [
      "Pick a class from `/api/topics` (military_action, infrastructure, cyber, civilian_alert, etc).",
      "Subscribe your reader to `/topics/<class>/feed.xml`.",
      "Use the locale-prefixed variant (`/uk/topics/<class>/feed.xml`) for UK-localized titles.",
    ],
    snippets: [
      {
        language: "curl",
        label: "cURL — fetch the feed",
        code: `curl 'https://aegislens.io/topics/cyber/feed.xml'`,
      },
    ],
    relatedSlugs: ["fetch-recent-events"],
    tags: ["rss", "syndication", "intro"],
  },
  {
    slug: "build-region-dashboard",
    title: "Build a region dashboard",
    goal: "Pull regions + events for a country and assemble a minimal dashboard view in TypeScript.",
    steps: [
      "Call `GET /api/regions?country=ua` to get the oblast bboxes.",
      "Call `GET /api/events?country=ua&limit=200` for events.",
      "Match each event to an oblast by bbox; aggregate counts per oblast.",
      "Render the result however you like — table, choropleth, etc.",
    ],
    snippets: [
      {
        language: "typescript",
        label: "TypeScript (Node)",
        code: `const [regions, events] = await Promise.all([
  fetch('https://aegislens.io/api/regions?country=ua').then(r => r.json()),
  fetch('https://aegislens.io/api/events?country=ua&limit=200').then(r => r.json()),
]);

function findOblast(lon: number, lat: number) {
  return regions.data.find((o: any) => {
    const [minLon, minLat, maxLon, maxLat] = o.bbox;
    return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
  });
}

const counts: Record<string, number> = {};
for (const e of events.data) {
  const ob = findOblast(e.location.lon, e.location.lat);
  if (ob) counts[ob.slug] = (counts[ob.slug] ?? 0) + 1;
}
console.table(counts);`,
      },
    ],
    relatedSlugs: ["fetch-recent-events", "paginate-events"],
    tags: ["regions", "dashboard", "intermediate"],
  },
  {
    slug: "score-and-threshold",
    title: "Filter events by danger threshold",
    goal: "Build a job that pages 429-safely and only acts on events above a danger threshold.",
    steps: [
      "Fetch with `limit=200` to minimize requests per second.",
      "Handle 429 by reading `Retry-After` and sleeping.",
      "Drop any event below your `dangerScore` cutoff.",
      "Reference the `/scoring/danger` explainer for what each band means.",
    ],
    snippets: [
      {
        language: "python",
        label: "Python",
        code: `import time, requests

DANGER_FLOOR = 70

def page():
    cursor = None
    while True:
        params = {"limit": 200}
        if cursor:
            params["cursor"] = cursor
        r = requests.get("https://aegislens.io/api/events", params=params)
        if r.status_code == 429:
            time.sleep(int(r.headers.get("Retry-After", "5")))
            continue
        r.raise_for_status()
        payload = r.json()
        for e in payload["data"]:
            if e["dangerScore"] >= DANGER_FLOOR:
                yield e
        cursor = payload["meta"].get("nextCursor")
        if not cursor:
            return`,
      },
    ],
    relatedSlugs: ["paginate-events"],
    tags: ["filtering", "rate-limits", "intermediate"],
  },
];

export function listRecipes(): CookbookRecipe[] {
  return RECIPES.slice();
}

export function getRecipe(slug: string): CookbookRecipe | null {
  return RECIPES.find((r) => r.slug === slug) ?? null;
}
