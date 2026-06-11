/**
 * Newsroom Integrations — Slack and Microsoft Teams connectors.
 *
 * Delivers real-time alert digests and daily briefs to newsroom channels,
 * lowering the barrier for editorial teams to monitor the conflict map.
 *
 * Інтеграції зі Slack та Teams для доставки оповіщень у редакційні канали.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type NewsroomIntegration = "slack" | "teams";

// ── Slack ─────────────────────────────────────────────────────────────────────

export interface SlackAppConfig {
  /** Slack OAuth client ID. / Client ID додатку Slack. */
  clientId: string;
  /** OAuth scopes required by the app. / OAuth-скоупи. */
  scopes: string[];
  /** Redirect URI for OAuth callback. / URI для OAuth callback. */
  redirectUri: string;
  /** Supported Slack block-kit version. / Версія Slack Block Kit. */
  blockKitVersion: string;
  /** Default channel name if not configured. / Канал за замовчуванням. */
  defaultChannel: string;
}

/** Default Slack app configuration. */
export const SLACK_APP_CONFIG: Readonly<SlackAppConfig> = {
  clientId: process.env.SLACK_CLIENT_ID ?? "",
  scopes: [
    "incoming-webhook",
    "chat:write",
    "channels:read",
    "commands",
  ],
  redirectUri: "/api/v1/integrations/slack/callback",
  blockKitVersion: "v2",
  defaultChannel: "#osint-alerts",
};

// ── Teams ─────────────────────────────────────────────────────────────────────

export interface TeamsConnectorConfig {
  /** Azure AD application (client) ID. / ID додатку Azure AD. */
  appId: string;
  /** Azure tenant ID ("common" for multi-tenant). / ID тенанта Azure. */
  tenantId: string;
  /** OAuth redirect URI. / URI для OAuth. */
  redirectUri: string;
  /** Adaptive card schema version. / Версія Adaptive Card. */
  adaptiveCardVersion: string;
  /** Default channel display name. / Канал за замовчуванням. */
  defaultChannel: string;
}

/** Default Teams connector configuration. */
export const TEAMS_CONNECTOR_CONFIG: Readonly<TeamsConnectorConfig> = {
  appId: process.env.TEAMS_APP_ID ?? "",
  tenantId: "common",
  redirectUri: "/api/v1/integrations/teams/callback",
  adaptiveCardVersion: "1.5",
  defaultChannel: "OSINT Alerts",
};

// ── Workspace record ──────────────────────────────────────────────────────────

export interface NewsroomWorkspace {
  /** Internal workspace ID. / Внутрішній ID простору. */
  id: string;
  /** Integration platform. / Платформа інтеграції. */
  platform: NewsroomIntegration;
  /** Workspace / tenant name. / Назва воркспейсу. */
  workspaceName: string;
  /** Webhook or bot token (encrypted at rest). / Токен вебхуку або бота. */
  webhookToken: string;
  /** Target channel ID. / ID цільового каналу. */
  channelId: string;
  /** Whether daily briefs are enabled for this workspace. / Чи увімкнено щоденні брифінги. */
  dailyBriefEnabled: boolean;
  /** Minimum event confidence to trigger an alert (0–100). / Мінімальна впевненість для оповіщення. */
  alertConfidenceThreshold: number;
  /** Connected-by user ID. / ID підключившого користувача. */
  connectedBy: string;
  /** ISO-8601 connection timestamp. / Час підключення. */
  connectedAt: string;
}

// ── NewsroomIntegrationStore ──────────────────────────────────────────────────

export class NewsroomIntegrationStore {
  private readonly workspaces = new Map<string, NewsroomWorkspace>();

  /**
   * Register or update a newsroom workspace connection.
   *
   * Реєструє або оновлює з'єднання воркспейсу.
   */
  upsert(workspace: NewsroomWorkspace): void {
    this.workspaces.set(workspace.id, workspace);
  }

  /**
   * Retrieve a workspace by ID.
   *
   * Повертає воркспейс за ID.
   */
  get(id: string): NewsroomWorkspace | undefined {
    return this.workspaces.get(id);
  }

  /**
   * List all workspaces for a given platform.
   *
   * Повертає всі воркспейси для вказаної платформи.
   */
  listByPlatform(platform: NewsroomIntegration): NewsroomWorkspace[] {
    return Array.from(this.workspaces.values()).filter(
      (w) => w.platform === platform,
    );
  }

  /**
   * Remove a workspace connection.
   *
   * Видаляє з'єднання воркспейсу.
   */
  remove(id: string): boolean {
    return this.workspaces.delete(id);
  }

  /**
   * List workspaces with daily-brief delivery enabled.
   *
   * Повертає воркспейси з увімкненими щоденними брифінгами.
   */
  listBriefRecipients(): NewsroomWorkspace[] {
    return Array.from(this.workspaces.values()).filter(
      (w) => w.dailyBriefEnabled,
    );
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global newsroom integration store. */
export const newsroomIntegrationStore = new NewsroomIntegrationStore();
