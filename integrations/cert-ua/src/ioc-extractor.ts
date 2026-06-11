/**
 * IOC (Indicator-of-Compromise) extraction from advisory text.
 *
 * CERT-UA / SSSCIP advisories embed IOCs inline in Ukrainian prose, frequently
 * "de-fanged" (e.g. "update-energo[.]com", "hxxp://...", "185.220.101[.]45") to
 * prevent accidental navigation. This module:
 *   - re-fangs de-fanged indicators,
 *   - extracts IPs (v4/v6), domains, URLs, hashes (md5/sha1/sha256), emails, CVEs,
 *   - de-duplicates and types each indicator.
 *
 * Only indicators that are actually PUBLISHED in the advisory are extracted —
 * nothing is inferred or fetched. See COMPLIANCE.md (publishing IOCs from public
 * CERT-UA advisories with attribution is permitted).
 */

import type { Ioc, IocType, CertAdvisory } from "./types";

/** Restore de-fanged indicators: [.] → ., hxxp → http, (dot) → . etc. */
export function refang(text: string): string {
  return text
    .replace(/\[\.\]/g, ".")
    .replace(/\(\.\)/g, ".")
    .replace(/\{\.\}/g, ".")
    .replace(/\s*\(dot\)\s*/gi, ".")
    .replace(/\s*\[dot\]\s*/gi, ".")
    .replace(/\[:\]/g, ":")
    .replace(/\bhxxps?:\/\//gi, (m) => (m.toLowerCase().startsWith("hxxps") ? "https://" : "http://"))
    .replace(/\[@\]/g, "@")
    .replace(/\s*\(at\)\s*/gi, "@");
}

const RE_IPV4 = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
const RE_IPV6 = /\b(?:[A-F0-9]{1,4}:){2,7}[A-F0-9]{1,4}\b/gi;
const RE_URL = /\bhttps?:\/\/[^\s"'<>)\]]+/gi;
const RE_DOMAIN = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}\b/gi;
const RE_MD5 = /\b[a-f0-9]{32}\b/gi;
const RE_SHA1 = /\b[a-f0-9]{40}\b/gi;
const RE_SHA256 = /\b[a-f0-9]{64}\b/gi;
const RE_EMAIL = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,24}\b/gi;
const RE_CVE = /\bCVE-\d{4}-\d{4,7}\b/gi;

const RE_IPV4_ANCHORED = /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;

// File-extension-looking tokens are NOT domains (e.g. "report.docx").
const FILE_EXT = /\.(exe|dll|doc|docx|xls|xlsx|pdf|zip|rar|js|vbs|ps1|lnk|hta|bat|scr|iso|7z|rtf|one)$/i;

export interface IocExtractionResult {
  iocs: Ioc[];
  byType: Record<IocType, number>;
}

export function extractIocs(rawText: string, advisoryId?: string): IocExtractionResult {
  const text = refang(rawText);
  const seen = new Set<string>();
  const iocs: Ioc[] = [];

  const push = (type: IocType, value: string) => {
    const v = type === "cve" ? value.toUpperCase() : value.toLowerCase();
    const key = `${type}:${v}`;
    if (seen.has(key)) return;
    seen.add(key);
    iocs.push({ type, value: v, advisoryId });
  };

  // Order matters: pull URLs/emails first, then strip them so their host parts
  // are not double-counted as bare domains. Hashes by descending length.
  for (const m of text.match(RE_URL) ?? []) push("url", m.replace(/[.,;]+$/, ""));
  for (const m of text.match(RE_EMAIL) ?? []) push("email", m);
  for (const m of text.match(RE_CVE) ?? []) push("cve", m);
  for (const m of text.match(RE_SHA256) ?? []) push("sha256", m);
  for (const m of text.match(RE_SHA1) ?? []) push("sha1", m);
  for (const m of text.match(RE_MD5) ?? []) push("md5", m);
  for (const m of text.match(RE_IPV4) ?? []) push("ipv4", m);
  for (const m of text.match(RE_IPV6) ?? []) {
    if (m.includes(":") && /[a-f]/i.test(m) === false && m.split(":").length < 3) continue;
    push("ipv6", m);
  }

  // Domains last; exclude ones already captured inside URLs/emails and file names.
  const urlHosts = new Set(iocs.filter((i) => i.type === "url" || i.type === "email").map((i) => hostOf(i.value)));
  for (const m of text.match(RE_DOMAIN) ?? []) {
    const d = m.toLowerCase();
    if (FILE_EXT.test(d)) continue;
    if (RE_IPV4_ANCHORED.test(d)) continue;
    if (urlHosts.has(d)) continue;
    push("domain", d);
  }

  const byType = {
    ipv4: 0, ipv6: 0, domain: 0, url: 0, md5: 0, sha1: 0, sha256: 0, email: 0, cve: 0,
  } as Record<IocType, number>;
  for (const i of iocs) byType[i.type]++;

  return { iocs, byType };
}

function hostOf(value: string): string {
  if (value.includes("@")) return value.split("@")[1] ?? "";
  const m = /^https?:\/\/([^/:]+)/i.exec(value);
  return (m ? m[1] : value).toLowerCase();
}

/** Enrich an advisory in-place with extracted IOCs (returns a new object). */
export function enrichAdvisoryWithIocs(adv: CertAdvisory): CertAdvisory {
  const { iocs } = extractIocs(adv.bodyText, adv.advisoryId);
  return { ...adv, iocs };
}
