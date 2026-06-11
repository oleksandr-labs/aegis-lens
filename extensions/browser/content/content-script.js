/**
 * Content script — runs on all pages.
 * Detects: coordinates, known source domains, page metadata.
 * Responds to messages from the service worker.
 */

const KNOWN_SOURCE_DOMAINS = [
  "t.me", "twitter.com", "x.com",
  "youtube.com", "reddit.com",
  "facebook.com", "instagram.com",
];

const COORD_PATTERNS = [
  // Decimal: 50.4522, 30.5234 or 50.4522°N 30.5234°E
  /(-?\d{1,3}\.\d{4,})\s*[°,]?\s*[NS]?\s*[,;]?\s*(-?\d{1,3}\.\d{4,})\s*[°,]?\s*[EW]?/g,
  // DMS: 50°27'8"N 30°31'24"E
  /(\d{1,3})°(\d{1,2})'(\d{1,2}(?:\.\d+)?)"([NS])\s+(\d{1,3})°(\d{1,2})'(\d{1,2}(?:\.\d+)?)"([EW])/g,
];

function parseDMS(deg, min, sec, dir) {
  let decimal = parseFloat(deg) + parseFloat(min) / 60 + parseFloat(sec) / 3600;
  if (dir === "S" || dir === "W") decimal = -decimal;
  return decimal;
}

function extractCoordinatesFromText(text) {
  for (const pattern of COORD_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match) {
      if (match.length === 3) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          return { lat, lon };
        }
      } else if (match.length === 9) {
        return {
          lat: parseDMS(match[1], match[2], match[3], match[4]),
          lon: parseDMS(match[5], match[6], match[7], match[8]),
        };
      }
    }
  }
  return null;
}

function getPageCoordinates() {
  // Check meta tags for coordinates
  const geoMeta = document.querySelector('meta[name="geo.position"]');
  if (geoMeta) {
    const [lat, lon] = geoMeta.getAttribute("content")?.split(";").map(parseFloat) ?? [];
    if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
  }

  // Check OpenGraph
  const ogLat = document.querySelector('meta[property="og:latitude"]')?.getAttribute("content");
  const ogLon = document.querySelector('meta[property="og:longitude"]')?.getAttribute("content");
  if (ogLat && ogLon) return { lat: parseFloat(ogLat), lon: parseFloat(ogLon) };

  // Check JSON-LD
  const jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd.textContent);
      const geo = data?.geo ?? data?.location?.geo;
      if (geo?.latitude && geo?.longitude) return { lat: geo.latitude, lon: geo.longitude };
    } catch {}
  }

  // Scan visible text for coordinates
  const bodyText = document.body.innerText?.slice(0, 5000) ?? "";
  return extractCoordinatesFromText(bodyText);
}

function getPageReputation() {
  const domain = window.location.hostname.replace(/^www\./, "");
  return {
    domain,
    isKnownSource: KNOWN_SOURCE_DOMAINS.includes(domain),
    url: window.location.href,
    title: document.title,
  };
}

// ── Message listener ─────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "GET_SELECTION":
      sendResponse({ text: window.getSelection()?.toString() ?? "" });
      break;

    case "GET_COORDINATES":
      sendResponse(getPageCoordinates());
      break;

    case "GET_PAGE_INFO":
      sendResponse({
        url: window.location.href,
        title: document.title,
        reputation: getPageReputation(),
        coords: getPageCoordinates(),
      });
      break;

    case "SHOW_BADGE":
      showSourceBadge(message.reputation);
      sendResponse({ ok: true });
      break;

    default:
      sendResponse({ error: `Unknown message: ${message.type}` });
  }
  return true;
});

// ── Source reputation badge ───────────────────────────────────────────────

function showSourceBadge(reputation) {
  const existing = document.getElementById("aegis-source-badge");
  if (existing) existing.remove();

  const badge = document.createElement("div");
  badge.id = "aegis-source-badge";
  badge.style.cssText = `
    position: fixed; bottom: 16px; right: 16px; z-index: 999999;
    background: #1e293b; color: white; padding: 8px 14px; border-radius: 8px;
    font-size: 13px; font-family: system-ui, sans-serif; max-width: 280px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor: pointer;
  `;

  const score = reputation?.reliabilityScore;
  const stars = score != null ? "★".repeat(Math.round(score * 5)) + "☆".repeat(5 - Math.round(score * 5)) : "?";
  badge.textContent = `🛡️ Aegis: ${reputation?.sourceName ?? "Unknown source"} ${stars}`;
  badge.title = "Click to view full source profile";
  badge.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_SOURCE_PROFILE", sourceId: reputation?.sourceId });
    badge.remove();
  });

  document.body.appendChild(badge);
  setTimeout(() => badge?.remove(), 8000);
}

// Auto-detect source reputation on page load
(async () => {
  const domain = window.location.hostname.replace(/^www\./, "");
  if (KNOWN_SOURCE_DOMAINS.includes(domain)) {
    try {
      const reputation = await chrome.runtime.sendMessage({ type: "GET_SOURCE_REPUTATION", payload: { domain } });
      if (reputation?.sourceId) showSourceBadge(reputation);
    } catch {}
  }
})();
