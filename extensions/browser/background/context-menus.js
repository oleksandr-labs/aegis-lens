/**
 * Context menu definitions and click handlers.
 */

export async function installContextMenus() {
  chrome.contextMenus.removeAll();

  // Image right-click menu
  chrome.contextMenus.create({
    id: "aegis-reverse-image",
    title: "🔍 Reverse image search (Aegis Lens)",
    contexts: ["image"],
  });

  // Link right-click menu
  chrome.contextMenus.create({
    id: "aegis-ingest-url",
    title: "📥 Save URL to Aegis Lens",
    contexts: ["link"],
  });

  // Selection right-click menu
  chrome.contextMenus.create({
    id: "aegis-capture-text",
    title: "✍️ Capture selection as event draft",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "aegis-translate-selection",
    title: "🌐 Translate + summarize selection",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "aegis-detect-coords",
    title: "📍 Detect coordinates in selection",
    contexts: ["selection"],
  });

  // Page-level
  chrome.contextMenus.create({
    id: "aegis-separator",
    type: "separator",
    contexts: ["page", "selection"],
  });

  chrome.contextMenus.create({
    id: "aegis-open-map",
    title: "🗺️ Open page location on map",
    contexts: ["page"],
  });
}

export async function handleContextMenuClick(info, tab) {
  const sendMsg = (type, payload) =>
    chrome.runtime.sendMessage({ type, payload }).catch(console.error);

  switch (info.menuItemId) {
    case "aegis-reverse-image":
      if (info.srcUrl) {
        await sendMsg("REVERSE_IMAGE_SEARCH", { imageUrl: info.srcUrl });
        chrome.tabs.create({ url: "https://app.aegislens.com/verify/image?ref=" + encodeURIComponent(info.srcUrl) });
      }
      break;

    case "aegis-ingest-url":
      if (info.linkUrl) {
        await sendMsg("INGEST_URL", { url: info.linkUrl, title: info.selectionText });
        chrome.notifications.create({
          type: "basic",
          iconUrl: "../icons/icon-48.png",
          title: "Aegis Lens",
          message: "URL queued for ingest. Check your event drafts.",
        });
      }
      break;

    case "aegis-capture-text":
      if (info.selectionText) {
        const result = await sendMsg("CREATE_DRAFT", { text: info.selectionText, url: tab.url, title: tab.title });
        chrome.tabs.create({ url: `https://app.aegislens.com/events/draft/${result?.draftId ?? "new"}` });
      }
      break;

    case "aegis-translate-selection":
      if (info.selectionText) {
        const encoded = encodeURIComponent(info.selectionText);
        chrome.tabs.create({ url: `https://app.aegislens.com/translate?text=${encoded}` });
      }
      break;

    case "aegis-detect-coords":
      if (info.selectionText) {
        const coords = await sendMsg("DETECT_COORDINATES", { text: info.selectionText });
        if (coords?.lat && coords?.lon) {
          chrome.tabs.create({ url: `https://app.aegislens.com/map?lat=${coords.lat}&lon=${coords.lon}&zoom=14` });
        } else {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "../icons/icon-48.png",
            title: "Aegis Lens — No Coordinates Found",
            message: "No coordinates detected in the selected text.",
          });
        }
      }
      break;

    case "aegis-open-map":
      chrome.tabs.sendMessage(tab.id, { type: "GET_COORDINATES" }, (coords) => {
        const url = coords?.lat
          ? `https://app.aegislens.com/map?lat=${coords.lat}&lon=${coords.lon}&zoom=12`
          : "https://app.aegislens.com/map";
        chrome.tabs.create({ url });
      });
      break;
  }
}
