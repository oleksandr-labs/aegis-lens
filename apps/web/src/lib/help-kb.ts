export type HelpCategory =
  | "Getting Started"
  | "Map"
  | "Alerts"
  | "API"
  | "Billing"
  | "Account"
  | "Data Quality"
  | "Privacy"
  | "Troubleshooting";

export type HelpArticle = {
  slug: string;
  title: string;
  category: HelpCategory;
  body: string;
  tags: string[];
  updatedAt: string;
  popular?: boolean;
};

export const HELP_CATEGORIES_META: Record<
  HelpCategory,
  { label: string; icon: string; description: string }
> = {
  "Getting Started": {
    label: "Getting Started",
    icon: "🚀",
    description: "New to Aegis Lens? Start here.",
  },
  "Map": {
    label: "Live Map",
    icon: "🗺",
    description: "Map workspace, layers, event markers, and AOIs.",
  },
  "API": {
    label: "API & Integrations",
    icon: "⚡",
    description: "API keys, webhooks, SDKs, and rate limits.",
  },
  "Alerts": {
    label: "Alerts",
    icon: "🔔",
    description: "Setting up and managing email, Telegram, and webhook alerts.",
  },
  "Account": {
    label: "Account",
    icon: "👤",
    description: "Settings, team management, and security.",
  },
  "Data Quality": {
    label: "Data & Sources",
    icon: "📊",
    description: "How data is sourced, scored, and verified.",
  },
  "Billing": {
    label: "Billing",
    icon: "💳",
    description: "Plans, payments, upgrades, and invoices.",
  },
  "Privacy": {
    label: "Privacy",
    icon: "🔒",
    description: "Data retention, GDPR, and privacy controls.",
  },
  "Troubleshooting": {
    label: "Troubleshooting",
    icon: "🛠",
    description: "Fix common problems with the map, API, and alerts.",
  },
};

// Kept for backward compat — ordered list of category keys
export const HELP_CATEGORIES: HelpCategory[] = [
  "Getting Started",
  "Map",
  "Alerts",
  "API",
  "Billing",
  "Account",
  "Data Quality",
  "Privacy",
  "Troubleshooting",
];

export const HELP_ARTICLES: HelpArticle[] = [
  // Getting Started
  {
    slug: "creating-your-first-api-key",
    title: "Creating your first API key",
    category: "Getting Started",
    popular: true,
    body: "Sign in to the developer console and open **Settings → API keys**. Click *Generate key*, label it for the environment you intend to use (e.g. `staging`, `prod`), and copy the secret immediately — it is shown only once.\n\nKeys carry the rate limits of the account that owns them. Rotate keys at least every 90 days, and revoke any key you suspect has leaked. Free-tier keys are restricted to read-only endpoints; write access requires an upgraded plan.",
    tags: ["api", "auth", "onboarding", "keys"],
    updatedAt: "2026-04-12",
  },
  {
    slug: "your-first-map-query",
    title: "Your first map query",
    category: "Getting Started",
    popular: true,
    body: "Navigate to `/map`. You will see verified events plotted on a desaturated tactical basemap.\n\n**Filtering by time window:** Use the FilterBar at the top of the map. Click 1h, 6h, 24h, 7d, 30d, or All to change the time window.\n\n**Filtering by event class:** Click ⚙ Filters to expand the filter panel. Toggle event classes on or off.\n\n**Using the AI Copilot:** On the right rail, type a question like \"Summarize drone activity in Kharkiv last 6h.\" The copilot answers in plain English and cites event IDs.",
    tags: ["map", "filters", "onboarding", "copilot"],
    updatedAt: "2026-05-01",
  },
  {
    slug: "using-command-palette",
    title: "Using the Command Palette",
    category: "Getting Started",
    popular: true,
    body: "Press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux) from anywhere on the platform to open the command palette.\n\n**Navigate quickly:** Type `map` to jump to the live map, `dash` for dashboard, `alert` to create an alert.\n\n**Apply filters instantly:** Type `military` to show only military events, `ukraine` to filter to Ukraine.\n\n**AI queries:** Type `?` to open the AI Copilot directly from the palette.",
    tags: ["keyboard", "navigation", "copilot", "map"],
    updatedAt: "2026-05-10",
  },
  {
    slug: "embedding-the-widget",
    title: "Embedding the widget",
    category: "Getting Started",
    body: "Drop the embed script in your page `<head>` and add a `<div data-aegis-widget=\"region:UA-32\">` where you want the map. The widget is responsive, respects `prefers-reduced-motion`, and ships with attribution baked in.\n\nFor newsrooms and researchers, static embeds are free with attribution. Interactive embeds on commercial sites require a paid embed license — see `/pricing`.",
    tags: ["embed", "widget", "integration"],
    updatedAt: "2026-04-21",
  },

  // Map
  {
    slug: "using-the-live-map",
    title: "Using the live map",
    category: "Map",
    popular: true,
    body: "The live map at `/map` shows verified events as markers colour-coded by class. **Strike events** are red, **civilian alerts** are amber, **maritime** events are blue, and **humanitarian** events are green.\n\nClick any marker to open the event panel on the right. The panel shows the headline, confidence score, source chain, and a mini-timeline of nearby events. Drag the map to pan; scroll to zoom. On mobile, use pinch-to-zoom.\n\nUse the **legend** at the bottom-left to toggle event classes on or off. Use the **time filter** at the top-right to show events from the last hour, 24 hours, 7 days, or a custom range.",
    tags: ["map", "events", "navigation"],
    updatedAt: "2026-04-28",
  },
  {
    slug: "map-layers-and-overlays",
    title: "Map layers and overlays",
    category: "Map",
    body: "Toggle additional data layers from the **Layers** panel in the top-right corner of the map.\n\n**Available layers:** Satellite imagery (Sentinel-2 true-colour, updated every 5 days), fire detection (NASA FIRMS VIIRS, 375 m resolution, near-real-time), admin-1 boundaries (oblasts/provinces), and active front lines (updated daily from open-source ground truth).\n\nLayers are loaded on demand; switching them on has a small impact on page load. Satellite imagery is the heaviest layer — disable it if you are on a slow connection.",
    tags: ["map", "layers", "satellite", "fires"],
    updatedAt: "2026-05-01",
  },
  {
    slug: "searching-and-filtering-events",
    title: "Searching and filtering events on the map",
    category: "Map",
    body: "Press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux) to open the command palette from anywhere. Type a place name, event class, or free-text query to filter the map in real time.\n\nURL-addressable filters mean every search is a shareable link. The query string encodes region, class, date range, and confidence threshold. Example: `/map?country=ua&class=cyber&since=2026-05-01T00:00:00Z&confidence_min=0.7`.\n\nThe **confidence threshold slider** in the sidebar lets you hide low-confidence events. Setting it to 0.8 shows only high-confidence verified events.",
    tags: ["map", "search", "filter", "url"],
    updatedAt: "2026-05-10",
  },

  // Alerts
  {
    slug: "setting-up-telegram-alerts",
    title: "Setting up Telegram alerts",
    category: "Alerts",
    popular: true,
    body: "Search for `@aegislens_bot` on Telegram or visit `t.me/aegislens_bot`.\n\n**Connect your account:** Send `/start` to the bot. Then send your API key (found at `/account/api-keys`) to link your account.\n\n**Configure topics:** Use `/topics` to select which event classes trigger alerts. Use `/regions` to set geographic filters.\n\n**Confidence threshold:** Use `/threshold` to set a minimum confidence score (default 0.7).",
    tags: ["telegram", "bot", "alerts", "notifications"],
    updatedAt: "2026-05-15",
  },
  {
    slug: "setting-up-rss-alerts",
    title: "Setting up RSS / Atom alerts",
    category: "Alerts",
    body: "Every topic, region, and country has a dedicated RSS and Atom feed. Find the feed URL on the `/alerts` page or append `/feed.xml` to any topic or region URL (e.g. `/topics/military_action/feed.xml`).\n\nAdd the URL to your feed reader (Feedly, Inoreader, NetNewsWire, etc.). Feeds update within one minute of a new event being verified. Atom feeds (`/atom.xml`) are preferred for readers that support `<link rel=\"alternate\">` entry linking.",
    tags: ["alerts", "rss", "feeds", "notifications"],
    updatedAt: "2026-04-20",
  },
  {
    slug: "configuring-email-alerts",
    title: "Configuring email alert digests",
    category: "Alerts",
    body: "Sign up for email digests on the `/alerts` page. Enter your email, select topics, and choose a delivery frequency: **real-time** (within 15 min), **hourly**, or **daily**.\n\nDigests are double opt-in — you will receive a confirmation email before subscriptions activate. Unsubscribe from any digest email using the link in the footer, or manage all subscriptions from **Account → Alerts**.\n\nAvailable on free tier and above. Real-time delivery requires a Free+ account.",
    tags: ["alerts", "email", "digest", "notifications"],
    updatedAt: "2026-05-03",
  },
  {
    slug: "telegram-bot-commands",
    title: "Telegram bot commands reference",
    category: "Alerts",
    body: "Start the bot at `@aegislens_bot` with `/start`. The bot guides you through topic and confidence-threshold selection.\n\n`/start` — activate the bot and see the setup menu.\n`/topics` — show available event classes; tap to toggle.\n`/threshold` — set minimum confidence score (0.0–1.0, default 0.7).\n`/status` — show your current subscription configuration.\n`/pause` — pause all notifications (use `/start` to resume).\n`/stop` — unsubscribe and delete your data from the bot.\n\nThe bot does not store any personal data other than your Telegram user ID and subscription preferences.",
    tags: ["telegram", "bot", "alerts", "notifications"],
    updatedAt: "2026-05-15",
  },

  // API
  {
    slug: "api-authentication",
    title: "API Authentication",
    category: "API",
    body: "Navigate to `/account/api-keys` and click **Create new key**. Give it a descriptive name and select the scopes your integration needs.\n\n**Include the key in requests:** Add the Authorization header to every API request:\n`Authorization: Bearer alens_sk_your_key_here`\n\n**Key scopes:** Each key can have limited scopes — grant only the permissions your integration needs to follow the principle of least privilege.\n\n**Rotation:** Rotate keys at least every 90 days. Revoke any key you suspect has been leaked immediately from `/account/api-keys`.",
    tags: ["api", "auth", "onboarding", "keys"],
    updatedAt: "2026-04-12",
  },
  {
    slug: "webhook-signature-verification",
    title: "Webhook signature verification",
    category: "API",
    popular: true,
    body: "Every webhook delivery carries an `X-Aegis-Signature` header containing a hex-encoded HMAC-SHA256 of the raw request body, signed with your endpoint's signing secret. Verify it before trusting the payload.\n\nUse a constant-time comparison (`crypto.timingSafeEqual` in Node, `hmac.compare_digest` in Python) and reject any request whose `X-Aegis-Timestamp` is more than five minutes old to prevent replay attacks.\n\nSee the full guide at `/docs/webhooks`.",
    tags: ["webhooks", "security", "api", "hmac"],
    updatedAt: "2026-04-19",
  },
  {
    slug: "bulk-export-options",
    title: "Bulk export options",
    category: "API",
    body: "Paid tiers can export the full event catalogue as newline-delimited JSON or Parquet. Use the `/v1/export` endpoint to request a job — exports run asynchronously and the response includes a signed download URL valid for 24 hours.\n\nExports respect the same license as the API (CC BY 4.0 for core metadata, separate terms for derived analytics). Free-tier accounts can preview exports limited to 1,000 rows.",
    tags: ["export", "api", "bulk", "data"],
    updatedAt: "2026-04-08",
  },
  {
    slug: "handling-rate-limits-gracefully",
    title: "Handling rate limits gracefully",
    category: "API",
    body: "Rate-limited responses carry HTTP 429 and a `Retry-After` header in seconds. Honour it. The `X-RateLimit-Remaining` header on every response lets you slow down proactively before you hit the wall.\n\nFor bursty workloads, use the `/v1/events/stream` SSE endpoint instead of polling — it is not metered against the request rate limit, only against connection count.",
    tags: ["api", "rate-limit", "429", "retry"],
    updatedAt: "2026-04-05",
  },

  // Billing
  {
    slug: "cancelling-your-subscription",
    title: "Cancelling your subscription",
    category: "Billing",
    body: "Open **Settings → Billing** and click *Cancel plan*. Your subscription remains active until the end of the current billing period — there are no prorated refunds for partial months, but you keep full access until the renewal date.\n\nAfter cancellation your account downgrades to the free tier. API keys continue to work but inherit free-tier rate limits. Exported datasets you have already downloaded remain yours under the original license terms.",
    tags: ["billing", "cancel", "subscription"],
    updatedAt: "2026-02-18",
  },

  // Data Quality
  {
    slug: "how-confidence-scores-work",
    title: "How confidence scores work",
    category: "Data Quality",
    popular: true,
    body: "Every event has a confidence score from 0 to 1 (shown as 0–100% in the UI).\n\n**Score levels:**\n- 0.0–0.3: Low — single source, unverified\n- 0.3–0.7: Medium — multiple sources, partial verification\n- 0.7–1.0: High — independently corroborated, media verified\n\n**How the score is calculated:** The score combines: number of independent sources, cross-source consistency, media verification status, and geographic plausibility checks.\n\nSee the full methodology at `/methodology/scoring`.",
    tags: ["scoring", "confidence", "methodology", "data"],
    updatedAt: "2026-04-15",
  },
  {
    slug: "understanding-danger-score",
    title: "Understanding the danger score",
    category: "Data Quality",
    body: "The danger score is a 0–100 composite that blends event frequency, severity weights, recency decay, and population exposure within a region. It is not a forecast — it summarises observed risk over the trailing 14 days.\n\nScores recompute hourly. A region's score can move sharply when a single high-severity event lands, then decays smoothly as the event ages. See `/methodology` for the full formula and parameter ranges.",
    tags: ["scoring", "methodology", "regions"],
    updatedAt: "2026-03-30",
  },
  {
    slug: "how-to-verify-an-event-source",
    title: "How to verify an event source",
    category: "Data Quality",
    body: "Every event record exposes its source chain in the `sources[]` array. Each source carries a tier (A–D), a URL, and a captured-at timestamp. Tier-A sources (official statements, primary documents, geolocated imagery) anchor confidence; lower tiers adjust it.\n\nClick *View source chain* on the event detail page to inspect each link. If a source link 404s, use the captured-at timestamp with the Wayback Machine to retrieve the archived copy we ingested.",
    tags: ["verification", "sources", "trust"],
    updatedAt: "2026-04-02",
  },
  {
    slug: "events-vs-incidents",
    title: "Difference between events and incidents",
    category: "Data Quality",
    body: "An **event** is a single observed occurrence — one strike, one sighting, one movement. An **incident** is a higher-level grouping of related events that share a narrative thread, for example a multi-stage drone attack on a single facility over several hours.\n\nIncidents are curated by analysts after the fact; events are published as they are verified. The API exposes both as separate resources, linked by `incident_id` on the event record.",
    tags: ["events", "incidents", "model"],
    updatedAt: "2026-03-22",
  },
  {
    slug: "why-isnt-my-region-showing-events",
    title: "Why isn't my region showing events?",
    category: "Data Quality",
    body: "A region may appear empty for three reasons: (1) no events have been published in the active time window — try widening the date filter; (2) your filter classes exclude all available events — reset the class filter; (3) the region is outside our current coverage area, which is centred on Ukraine and immediate neighbours.\n\nIf you believe an event is missing, send a tip via `/contact` with a source link and time window. Tips are triaged daily by analysts.",
    tags: ["coverage", "filters", "regions", "troubleshooting"],
    updatedAt: "2026-04-15",
  },
  {
    slug: "reporting-data-corrections",
    title: "Reporting data corrections",
    category: "Data Quality",
    body: "If you spot an inaccurate event, use the *Suggest correction* link on the event detail page or email `corrections@aegislens.io` with the event ID and the specific field at issue. Include a source link wherever possible.\n\nCorrections are triaged within 48 hours. Material changes are logged in the event's `revision_history[]` array and published on the `/trust/corrections` ledger.",
    tags: ["corrections", "accuracy", "trust"],
    updatedAt: "2026-03-28",
  },

  // Privacy
  {
    slug: "privacy-and-data-retention",
    title: "Privacy and data retention",
    category: "Privacy",
    body: "We minimise the personal data we collect. Account records hold email, hashed password, and billing identifiers; nothing else is required. API access logs are retained for 30 days for abuse-prevention, then aggregated and discarded.\n\nYou can request export or deletion of your account data at any time from **Settings → Privacy**, or by emailing `privacy@aegislens.io`. Deletion is irreversible and propagates to backups within 35 days.",
    tags: ["privacy", "gdpr", "retention", "account"],
    updatedAt: "2026-04-01",
  },

  // Troubleshooting
  {
    slug: "api-returning-401",
    title: "API returning 401 Unauthorized",
    category: "Troubleshooting",
    body: "A 401 response means the request was not authenticated correctly. Check the following:\n\n1. The `Authorization` header must be exactly `Bearer <your-key>` — no quotes, no extra spaces.\n2. Free-tier keys are scoped to read-only endpoints. Calls to write endpoints return 401 even with a valid key.\n3. Keys rotated or deleted in the console take effect within 30 seconds. If you just rotated a key, wait and retry.\n4. Keys are environment-specific — a `staging` key will not work in a `prod` request or vice versa if your app hard-codes the environment scope.\n\nIf none of the above resolves the issue, open a support ticket with the failing request headers (redact the key value) and the full response body.",
    tags: ["api", "auth", "401", "troubleshooting"],
    updatedAt: "2026-04-25",
  },
  {
    slug: "map-not-loading",
    title: "Map not loading or blank screen",
    category: "Troubleshooting",
    body: "If the map shows a blank area or a loading spinner that never resolves:\n\n1. **Check your browser:** The map requires WebGL. Test at `webglreport.com`. Chrome 90+, Firefox 88+, and Safari 15+ all support it.\n2. **Disable content blockers:** Some privacy extensions block the tile CDN (`tiles.aegislens.io`). Add it to your allowlist.\n3. **Clear cache and hard-reload:** `Shift+Reload` or `Ctrl+Shift+R` clears stale tile cache.\n4. **Check the status page:** An outage on Map tiles will be reflected at `/status`.\n\nIf the issue persists, open the browser developer console (F12) and share any red error messages with `support@aegislens.io`.",
    tags: ["map", "webgl", "troubleshooting", "loading"],
    updatedAt: "2026-04-18",
  },
  {
    slug: "events-not-appearing-in-api",
    title: "Events not appearing in API response",
    category: "Troubleshooting",
    body: "If you expect an event to appear in the API but it does not:\n\n1. Check the `verification_state` filter — by default the API returns only `verified` events. Pass `?verification_state=all` to include events under review.\n2. Check the `since` and `until` parameters — events are indexed by `occurred_at`, not `published_at`. An event that happened yesterday but was published today is returned with yesterday's timestamp.\n3. Check the `confidence_min` filter — the default is `0.3`. Lower it to `0.0` to see all events regardless of confidence.\n4. Geographic filters (`bbox`, `region`) can silently exclude events with imprecise geolocations. Remove geographic filters to confirm.\n\nIf the event appears on the map but not in the API, it is likely in a verification state or confidence tier your current filter excludes.",
    tags: ["api", "events", "filter", "troubleshooting"],
    updatedAt: "2026-05-08",
  },
];

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}

export function articlesByCategory(cat: HelpCategory): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === cat);
}

export function popularArticles(): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.popular === true);
}

export function relatedArticles(article: HelpArticle, limit = 4): HelpArticle[] {
  return HELP_ARTICLES.filter(
    (a) => a.category === article.category && a.slug !== article.slug,
  ).slice(0, limit);
}

/** Simple case-insensitive text match over title, body, tags. */
export function searchHelp(q: string): HelpArticle[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  return HELP_ARTICLES.filter((a) => {
    const hay = `${a.title}\n${a.body}\n${a.tags.join(" ")}\n${a.category}`.toLowerCase();
    return hay.includes(needle);
  });
}
