export type IntegrationCategory =
  | "comms"
  | "automation"
  | "bi"
  | "siem"
  | "crm"
  | "dev";

export type Integration = {
  slug: string;
  vendor: string;
  category: IntegrationCategory;
  /** One-sentence description. */
  description: string;
  /** Use-cases this integration addresses. */
  useCases: string[];
  /** Step-by-step setup. */
  steps: string[];
  /** Required Aegis surfaces. */
  requires: string[];
  /** Status: ready / beta / planned. */
  status: "ready" | "beta" | "planned";
  tags: string[];
};

export const INTEGRATIONS: Integration[] = [
  {
    slug: "slack",
    vendor: "Slack",
    category: "comms",
    description:
      "Post Aegis Lens incidents to a Slack channel based on per-region or per-class severity thresholds.",
    useCases: [
      "Push critical incidents (danger ≥ 80) to an #ops channel",
      "Per-region routing — Ukraine alerts go to #ua, EU border alerts go to #eu",
      "Daily morning digest of the past 24h",
    ],
    steps: [
      "Create an Aegis Lens alert subscription at /alerts with your filters.",
      "Generate a webhook URL in the destination Slack channel (Apps → Incoming Webhooks).",
      "Paste the URL into the subscription's destination field.",
      "Test the flow with a low-severity rule, then move to production thresholds.",
    ],
    requires: ["/alerts subscription", "Slack workspace admin"],
    status: "planned",
    tags: ["slack", "comms", "webhook"],
  },
  {
    slug: "microsoft-teams",
    vendor: "Microsoft Teams",
    category: "comms",
    description: "Post Aegis Lens alerts into MS Teams channels via incoming webhook.",
    useCases: [
      "Critical-incident routing for security operations",
      "Government / enterprise tenants where Teams is the standard",
      "Multi-channel routing by class",
    ],
    steps: [
      "Add an Incoming Webhook connector to your Teams channel.",
      "Copy the connector URL into your /alerts subscription destination.",
      "Choose card format: text-only or rich Adaptive Card payload.",
    ],
    requires: ["/alerts subscription", "Teams channel owner permission"],
    status: "planned",
    tags: ["microsoft", "teams", "webhook"],
  },
  {
    slug: "telegram",
    vendor: "Telegram",
    category: "comms",
    description:
      "Push Aegis Lens alerts to a private Telegram channel via bot. Useful for field teams without enterprise SaaS access.",
    useCases: [
      "Field-team broadcast (read-only)",
      "Personal alert channel for analysts",
      "Civilian-safety mirror channel",
    ],
    steps: [
      "Create a Telegram bot via @BotFather and note the token.",
      "Add the bot to your target channel as an admin (post permission only).",
      "Configure the /alerts subscription with `provider=telegram` and your bot token + channel ID.",
    ],
    requires: ["Telegram bot token", "/alerts subscription"],
    status: "planned",
    tags: ["telegram", "comms", "field"],
  },
  {
    slug: "webhook",
    vendor: "Generic webhook",
    category: "automation",
    description:
      "POST every matching alert to your own HTTPS endpoint. The escape hatch for integrations we don't directly support.",
    useCases: [
      "Pipe alerts into your own incident-management system",
      "Trigger downstream automations (PagerDuty, Opsgenie, Linear, etc.)",
      "Custom enrichment + re-routing inside your network",
    ],
    steps: [
      "Stand up a public HTTPS endpoint that accepts POST + JSON.",
      "Add the URL as the destination on your /alerts subscription.",
      "Verify the HMAC signature header against the shared secret on every request.",
      "Acknowledge with 2xx; non-2xx triggers retries with exponential backoff.",
    ],
    requires: ["HTTPS endpoint", "/alerts subscription", "HMAC verification"],
    status: "planned",
    tags: ["webhook", "automation", "developer"],
  },
  {
    slug: "zapier",
    vendor: "Zapier",
    category: "automation",
    description:
      "No-code automation across thousands of SaaS apps using Aegis Lens alerts as a trigger.",
    useCases: [
      "Tag a Notion database when a new investigation is published",
      "Create a Jira ticket when an incident crosses a threshold",
      "Pipe alerts to a Google Sheet for archival",
    ],
    steps: [
      "Search for 'Aegis Lens' in the Zapier app directory.",
      "Authorize Zapier with an Aegis Lens API key (see /account/api-keys).",
      "Pick a trigger event and connect a destination Zap.",
    ],
    requires: ["Zapier account", "Aegis Lens API key"],
    status: "planned",
    tags: ["zapier", "automation", "no-code"],
  },
  {
    slug: "make",
    vendor: "Make (Integromat)",
    category: "automation",
    description:
      "Visual automation with conditional logic over Aegis Lens events, sources, and reports.",
    useCases: [
      "Conditional routing based on region + class + danger",
      "Data transformation before piping into legacy systems",
      "Cron-based bulk pulls",
    ],
    steps: [
      "Install the Aegis Lens module from the Make app library.",
      "Authorize with an API key.",
      "Build a scenario using `Watch Events` or `Search Events` modules.",
    ],
    requires: ["Make account", "Aegis Lens API key"],
    status: "planned",
    tags: ["make", "integromat", "automation"],
  },
  {
    slug: "splunk",
    vendor: "Splunk",
    category: "siem",
    description:
      "Stream Aegis Lens events into Splunk for correlation with internal telemetry and SOC dashboards.",
    useCases: [
      "Correlate civilian cyber events with internal SIEM telemetry",
      "Build SOC dashboards combining open-source + closed-source signals",
      "Long-term archival of public-event timelines",
    ],
    steps: [
      "Install the Aegis Lens TA (Technology Add-on) from Splunkbase (planned).",
      "Configure an HTTP Event Collector token in your Splunk instance.",
      "Point the TA's outbound at the HEC endpoint; pick a class filter.",
    ],
    requires: ["Splunk Enterprise / Cloud", "HEC token"],
    status: "planned",
    tags: ["splunk", "siem", "soc"],
  },
  {
    slug: "elastic",
    vendor: "Elastic",
    category: "siem",
    description:
      "Index Aegis Lens events into an Elasticsearch cluster for Kibana dashboarding.",
    useCases: [
      "Build a regional dashboard in Kibana with map + sparkline tiles",
      "Combine with internal logs for cross-source investigation",
      "Long-term retention with rollups",
    ],
    steps: [
      "Add the Aegis Lens Elastic agent integration (planned).",
      "Provide cluster credentials and a destination index.",
      "Choose a polling interval and class filter.",
    ],
    requires: ["Elasticsearch cluster", "Elastic Agent"],
    status: "planned",
    tags: ["elastic", "siem", "kibana"],
  },
  {
    slug: "power-bi",
    vendor: "Power BI",
    category: "bi",
    description:
      "Pull Aegis Lens datasets into Power BI for executive briefings and trend dashboards.",
    useCases: [
      "Executive briefing dashboards",
      "Trend analysis across quarters",
      "Cross-source enrichment with internal data",
    ],
    steps: [
      "In Power BI, choose Get Data → Web → enter the dataset URL (e.g. /data/events.json).",
      "Authenticate with an API key (Anonymous is fine for public endpoints).",
      "Build visuals using the resulting table.",
    ],
    requires: ["Power BI Desktop or Service"],
    status: "ready",
    tags: ["powerbi", "bi", "microsoft"],
  },
  {
    slug: "tableau",
    vendor: "Tableau",
    category: "bi",
    description:
      "Connect Tableau to the Aegis Lens public datasets via Web Data Connector or direct download.",
    useCases: [
      "Build interactive dashboards on the open dataset",
      "Combine open data with internal Tableau Server sources",
    ],
    steps: [
      "Download /data/events.json or /data/geography.geojson directly.",
      "Use Tableau's Web Data Connector for a live feed.",
      "Refresh on your preferred cadence.",
    ],
    requires: ["Tableau Desktop"],
    status: "ready",
    tags: ["tableau", "bi"],
  },
  {
    slug: "salesforce",
    vendor: "Salesforce",
    category: "crm",
    description:
      "Enrich Salesforce account records with Aegis Lens regional severity context for sanctions & risk workflows.",
    useCases: [
      "Country-risk tagging on accounts",
      "Sanctions-screening enrichment",
      "Sales conversations grounded in operational reality",
    ],
    steps: [
      "Install the Aegis Lens managed package (planned).",
      "Authenticate with an API key.",
      "Map account country → Aegis Lens region; choose enrichment frequency.",
    ],
    requires: ["Salesforce admin", "Aegis Lens API key"],
    status: "planned",
    tags: ["salesforce", "crm", "risk"],
  },
  {
    slug: "github-actions",
    vendor: "GitHub Actions",
    category: "dev",
    description:
      "Surface Aegis Lens events into your CI/CD or scheduled-job workflows via a public action.",
    useCases: [
      "Daily regional briefings posted as workflow comments",
      "Trigger builds when severity in a watched region changes",
      "Automated content pipelines (e.g., archive a daily snapshot)",
    ],
    steps: [
      "Add `aegis-lens/fetch-events-action@v1` to your workflow (planned).",
      "Configure filters via inputs.",
      "Pipe outputs into the next workflow step.",
    ],
    requires: ["GitHub repo + Actions enabled"],
    status: "planned",
    tags: ["github", "actions", "dev"],
  },
];

export function listIntegrations(): Integration[] {
  return INTEGRATIONS.slice().sort((a, b) => a.vendor.localeCompare(b.vendor));
}

export function getIntegration(slug: string): Integration | null {
  return INTEGRATIONS.find((i) => i.slug === slug) ?? null;
}

export const INTEGRATION_CATEGORY_LABEL: Record<IntegrationCategory, string> = {
  comms: "Communication",
  automation: "Automation",
  bi: "Business intelligence",
  siem: "SIEM / SOC",
  crm: "CRM / Sales",
  dev: "Developer",
};
