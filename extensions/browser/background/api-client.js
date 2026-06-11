/**
 * Aegis Lens API client for the browser extension.
 * Singleton pattern — reuses auth token from storage.
 */

import { getAccessToken } from "./auth.js";

const BASE_URL = "https://app.aegislens.com";

export class AegisExtensionAPI {
  static _instance = null;

  static async getInstance() {
    if (!AegisExtensionAPI._instance) {
      AegisExtensionAPI._instance = new AegisExtensionAPI();
    }
    return AegisExtensionAPI._instance;
  }

  async _fetch(path, options = {}) {
    const token = await getAccessToken();
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AegisExtension/0.1",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.detail ?? err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
  }

  async createEventDraft({ text, url, title, imageUrls = [] }) {
    return this._fetch("/api/events/draft", {
      method: "POST",
      body: JSON.stringify({ text, sourceUrl: url, pageTitle: title, imageUrls }),
    });
  }

  async reverseImageSearch(imageUrl) {
    return this._fetch("/api/verify/reverse-image-search", {
      method: "POST",
      body: JSON.stringify({ imageUrl }),
    });
  }

  async ingestUrl(url, title) {
    return this._fetch("/api/ingest/url", {
      method: "POST",
      body: JSON.stringify({ url, title }),
    });
  }

  async getSourceReputation(domain) {
    return this._fetch(`/api/sources/reputation?domain=${encodeURIComponent(domain)}`);
  }

  async detectCoordinates(text) {
    return this._fetch("/api/geo/detect-coordinates", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }
}
