/**
 * OAuth 2.0 PKCE flow for the browser extension.
 * No client secret — PKCE ensures security without one.
 */

const CLIENT_ID = "aegis-extension-v1";
const REDIRECT_URI = chrome.identity.getRedirectURL("oauth");
const AUTH_ENDPOINT = "https://auth.aegislens.com/oauth/authorize";
const TOKEN_ENDPOINT = "https://auth.aegislens.com/oauth/token";
const SCOPES = "events:read events:write alerts:read alerts:write user:read";

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function handleOAuthCallback() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateCodeVerifier().slice(0, 16);

  await chrome.storage.local.set({ oauth_verifier: verifier, oauth_state: state });

  const authUrl = new URL(AUTH_ENDPOINT);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl.toString(), interactive: true },
      async (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
          return reject(new Error(chrome.runtime.lastError?.message ?? "Auth cancelled"));
        }
        try {
          const url = new URL(redirectUrl);
          const code = url.searchParams.get("code");
          const returnedState = url.searchParams.get("state");
          const stored = await chrome.storage.local.get(["oauth_verifier", "oauth_state"]);

          if (returnedState !== stored.oauth_state) {
            return reject(new Error("OAuth state mismatch"));
          }

          const tokenRes = await fetch(TOKEN_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code,
              redirect_uri: REDIRECT_URI,
              client_id: CLIENT_ID,
              code_verifier: stored.oauth_verifier,
            }),
          });

          const tokens = await tokenRes.json();
          if (tokens.error) return reject(new Error(tokens.error_description ?? tokens.error));

          const expiresAt = Date.now() + tokens.expires_in * 1000;
          await chrome.storage.local.set({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_expires_at: expiresAt,
          });

          resolve({ ok: true });
        } catch (err) {
          reject(err);
        }
      },
    );
  });
}

export async function refreshTokenIfNeeded() {
  const { access_token, refresh_token, token_expires_at } = await chrome.storage.local.get([
    "access_token", "refresh_token", "token_expires_at",
  ]);

  if (!access_token) return; // not authenticated
  if (token_expires_at && Date.now() < token_expires_at - 60_000) return; // still valid

  try {
    const res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token, client_id: CLIENT_ID }),
    });
    const tokens = await res.json();
    if (!tokens.error) {
      await chrome.storage.local.set({
        access_token: tokens.access_token,
        token_expires_at: Date.now() + tokens.expires_in * 1000,
      });
    }
  } catch {
    // Silent failure — user will be prompted to re-auth on next action
  }
}

export async function getAccessToken() {
  await refreshTokenIfNeeded();
  const { access_token } = await chrome.storage.local.get("access_token");
  return access_token;
}
