/**
 * IP address and ASN reputation checks.
 *
 * Datacenter / VPN ASNs are a strong signal that traffic is automated.
 * RFC1918 private IPs are never routable from the public internet and
 * indicate a mis-configured proxy or internal test — treat as neutral.
 */

import type { SpamSignal } from "./types";

// ── Known bad ASNs ────────────────────────────────────────────────────────────

/**
 * BGP Autonomous System Numbers commonly associated with datacenters, VPN
 * providers, and hosting infrastructure used by automated traffic.
 *
 * Sources: Spamhaus ASN-DROP, abuse.ch, community reports.
 */
export const BAD_ASN_LIST: number[] = [
  174,    // Cogent Communications
  701,    // MCI / Verizon Business (bulk sender abuse)
  3356,   // Level 3 / Lumen (abused transit)
  7922,   // Comcast (residential but heavily proxied)
  14061,  // DigitalOcean
  16276,  // OVHcloud
  20473,  // Choopa / Vultr
  24940,  // Hetzner Online
  36352,  // ColoCrossing
  46664,  // Proxied.io / VPN aggregator
  47583,  // Hostinger
  51167,  // Contabo
  55293,  // A2 Hosting
  63049,  // GoDaddy cloud
  63949,  // Akamai / Linode
  132203, // Tencent Cloud
  136907, // Huawei Cloud
  139070, // Alibaba Cloud (international)
  14618,  // Amazon AWS
  15169,  // Google Cloud
  16509,  // Amazon AWS (primary)
  19527,  // Google Cloud (secondary)
  8075,   // Microsoft Azure
  45102,  // Alibaba Cloud (Asia)
  396982, // Google Cloud (newer block)
];

// ── Private-IP ranges (RFC 1918 + loopback + APIPA) ──────────────────────────

/** CIDR blocks considered private / non-routable. */
const PRIVATE_RANGES: Array<{ prefix: number[]; bits: number }> = [
  { prefix: [10],                 bits: 8  }, // 10.0.0.0/8
  { prefix: [172, 16],            bits: 12 }, // 172.16.0.0/12
  { prefix: [192, 168],           bits: 16 }, // 192.168.0.0/16
  { prefix: [127],                bits: 8  }, // 127.0.0.0/8  loopback
  { prefix: [169, 254],           bits: 16 }, // 169.254.0.0/16 APIPA
  { prefix: [0],                  bits: 8  }, // 0.0.0.0/8
  { prefix: [100, 64],            bits: 10 }, // 100.64.0.0/10 CGNAT
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse a dotted-decimal IPv4 string into a 32-bit integer.
 * Returns null for malformed input or IPv6 addresses.
 */
function parseIpv4(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    const n = parseInt(part, 10);
    if (isNaN(n) || n < 0 || n > 255) return null;
    value = (value << 8) | n;
  }
  return value >>> 0; // ensure unsigned
}

/**
 * Returns `true` if the IP falls within an RFC1918 / loopback / CGNAT range.
 * IPv6 addresses always return `false` (not handled here).
 */
export function isPrivateIp(ip: string): boolean {
  const ipInt = parseIpv4(ip);
  if (ipInt === null) return false; // IPv6 or invalid — treat as public

  for (const { prefix, bits } of PRIVATE_RANGES) {
    let prefixInt = 0;
    for (const octet of prefix) prefixInt = (prefixInt << 8) | octet;
    // Shift to align prefix to the most-significant bits
    const shift = 32 - bits;
    prefixInt = (prefixInt << (shift - (prefix.length - 1) * 8)) >>> 0;
    const mask = bits === 32 ? 0xffffffff : ~((1 << (32 - bits)) - 1) >>> 0;
    if ((ipInt & mask) >>> 0 === (prefixInt & mask) >>> 0) return true;
  }
  return false;
}

/**
 * Returns `true` if the given ASN is on the known-bad list.
 */
export function isBadAsn(asn: number): boolean {
  return BAD_ASN_LIST.includes(asn);
}

// ── Main check ────────────────────────────────────────────────────────────────

/**
 * Evaluates IP + ASN reputation signals.
 *
 * Does NOT make external HTTP calls — all checks are local/in-process.
 * For production, augment with an async AbuseIPDB / IPInfo lookup.
 */
export function checkIpReputation(
  ipAddress: string,
  asnNumber?: number,
): { clean: boolean; signals: SpamSignal[] } {
  const signals: SpamSignal[] = [];

  if (asnNumber !== undefined && isBadAsn(asnNumber)) {
    signals.push("bad_asn");
  }

  // Private IPs from public requests indicate a proxy misconfiguration —
  // flag as bad rep rather than silently allowing.
  if (isPrivateIp(ipAddress)) {
    signals.push("bad_ip_rep");
  }

  return {
    clean: signals.length === 0,
    signals,
  };
}
