/**
 * Discord request signature verification using Ed25519.
 *
 * Discord requires every interaction endpoint to verify the X-Signature-Ed25519
 * and X-Signature-Timestamp headers using the app's public key.
 *
 * Uses the Web Crypto API (available in Node 18+ and edge runtimes).
 */

export async function verifyDiscordRequest(
  rawBody: string,
  signature: string,
  timestamp: string,
  publicKey: string,
): Promise<boolean> {
  try {
    const message = new TextEncoder().encode(timestamp + rawBody);
    const sigBytes = hexToBytes(signature);
    const keyBytes = hexToBytes(publicKey);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "Ed25519" },
      false,
      ["verify"],
    );

    return await crypto.subtle.verify("Ed25519", cryptoKey, sigBytes, message);
  } catch {
    return false;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}
