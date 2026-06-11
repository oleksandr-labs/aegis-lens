/** Plugin type determines what hooks and surfaces are available. */
export type PluginType =
  | "data_layer"         // adds a map layer with its own data source
  | "widget"             // adds a dashboard widget
  | "ai_tool"            // extends copilot with a tool
  | "action"             // adds a command-palette action
  | "exporter"           // adds an export format
  | "notification_channel"; // adds a notification delivery channel

/** Scopes the plugin requests from the host. */
export type PluginScope =
  | "events:read"
  | "alerts:read"
  | "alerts:write"
  | "aois:read"
  | "cases:read"
  | "cases:write"
  | "user:read"
  | "webhooks:write";

export interface PluginManifest {
  /** Unique reverse-domain identifier, e.g. "com.acme.my-layer" */
  id: string;
  name: string;
  version: string; // semver
  description: string;
  type: PluginType;
  /** Scopes the plugin needs — shown to user during install consent. */
  scopes: PluginScope[];
  /** Icon URL — must be https, max 256px */
  iconUrl?: string;
  /** Homepage or docs URL */
  homepageUrl?: string;
  /** Support email */
  supportEmail?: string;
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  /** Min platform version required */
  minPlatformVersion?: string;
  /** Org-internal plugin (not published to marketplace) */
  private?: boolean;
}

// ----- Data Layer plugin -----

export interface DataLayerConfig {
  /** Map style layer ID */
  layerId: string;
  /** GeoJSON or MVT source URL */
  sourceUrl: string;
  /** Refresh interval in seconds (min 30) */
  refreshIntervalSeconds?: number;
  /** Mapbox / MapLibre style spec for this layer */
  style: Record<string, unknown>;
}

// ----- Widget plugin -----

export interface WidgetConfig {
  /** Default width in grid units */
  defaultWidth: number;
  /** Default height in grid units */
  defaultHeight: number;
  /** Content rendered in an iframe via postMessage */
  iframeUrl: string;
}

// ----- AI Tool plugin -----

export interface AiToolDefinition {
  name: string;
  description: string;
  /** JSON Schema for tool parameters */
  parameters: Record<string, unknown>;
  /** Endpoint the host calls when tool is invoked */
  callbackUrl: string;
}

// ----- Notification Channel plugin -----

export interface NotificationChannelConfig {
  channelId: string;
  displayName: string;
  /** Whether this channel supports rich content */
  supportsRichContent: boolean;
  /** Webhook URL the host POSTs to when a notification fires */
  webhookUrl: string;
  /** HMAC signing secret for verifying host requests */
  signingSecret?: string;
}

// ----- Plugin registration result -----

export interface InstalledPlugin {
  pluginId: string;
  orgId: string;
  installedAt: string;
  installedBy: string;
  manifest: PluginManifest;
  config?: DataLayerConfig | WidgetConfig | AiToolDefinition | NotificationChannelConfig;
  isEnabled: boolean;
}
