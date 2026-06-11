// Phase 3 codeable contract — not production

/**
 * Multimodal Copilot — typed contract + Anthropic message builder stub
 *
 * Phase 3 codeable contract — not production.
 *
 * Gated behind MULTIMODAL_FEATURE_FLAG = false.
 * When the flag is enabled, `buildMultimodalMessages` converts
 * `MultimodalMessage[]` into the Anthropic Messages API format
 * (model: claude-*) that supports interleaved text + base64 images.
 *
 * Map-snapshot support: captures a visible map extent + layer selection so the
 * copilot can reason about what the analyst is currently viewing.
 */

// ── Feature flag ──────────────────────────────────────────────────────────────

/** Set to true when Phase 3 multimodal model integration is production-ready. */
export const MULTIMODAL_FEATURE_FLAG = false;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MultimodalMessage {
  role: "user" | "assistant";
  /** Plain-text message content. */
  text?: string;
  /** Publicly accessible image URL (https). */
  imageUrl?: string;
  /**
   * Reference to the current map viewport the analyst is viewing.
   * Encoded as a bounding box [west, south, east, north] in WGS84 degrees
   * plus the active layer IDs.
   */
  mapSnapshot?: {
    bbox: [number, number, number, number];
    layerIds: string[];
  };
}

export interface MultimodalCopilotConfig {
  /** Whether image inputs are accepted this session. */
  enableImageInput: boolean;
  /** Whether map snapshots are accepted this session. */
  enableMapSnapshots: boolean;
  /** Maximum number of images allowed per turn. */
  maxImagesPerTurn: number;
  /** Billing/capability tier string, e.g. "pro" | "enterprise". */
  tier: string;
}

// ── Anthropic message builder ─────────────────────────────────────────────────

/**
 * Converts `MultimodalMessage[]` into the Anthropic Messages API
 * `messages` array format (with image_url content blocks).
 *
 * This is a stub: image_url blocks are included as-is; base64 encoding and
 * map snapshot rendering are deferred to the production implementation.
 *
 * @see https://docs.anthropic.com/en/api/messages
 */
export function buildMultimodalMessages(messages: MultimodalMessage[]): unknown[] {
  return messages.map((msg) => {
    const content: unknown[] = [];

    if (msg.text) {
      content.push({ type: "text", text: msg.text });
    }

    if (msg.imageUrl) {
      // Production: fetch URL, convert to base64, use image content block.
      // Stub: pass image_url directly (not valid in Anthropic API — placeholder only).
      content.push({
        type: "image",
        source: {
          type: "url",
          url: msg.imageUrl,
        },
      });
    }

    if (msg.mapSnapshot) {
      const { bbox, layerIds } = msg.mapSnapshot;
      content.push({
        type: "text",
        text:
          `[Map context — viewport bbox: ${bbox.map((v) => v.toFixed(4)).join(", ")}; ` +
          `active layers: ${layerIds.join(", ")}]`,
      });
    }

    // If no content blocks were added (empty message), use empty text
    if (content.length === 0) {
      content.push({ type: "text", text: "" });
    }

    return {
      role: msg.role,
      content: content.length === 1 && (content[0] as { type: string }).type === "text"
        ? (content[0] as { text: string }).text   // simple string form
        : content,                                  // array form for multimodal
    };
  });
}
