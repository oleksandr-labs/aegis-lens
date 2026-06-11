/**
 * Host API — the interface a plugin can call via postMessage.
 *
 * Plugins run in a sandboxed iframe. They communicate with the host
 * exclusively through this message protocol.
 */

export type HostMessageType =
  | "aegis:ready"           // host → plugin: SDK ready
  | "aegis:context"         // host → plugin: org/user context
  | "aegis:events:result"   // host → plugin: events query response
  | "aegis:command:result"  // host → plugin: command response
  | "plugin:query:events"   // plugin → host: fetch events
  | "plugin:command"        // plugin → host: execute command
  | "plugin:resize"         // plugin → host: resize widget
  | "plugin:navigate"       // plugin → host: open URL in host shell
  | "plugin:notify";        // plugin → host: show notification

export interface HostMessage<T = unknown> {
  type: HostMessageType;
  requestId?: string;
  payload: T;
}

export interface AegisContext {
  orgId: string;
  userId: string;
  locale: string;
  tier: string;
  grantedScopes: string[];
}

export interface EventsQuery {
  class?: string[];
  region?: string;
  hours?: number;
  limit?: number;
}

export interface CommandPayload {
  command: string;
  args?: Record<string, unknown>;
}

/**
 * PluginBridge — helper class for plugins to communicate with the host.
 * Include this in plugin iframes; never use directly in the host.
 */
export class PluginBridge {
  private readonly handlers = new Map<string, (payload: unknown) => void>();
  private context: AegisContext | null = null;
  private readonly pendingRequests = new Map<string, (v: unknown) => void>();

  constructor() {
    window.addEventListener("message", this.handleMessage.bind(this));
    // Announce readiness
    this.send("aegis:ready", {});
  }

  private send(type: HostMessageType, payload: unknown, requestId?: string): void {
    window.parent.postMessage({ type, payload, requestId }, "*");
  }

  private handleMessage(event: MessageEvent): void {
    const msg = event.data as HostMessage;
    if (!msg?.type?.startsWith("aegis:")) return;

    if (msg.type === "aegis:context") {
      this.context = msg.payload as AegisContext;
      this.handlers.get("context")?.(this.context);
    }

    if (msg.requestId && this.pendingRequests.has(msg.requestId)) {
      this.pendingRequests.get(msg.requestId)!(msg.payload);
      this.pendingRequests.delete(msg.requestId);
    }
  }

  onContext(handler: (ctx: AegisContext) => void): void {
    this.handlers.set("context", handler);
    if (this.context) handler(this.context);
  }

  async queryEvents(query: EventsQuery): Promise<unknown[]> {
    const requestId = Math.random().toString(36).slice(2);
    return new Promise((resolve) => {
      this.pendingRequests.set(requestId, (v) => resolve(v as unknown[]));
      this.send("plugin:query:events", query, requestId);
    });
  }

  async executeCommand(command: string, args?: Record<string, unknown>): Promise<unknown> {
    const requestId = Math.random().toString(36).slice(2);
    return new Promise((resolve) => {
      this.pendingRequests.set(requestId, resolve);
      this.send("plugin:command", { command, args }, requestId);
    });
  }

  resize(width: number, height: number): void {
    this.send("plugin:resize", { width, height });
  }

  navigate(url: string): void {
    this.send("plugin:navigate", { url });
  }

  notify(title: string, body: string): void {
    this.send("plugin:notify", { title, body });
  }
}
