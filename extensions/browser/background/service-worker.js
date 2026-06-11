/**
 * Aegis Lens browser extension — background service worker.
 * Manifest v3 compliant.
 *
 * Responsibilities:
 *   - OAuth PKCE authentication flow
 *   - Context menu registration
 *   - Message routing from content scripts → API
 *   - Local storage management
 */

import { AegisExtensionAPI } from "./api-client.js";
import { installContextMenus, handleContextMenuClick } from "./context-menus.js";
import { handleOAuthCallback, refreshTokenIfNeeded } from "./auth.js";

// ── Extension lifecycle ───────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  console.log("[aegis-ext] Installed, reason:", reason);
  await installContextMenus();
  if (reason === "install") {
    chrome.tabs.create({ url: "https://aegislens.com/extension/onboarding" });
  }
});

// ── Context menu clicks ────────────────────────────────────────────────────

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

// ── Keyboard commands ──────────────────────────────────────────────────────

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "capture-selection") {
    chrome.tabs.sendMessage(tab.id, { type: "GET_SELECTION" }, async (selection) => {
      if (selection?.text) {
        await sendToBackground({ type: "CREATE_DRAFT", payload: { text: selection.text, url: tab.url } });
      }
    });
  } else if (command === "open-map") {
    chrome.tabs.sendMessage(tab.id, { type: "GET_COORDINATES" }, async (coords) => {
      const url = coords
        ? `https://app.aegislens.com/map?lat=${coords.lat}&lon=${coords.lon}&zoom=12`
        : "https://app.aegislens.com/map";
      chrome.tabs.create({ url });
    });
  }
});

// ── Message router from content scripts ───────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch((err) => {
    console.error("[aegis-ext] Error handling message:", err);
    sendResponse({ error: err.message });
  });
  return true; // keep message channel open for async response
});

async function handleMessage(message, _sender) {
  await refreshTokenIfNeeded();
  const api = await AegisExtensionAPI.getInstance();

  switch (message.type) {
    case "CREATE_DRAFT": {
      return await api.createEventDraft(message.payload);
    }
    case "REVERSE_IMAGE_SEARCH": {
      return await api.reverseImageSearch(message.payload.imageUrl);
    }
    case "INGEST_URL": {
      return await api.ingestUrl(message.payload.url, message.payload.title);
    }
    case "GET_SOURCE_REPUTATION": {
      return await api.getSourceReputation(message.payload.domain);
    }
    case "GET_AUTH_STATE": {
      const token = await chrome.storage.local.get("access_token");
      return { authenticated: !!token.access_token };
    }
    case "OAUTH_START": {
      return await handleOAuthCallback();
    }
    case "DETECT_COORDINATES": {
      return await api.detectCoordinates(message.payload.text);
    }
    default:
      return { error: `Unknown message type: ${message.type}` };
  }
}

function sendToBackground(message) {
  return new Promise((resolve) => chrome.runtime.sendMessage(message, resolve));
}
