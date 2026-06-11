/**
 * Cluster map — pillar → child post hierarchy and internal-link targets
 * Ukrainian MAP / Aegis Lens — Topical Authority Strategy
 */

import type { ContentClusterId } from "../../content/types";

export const CLUSTER_HIERARCHY: Record<
  ContentClusterId,
  {
    pillarSlug: string;
    childTopics: string[];
    targetPostCount: number;
    internalLinkMinimum: number;
  }
> = {
  verification: {
    pillarSlug: "how-to-verify-photo-video",
    targetPostCount: 20,
    internalLinkMinimum: 4, // 1 to pillar + ≥3 siblings
    childTopics: [
      "reverse-image-search-techniques",
      "video-geolocation-verification",
      "exif-metadata-analysis",
      "google-street-view-cross-reference",
      "shadow-sun-angle-analysis",
      "deepfake-detection-tools",
      "social-media-timestamp-verification",
      "satellite-image-cross-check",
      "eyewitness-account-corroboration",
      "archiving-evidence-for-legal-use",
      "bellingcat-methodology-overview",
      "tineye-vs-google-lens-comparison",
      "manipulated-image-artefact-detection",
      "crowdsourced-verification-platforms",
      "video-stabilisation-for-analysis",
      "conflict-photo-provenance-chain",
      "disinformation-case-studies",
      "journalist-verification-workflows",
      "open-source-video-analysis-tools",
      "before-after-imagery-comparison",
    ],
  },
  geolocation: {
    pillarSlug: "geolocation-osint-complete-guide",
    targetPostCount: 20,
    internalLinkMinimum: 4,
    childTopics: [
      "terrain-matching-techniques",
      "road-sign-language-identification",
      "vegetation-zone-clues",
      "building-architecture-geolocating",
      "sun-position-geolocation",
      "wikimapia-and-openstreetmap-usage",
      "google-earth-timelapse-analysis",
      "ukraine-geolocation-landmarks",
      "middle-east-geolocation-case-study",
      "baltic-region-geolocation-guide",
      "geolocating-military-convoys",
      "night-imagery-geolocation",
      "drone-footage-geolocation",
      "mapillary-for-osint",
      "maxar-planet-imagery-access",
      "coordinate-transformation-tools",
      "crowdsourcing-geolocation-tasks",
      "geolocation-accuracy-confidence-levels",
      "live-flight-tracking-correlation",
      "rail-infrastructure-identification",
    ],
  },
  equipment_id: {
    pillarSlug: "satellite-imagery-analysis-explained",
    targetPostCount: 15,
    internalLinkMinimum: 4,
    childTopics: [
      "identifying-russian-military-vehicles",
      "tank-variant-recognition-guide",
      "aircraft-identification-from-imagery",
      "naval-vessel-classification",
      "artillery-system-identification",
      "drone-identification-guide",
      "radar-installation-recognition",
      "military-unit-insignia-database",
      "satellite-imagery-resolution-guide",
      "sar-synthetic-aperture-radar-basics",
      "commercial-satellite-providers-comparison",
      "equipment-loss-tracking-methodology",
      "open-source-military-equipment-databases",
      "camouflage-and-concealment-detection",
      "thermal-infrared-imagery-interpretation",
    ],
  },
  country_region: {
    pillarSlug: "conflict-monitoring-sources-methods",
    targetPostCount: 30,
    internalLinkMinimum: 4,
    childTopics: [
      "ukraine-conflict-osint-sources",
      "black-sea-maritime-monitoring",
      "donbas-frontline-tracking",
      "kherson-region-analysis",
      "zaporizhzhia-nuclear-plant-monitoring",
      "crimea-bridge-status-tracking",
      "odesa-port-activity",
      "belgorod-cross-border-incidents",
      "kursk-oblast-monitoring",
      "middle-east-osint-sources",
      "gaza-conflict-monitoring",
      "red-sea-maritime-incidents",
      "sahel-conflict-osint",
      "taiwan-strait-monitoring",
      "south-china-sea-territorial-disputes",
      "belarus-military-activity",
      "moldova-transnistria-situation",
      "armenia-azerbaijan-conflict-monitoring",
      "nato-eastern-flank-deployments",
      "russian-mobilisation-tracking",
      "wagner-group-africa-operations",
      "north-korea-military-osint",
      "iran-proxy-network-monitoring",
      "refugee-movement-tracking",
      "humanitarian-situation-indicators",
      "economic-sanctions-impact-analysis",
      "energy-infrastructure-monitoring",
      "cyber-incident-attribution-osint",
      "disinformation-campaigns-by-region",
      "un-peacekeeping-mission-monitoring",
    ],
  },
  methodology: {
    pillarSlug: "what-is-osint",
    targetPostCount: 25,
    internalLinkMinimum: 4,
    childTopics: [
      "osint-tools-directory",
      "structured-analytic-techniques",
      "analysis-of-competing-hypotheses",
      "key-assumptions-check",
      "red-team-methodology",
      "source-reliability-matrix",
      "intelligence-collection-planning",
      "osint-ethics-and-legal-framework",
      "operational-security-for-investigators",
      "sock-puppet-account-risks",
      "vpn-and-browser-isolation",
      "maltego-graph-analysis",
      "python-for-osint-automation",
      "telegram-channel-monitoring",
      "twitter-x-osint-techniques",
      "dark-web-osint-safely",
      "corporate-registry-research",
      "financial-flows-investigation",
      "network-analysis-visualisation",
      "ai-assisted-pattern-recognition",
      "report-writing-for-intelligence",
      "dissemination-and-briefing-formats",
      "osint-community-resources",
      "intelligence-cycle-explained",
      "cognitive-bias-in-analysis",
    ],
  },
};

/**
 * Returns the sub-topics from the cluster's `childTopics` list that are NOT
 * represented in `existingPostSlugs`.
 */
export function computeCoverageGap(
  cluster: ContentClusterId,
  existingPostSlugs: string[]
): string[] {
  const { childTopics } = CLUSTER_HIERARCHY[cluster];
  const slugSet = new Set(existingPostSlugs);
  return childTopics.filter((topic) => !slugSet.has(topic));
}

/**
 * Minimum internal-link targets per child post.
 * Rule: each child post must link to the cluster pillar and at least 3 sibling posts.
 */
export const INTERNAL_LINK_TARGET: Record<
  ContentClusterId,
  { minChildToPillar: number; minChildToSibling: number }
> = {
  verification: { minChildToPillar: 1, minChildToSibling: 3 },
  geolocation: { minChildToPillar: 1, minChildToSibling: 3 },
  equipment_id: { minChildToPillar: 1, minChildToSibling: 3 },
  country_region: { minChildToPillar: 1, minChildToSibling: 3 },
  methodology: { minChildToPillar: 1, minChildToSibling: 3 },
};
