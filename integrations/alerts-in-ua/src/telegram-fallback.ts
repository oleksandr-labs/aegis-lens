/**
 * Fallback A (task 2): the official `air_alert_ua` Telegram bot.
 *
 * When the alerts.in.ua API is degraded/unreachable, the national air-raid
 * signal is still broadcast via the official @air_alert_ua bot/channel. We reuse
 * the read-only Telegram Bot API client from @ua-map/telegram (Bot API only — no
 * userbot / MTProto scraping, per ToS).
 *
 * The bot posts plain-language Ukrainian lines like:
 *   "🔴 Повітряна тривога в Харківській області" / "🟢 Відбій тривоги в ..."
 * We parse those into AlertRecords keyed to the shared OBLASTS registry.
 */

import type { AlertRecord, AlertLocation, OblastCode } from "./types";
import { OBLASTS } from "./types";
// Reuse the existing Bot API client (sibling integration package).
import {
  TelegramBotApiClient,
  type TelegramMessage,
} from "../../telegram/src/bot-api-client";

export const AIR_ALERT_BOT_CHANNEL = "air_alert_ua";

/** Map of oblast stems (locative/nominative) → ISO code for text parsing. */
const OBLAST_STEM_TO_CODE: Array<{ stem: string; code: OblastCode }> = (() => {
  const out: Array<{ stem: string; code: OblastCode }> = [];
  for (const info of Object.values(OBLASTS)) {
    // "Харківська" → match "Харків" prefix (covers Харківській/Харківська/Харківщина).
    const stem = info.nameUk.replace(/ська$/u, "").replace(/цька$/u, "ц");
    out.push({ stem, code: info.code });
  }
  out.push({ stem: "Київ", code: "UA-30" });
  return out;
})();

/** Detect raise/clear + oblast from a bot message body. */
export function parseBotMessage(text: string): {
  status: "active" | "all_clear";
  oblastCode: OblastCode;
} | null {
  const clear = /відбій|🟢|відбою/iu.test(text);
  const raise = /тривог|🔴|загроз/iu.test(text);
  if (!clear && !raise) return null;

  let best: OblastCode | null = null;
  for (const { stem, code } of OBLAST_STEM_TO_CODE) {
    if (text.includes(stem)) {
      best = code;
      break;
    }
  }
  if (!best) return null;
  return { status: clear ? "all_clear" : "active", oblastCode: best };
}

function botLocation(oblastCode: OblastCode): AlertLocation {
  const info = OBLASTS[oblastCode];
  return {
    locationUid: `tg:${oblastCode}`,
    kind: "oblast",
    oblastCode,
    nameUk: info?.nameUk ?? oblastCode,
    nameEn: info?.nameEn,
    center: info?.center,
  };
}

export interface TelegramFallbackConfig {
  /** Bot token from process.env.TELEGRAM_BOT_TOKEN. Omit ⇒ disabled (no fixture leak). */
  botToken?: string;
  channel?: string;
}

export class TelegramFallbackSource {
  private readonly client?: TelegramBotApiClient;
  private offset?: number;
  readonly channel: string;

  constructor(config: TelegramFallbackConfig = {}) {
    this.channel = config.channel ?? AIR_ALERT_BOT_CHANNEL;
    if (config.botToken) {
      this.client = new TelegramBotApiClient({ botToken: config.botToken });
    }
  }

  get enabled(): boolean {
    return !!this.client;
  }

  /** Pull recent bot posts and normalize air-raid raise/clear lines. */
  async poll(): Promise<AlertRecord[]> {
    if (!this.client) return [];
    const updates = await this.client.getUpdates(this.offset);
    const out: AlertRecord[] = [];

    for (const u of updates) {
      this.offset = u.update_id + 1;
      const msg: TelegramMessage | undefined = u.channel_post ?? u.message;
      const body = msg?.text ?? msg?.caption;
      if (!body || !msg) continue;

      const parsed = parseBotMessage(body);
      if (!parsed) continue;

      const observedAt = new Date((msg.date ?? Date.now() / 1000) * 1000).toISOString();
      out.push({
        alertId: `air_alert_ua_bot:${parsed.oblastCode}:air_raid`,
        source: "air_alert_ua_bot",
        location: botLocation(parsed.oblastCode),
        type: "air_raid",
        status: parsed.status,
        startedAt: observedAt,
        endedAt: parsed.status === "all_clear" ? observedAt : undefined,
        observedAt,
        text: { uk: body.slice(0, 200) },
        evidenceUrl: `https://t.me/${this.channel}/${msg.message_id}`,
      });
    }
    return out;
  }
}
