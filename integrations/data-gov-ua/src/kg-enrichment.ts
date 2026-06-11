/**
 * Knowledge-Graph enrichment with company / institution data (Task 8).
 *
 * Turn a resolved CompanyRecord (+ its procurement footprint + investigation
 * links) into a canonical RegistryEntity the KG / entity pages render. This is
 * the additive KG shape (mirrors oryx `kg-mapping.ts`: namespaced entityId +
 * slug + localized name + preserved sources), ready to adapt to the canonical KG
 * type when one lands.
 *
 * Classification: government/municipal buyers → "institution"; civic formations
 * → "ngo"; everything else → "company". The procurement footprint summarizes how
 * much the entity issues vs. wins; investigation links surface relevant
 * journalism. Provenance is preserved on `sources`.
 */

import type {
  CompanyRecord,
  RegistryEntity,
  KgEntityType,
  ProcurementTender,
  InvestigationLink,
  EconomicActivity,
} from "./types";

const INSTITUTION_RX =
  /(адміністрац|міністерств|рада|department|ministry|administration|державн|комунальн|municipal|council|agency|служба|управлінн)/i;
const NGO_RX = /(громадськ|організац|фонд|спілка|association|foundation|ngo|charity|благодійн)/i;

export function classifyEntityType(record: CompanyRecord): KgEntityType {
  const hay = `${record.name.uk ?? ""} ${record.name.en}`;
  if (INSTITUTION_RX.test(hay)) return "institution";
  if (NGO_RX.test(hay)) return "ngo";
  return "company";
}

function primaryActivity(record: CompanyRecord): EconomicActivity | undefined {
  return (record.activities ?? []).find((a) => a.primary) ?? record.activities?.[0];
}

/** Summarize the procurement footprint for an entity from its tenders. */
export function procurementFootprint(
  edrpou: string,
  tenders: ProcurementTender[],
): RegistryEntity["procurement"] {
  let asBuyer = 0;
  let asSupplier = 0;
  let totalAwarded = 0;
  for (const t of tenders) {
    if (t.buyerEdrpou === edrpou) asBuyer++;
    if (t.supplierEdrpou === edrpou) {
      asSupplier++;
      totalAwarded += t.amountUah ?? 0;
    }
  }
  if (!asBuyer && !asSupplier) return undefined;
  return { tendersAsBuyer: asBuyer, tendersAsSupplier: asSupplier, totalAwardedUah: totalAwarded };
}

export interface EnrichInput {
  record: CompanyRecord;
  tenders?: ProcurementTender[];
  investigationLinks?: InvestigationLink[];
}

/** Build a KG RegistryEntity from a resolved record + signals. */
export function enrichEntity(input: EnrichInput): RegistryEntity {
  const { record } = input;
  const tenders = input.tenders ?? [];
  const entityType = classifyEntityType(record);
  const activity = primaryActivity(record);
  const footprint = procurementFootprint(record.edrpou, tenders);

  const statusLabel = STATUS_LABELS[record.status];
  const typeLabel = TYPE_LABELS[entityType];

  return {
    entityId: `${entityType}:${record.edrpou}`,
    slug: `edrpou-${record.edrpou}`,
    entityType,
    edrpou: record.edrpou,
    name: record.name,
    status: record.status,
    address: record.address,
    primaryActivity: activity,
    procurement: footprint,
    investigationLinks: input.investigationLinks?.length ? input.investigationLinks : undefined,
    sources: record.sources,
    flaggedRisk: record.flaggedRisk,
    description: {
      en: buildDescription("en", typeLabel.en, record.name.en, statusLabel.en, activity, footprint, record.flaggedRisk),
      uk: buildDescription("uk", typeLabel.uk, record.name.uk ?? record.name.en, statusLabel.uk, activity, footprint, record.flaggedRisk),
    },
    updatedAt: record.updatedAt,
  };
}

const STATUS_LABELS: Record<CompanyRecord["status"], { en: string; uk: string }> = {
  active: { en: "active", uk: "активна" },
  terminating: { en: "terminating", uk: "у стані припинення" },
  terminated: { en: "terminated", uk: "припинено" },
  bankrupt: { en: "bankrupt", uk: "банкрутство" },
  suspended: { en: "suspended", uk: "призупинено" },
  unknown: { en: "status unknown", uk: "статус невідомий" },
};

const TYPE_LABELS: Record<KgEntityType, { en: string; uk: string }> = {
  company: { en: "Company", uk: "Компанія" },
  institution: { en: "Institution", uk: "Установа" },
  ngo: { en: "Civic organization", uk: "Громадська організація" },
};

function buildDescription(
  locale: "en" | "uk",
  typeLabel: string,
  name: string,
  statusLabel: string,
  activity: EconomicActivity | undefined,
  footprint: RegistryEntity["procurement"],
  risk?: boolean,
): string {
  const act = activity ? (locale === "en" ? activity.name.en : activity.name.uk ?? activity.name.en) : undefined;
  if (locale === "en") {
    const parts = [`${typeLabel} ${name} — ${statusLabel}`];
    if (act) parts.push(`primary activity: ${act}`);
    if (footprint) parts.push(`procurement: ${footprint.tendersAsBuyer} as buyer, ${footprint.tendersAsSupplier} as supplier (₴${footprint.totalAwardedUah.toLocaleString("en")} won)`);
    if (risk) parts.push("flagged in risk/verification checks");
    return parts.join("; ") + ".";
  }
  const parts = [`${typeLabel} «${name}» — ${statusLabel}`];
  if (act) parts.push(`основний вид діяльності: ${act}`);
  if (footprint) parts.push(`закупівлі: ${footprint.tendersAsBuyer} як замовник, ${footprint.tendersAsSupplier} як постачальник (₴${footprint.totalAwardedUah.toLocaleString("uk")} виграно)`);
  if (risk) parts.push("позначено у перевірках ризику/верифікації");
  return parts.join("; ") + ".";
}
