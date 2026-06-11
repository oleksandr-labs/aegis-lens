/**
 * Investigation evidence base — cite-able humanitarian evidence records.
 *
 * Investigations (e.g. attacks on health care, denial of humanitarian access,
 * forced displacement) need stable, attributable, PII-clean evidence. This module
 * turns humanitarian source records into immutable `EvidenceRecord`s with:
 *   - a content hash (integrity / dedup),
 *   - a full citation (publisher, license, permalink, captured-at),
 *   - a redaction attestation (proves the record passed the fail-closed PII gate).
 *
 * Records that FAIL redaction are never admitted to the evidence base; instead a
 * rejection is returned so the investigator knows the source could not be cleared.
 */

import type {
  HumanitarianLicense,
  ClusterReport,
  DtmDisplacementRecord,
  ReliefWebReport,
  HumanitarianCluster,
} from "./types";
import { redactRecord, type PiiFinding } from "./pii-redaction";

export type EvidenceKind = "displacement" | "cluster_report" | "situation_report" | "dataset";

export interface EvidenceCitation {
  publisher: string;
  license: HumanitarianLicense;
  url?: string;
  /** Attribution string to render under the evidence. */
  attribution: string;
  capturedAt: string;
}

export interface EvidenceRecord {
  evidenceId: string;
  kind: EvidenceKind;
  country: string;
  cluster?: HumanitarianCluster;
  /** Short, redacted human-readable claim (EN canonical). */
  claimEn: string;
  claimUk?: string;
  /** Deterministic content hash for integrity + dedup. */
  contentHash: string;
  citation: EvidenceCitation;
  /** Proof this passed the strict PII gate. */
  redaction: { passed: true; findingsCount: number; redactedAt: string };
  /** The redacted source payload (safe to store / export). */
  payload: unknown;
}

export interface EvidenceRejection {
  rejected: true;
  reason: string;
  findings: PiiFinding[];
}

export type EvidenceOutcome = EvidenceRecord | EvidenceRejection;

export function isRejection(o: EvidenceOutcome): o is EvidenceRejection {
  return (o as EvidenceRejection).rejected === true;
}

/** Small deterministic non-crypto hash (FNV-1a 32-bit) for integrity/dedup. */
function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function buildCitation(publisher: string, license: HumanitarianLicense, url: string | undefined, capturedAt: string): EvidenceCitation {
  const licenseLabel: Record<HumanitarianLicense, string> = {
    "cc-by": "CC BY 4.0",
    "cc-by-igo": "CC BY 3.0 IGO",
    "cc-by-sa": "CC BY-SA 4.0",
    "cc-by-nc": "CC BY-NC 4.0",
    "cc-zero": "CC0 1.0",
    "cc-by-nd": "CC BY-ND 4.0",
    "hdx-other": "HDX terms",
    "other-pd": "Public Domain",
    "other-closed": "Restricted",
    unknown: "License unspecified",
  };
  return {
    publisher,
    license,
    url,
    attribution: `Source: ${publisher} (${licenseLabel[license]})${url ? ` — ${url}` : ""}. Retrieved via UN OCHA/ReliefWeb/HDX.`,
    capturedAt,
  };
}

/**
 * Core admission gate: redact → on success build an EvidenceRecord, on failure
 * return an EvidenceRejection. Never throws on PII; fail-closed by rejection.
 */
function admit(opts: {
  source: unknown;
  kind: EvidenceKind;
  country: string;
  cluster?: HumanitarianCluster;
  claimEn: string;
  claimUk?: string;
  publisher: string;
  license: HumanitarianLicense;
  url?: string;
}): EvidenceOutcome {
  const r = redactRecord(opts.source);
  const capturedAt = new Date().toISOString();
  if (!r.ok || r.value == null) {
    return { rejected: true, reason: r.blockReason ?? "PII redaction failed closed", findings: r.findings };
  }
  const payload = r.value;
  const contentHash = fnv1a(JSON.stringify(payload));
  return {
    evidenceId: `ev-${opts.kind}-${contentHash}`,
    kind: opts.kind,
    country: opts.country,
    cluster: opts.cluster,
    claimEn: opts.claimEn,
    claimUk: opts.claimUk,
    contentHash,
    citation: buildCitation(opts.publisher, opts.license, opts.url, capturedAt),
    redaction: { passed: true, findingsCount: r.findings.length, redactedAt: capturedAt },
    payload,
  };
}

export function evidenceFromDtm(rec: DtmDisplacementRecord, license: HumanitarianLicense = "cc-by-igo"): EvidenceOutcome {
  return admit({
    source: rec,
    kind: "displacement",
    country: rec.country,
    claimEn: `${rec.individuals.toLocaleString("en")} IDPs (${rec.measure}) recorded in ${rec.admin1Name} (IOM DTM round ${rec.roundNumber ?? "?"}, ${rec.reportingDate}).`,
    claimUk: `${rec.individuals.toLocaleString("uk")} ВПО (${rec.measure}) у регіоні ${rec.admin1Name} (IOM DTM, раунд ${rec.roundNumber ?? "?"}, ${rec.reportingDate}).`,
    publisher: rec.source,
    license,
    url: rec.url,
  });
}

export function evidenceFromCluster(rep: ClusterReport, license: HumanitarianLicense = "cc-by"): EvidenceOutcome {
  return admit({
    source: rep,
    kind: "cluster_report",
    country: rep.country,
    cluster: rep.cluster,
    claimEn: rep.summary.en,
    claimUk: rep.summary.uk,
    publisher: rep.source,
    license,
    url: rep.url,
  });
}

export function evidenceFromReliefWeb(rep: ReliefWebReport, license: HumanitarianLicense = "cc-by"): EvidenceOutcome {
  return admit({
    source: rep,
    kind: "situation_report",
    country: rep.countries[0] ?? "UA",
    cluster: rep.cluster,
    claimEn: rep.title,
    publisher: rep.source.join(", ") || "ReliefWeb",
    license,
    url: rep.url,
  });
}

/** Build an evidence base from a mixed batch, partitioning admitted vs rejected. */
export function buildEvidenceBase(items: EvidenceOutcome[]): {
  admitted: EvidenceRecord[];
  rejected: EvidenceRejection[];
} {
  const admitted: EvidenceRecord[] = [];
  const rejected: EvidenceRejection[] = [];
  for (const it of items) {
    if (isRejection(it)) rejected.push(it);
    else admitted.push(it);
  }
  return { admitted, rejected };
}
