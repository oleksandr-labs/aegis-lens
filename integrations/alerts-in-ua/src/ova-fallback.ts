/**
 * Fallback B (task 3): regional OVA (Oblast Military Administration) Telegram
 * channels, one per oblast.
 *
 * If BOTH the alerts.in.ua API and the national @air_alert_ua bot are degraded,
 * the authoritative regional signal is the OVA's own official channel (e.g.
 * @kharkivoda, @synehubov). Each oblast has a registered channel here. We reuse
 * the same read-only Bot API client (no userbot), parse raise/clear lines with
 * the bot parser, and force the oblast (we already know which channel posted).
 *
 * The channel usernames below are the publicly-known official OVA channels; the
 * registry is data, easy to correct without code changes.
 */

import type { AlertRecord, AlertLocation, OblastCode } from "./types";
import { OBLASTS } from "./types";
import { parseBotMessage } from "./telegram-fallback";
import {
  TelegramBotApiClient,
  type TelegramMessage,
} from "../../telegram/src/bot-api-client";

/** ISO oblast code → official OVA Telegram channel username (best-known). */
export const OVA_CHANNELS: Partial<Record<OblastCode, string>> = {
  "UA-63": "synegubov",       // Kharkiv OVA
  "UA-12": "dnipropetrovskaODA", // Dnipropetrovsk OVA
  "UA-23": "zoda_gov_ua",     // Zaporizhzhia OVA
  "UA-65": "khersonskaODA",   // Kherson OVA
  "UA-51": "odeskaODA",       // Odesa OVA
  "UA-48": "mykolaivskaODA",  // Mykolaiv OVA
  "UA-14": "donoda_official", // Donetsk OVA
  "UA-09": "luhanskaVTSA",    // Luhansk MVA
  "UA-59": "Sumska_oda",      // Sumy OVA
  "UA-74": "chernihivskaODA", // Chernihiv OVA
  "UA-53": "poltavskaODA",    // Poltava OVA
  "UA-30": "kyivcity_official", // Kyiv city
  "UA-32": "kyivobladmin",    // Kyiv oblast
  "UA-46": "lvivoda",         // Lviv OVA
};

function ovaLocation(oblastCode: OblastCode): AlertLocation {
  const info = OBLASTS[oblastCode];
  return {
    locationUid: `ova:${oblastCode}`,
    kind: "oblast",
    oblastCode,
    nameUk: info?.nameUk ?? oblastCode,
    nameEn: info?.nameEn,
    center: info?.center,
  };
}

export interface OvaFallbackConfig {
  botToken?: string;
  /** Restrict polling to a subset of oblasts (default: all in OVA_CHANNELS). */
  oblasts?: OblastCode[];
}

export class OvaFallbackSource {
  private readonly client?: TelegramBotApiClient;
  private readonly oblasts: OblastCode[];

  constructor(config: OvaFallbackConfig = {}) {
    if (config.botToken) {
      this.client = new TelegramBotApiClient({ botToken: config.botToken });
    }
    this.oblasts = config.oblasts ?? (Object.keys(OVA_CHANNELS) as OblastCode[]);
  }

  get enabled(): boolean {
    return !!this.client;
  }

  /** Channels we will poll, paired with their oblast. */
  channels(): Array<{ oblastCode: OblastCode; channel: string }> {
    return this.oblasts
      .map((oblastCode) => ({ oblastCode, channel: OVA_CHANNELS[oblastCode] }))
      .filter((x): x is { oblastCode: OblastCode; channel: string } => !!x.channel);
  }

  /** Poll each configured OVA channel for recent raise/clear posts. */
  async poll(): Promise<AlertRecord[]> {
    if (!this.client) return [];
    const out: AlertRecord[] = [];

    for (const { oblastCode, channel } of this.channels()) {
      let msgs: TelegramMessage[] = [];
      try {
        msgs = await this.client.getChannelHistory(channel, 10);
      } catch {
        continue; // a single channel outage must not break the failover loop
      }

      for (const msg of msgs) {
        const body = msg.text ?? msg.caption;
        if (!body) continue;
        const parsed = parseBotMessage(body);
        // OVA channel ⇒ oblast is known; only need the raise/clear verb.
        if (!parsed) continue;

        const observedAt = new Date((msg.date ?? Date.now() / 1000) * 1000).toISOString();
        out.push({
          alertId: `ova_telegram:${oblastCode}:air_raid`,
          source: "ova_telegram",
          location: ovaLocation(oblastCode),
          type: "air_raid",
          status: parsed.status,
          startedAt: observedAt,
          endedAt: parsed.status === "all_clear" ? observedAt : undefined,
          observedAt,
          text: { uk: body.slice(0, 200) },
          evidenceUrl: `https://t.me/${channel}/${msg.message_id}`,
        });
      }
    }
    return out;
  }
}
