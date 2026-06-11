/**
 * Playwright E2E configuration — golden user journeys and browser projects.
 */

export interface E2eJourney {
  id: string;
  persona: string;
  title_en: string;
  steps_en: string[];
  assertions_en: string[];
  priority: "P0" | "P1" | "P2";
}

export const E2E_JOURNEYS: E2eJourney[] = [
  {
    id: "free-view-live-map",
    persona: "free-user",
    title_en: "Free user views live map",
    steps_en: [
      "Navigate to homepage",
      "Click 'Open Map'",
      "Wait for map tiles to load",
      "Pan to Ukraine region",
    ],
    assertions_en: [
      "Map canvas is visible",
      "At least one event marker is rendered",
      "Legend panel is visible",
      "No authentication gate shown",
    ],
    priority: "P0",
  },
  {
    id: "analyst-saves-filter",
    persona: "analyst",
    title_en: "Analyst saves a custom filter preset",
    steps_en: [
      "Sign in as analyst",
      "Open filter panel",
      "Select event types and date range",
      "Click 'Save Filter'",
      "Enter preset name and confirm",
    ],
    assertions_en: [
      "Success toast is displayed",
      "Saved preset appears in preset list",
      "Preset is persisted after page reload",
    ],
    priority: "P0",
  },
  {
    id: "pro-download-csv",
    persona: "pro-user",
    title_en: "Pro user downloads filtered event CSV",
    steps_en: [
      "Sign in as Pro user",
      "Apply region and date filter",
      "Click 'Export' → 'CSV'",
      "Confirm download dialog",
    ],
    assertions_en: [
      "CSV file download initiates",
      "Downloaded file contains correct headers",
      "Row count matches displayed event count",
    ],
    priority: "P0",
  },
  {
    id: "user-creates-alert",
    persona: "registered-user",
    title_en: "User creates a region alert",
    steps_en: [
      "Sign in",
      "Navigate to Alerts page",
      "Click 'New Alert'",
      "Draw region on map",
      "Set severity threshold and notification channel",
      "Save alert",
    ],
    assertions_en: [
      "Alert appears in alert list",
      "Alert details match configured parameters",
      "Confirmation email sent (checked via stub)",
    ],
    priority: "P0",
  },
  {
    id: "upgrade-prompt-checkout",
    persona: "free-user",
    title_en: "Upgrade prompt leads to Stripe checkout",
    steps_en: [
      "Sign in as free user",
      "Trigger Pro feature gate (e.g. CSV export)",
      "Click 'Upgrade to Pro'",
      "Select monthly plan",
      "Click 'Continue to Payment'",
    ],
    assertions_en: [
      "Upgrade modal appears with correct plan details",
      "Stripe checkout page loads in new tab",
      "Plan pricing matches pricing page",
    ],
    priority: "P1",
  },
  {
    id: "api-key-generation",
    persona: "developer",
    title_en: "Developer generates an API key",
    steps_en: [
      "Sign in as developer",
      "Navigate to Settings → API",
      "Click 'Generate Key'",
      "Copy key to clipboard",
    ],
    assertions_en: [
      "API key is displayed in masked format",
      "Copy action succeeds",
      "Key appears in key list",
      "Key can be revoked",
    ],
    priority: "P1",
  },
  {
    id: "ai-copilot-query",
    persona: "analyst",
    title_en: "Analyst queries AI copilot",
    steps_en: [
      "Sign in as analyst",
      "Open Copilot panel",
      "Type a natural-language query about recent events",
      "Submit query",
      "Wait for response",
    ],
    assertions_en: [
      "Response is returned within 10 seconds",
      "Response contains at least one cited event",
      "Source citations are clickable and link to event detail",
      "Turn-end notification sound plays (if sound enabled)",
    ],
    priority: "P1",
  },
  {
    id: "share-embed-code",
    persona: "journalist",
    title_en: "Journalist copies embed code for region view",
    steps_en: [
      "Sign in as journalist",
      "Navigate to a region view",
      "Click 'Share' → 'Embed'",
      "Copy embed snippet",
    ],
    assertions_en: [
      "Embed code dialog is displayed",
      "Embed snippet contains valid iframe HTML",
      "Copy action succeeds",
      "Preview iframe renders map correctly",
    ],
    priority: "P2",
  },
];

export const PLAYWRIGHT_PROJECTS: {
  name: string;
  browser: "chromium" | "firefox" | "webkit";
  viewport: string;
  isDefault: boolean;
}[] = [
  {
    name: "Desktop Chrome",
    browser: "chromium",
    viewport: "1280x800",
    isDefault: true,
  },
  {
    name: "Desktop Firefox",
    browser: "firefox",
    viewport: "1280x800",
    isDefault: false,
  },
  {
    name: "Desktop Safari",
    browser: "webkit",
    viewport: "1280x800",
    isDefault: false,
  },
  {
    name: "Mobile Chrome",
    browser: "chromium",
    viewport: "390x844",
    isDefault: false,
  },
  {
    name: "Mobile Safari",
    browser: "webkit",
    viewport: "390x844",
    isDefault: false,
  },
];
