/**
 * Copilot guardrails — refuse harmful queries before they reach the LLM.
 *
 * Policy: copilot must never assist with:
 *   - Doxxing or identifying private individuals
 *   - Real-time targeting or tactical targeting uplift
 *   - PII enrichment or aggregation
 *   - Weapons construction or acquisition
 *   - Coordinated information operations
 *   - Surveillance of private individuals
 *
 * Implementation: keyword + pattern heuristics + confidence score.
 * This is defense-in-depth — the LLM also has a system-level guardrail.
 */

export type GuardrailCategory =
  | "doxxing"
  | "targeting"
  | "pii_enrichment"
  | "weapons"
  | "info_ops"
  | "surveillance"
  | "tactical_uplift";

export interface GuardrailResult {
  blocked: boolean;
  category?: GuardrailCategory;
  confidence: number; // 0–1
  reason?: string;
  /** Safe refusal message in English */
  refusalEn?: string;
  /** Safe refusal message in Ukrainian */
  refusalUk?: string;
}

interface GuardrailRule {
  category: GuardrailCategory;
  patterns: RegExp[];
  threshold: number; // fraction of patterns that must match
  refusalEn: string;
  refusalUk: string;
}

const RULES: GuardrailRule[] = [
  {
    category: "doxxing",
    patterns: [
      /\b(find|locate|identify|dox|expose)\b.*\b(address|phone|email|home|family|relative)\b/i,
      /\bwhere (does|did) .* live\b/i,
      /\bpersonal (information|data|details)\b.*\b(soldier|civilian|person|individual)\b/i,
      /\b(full name|real name|identity)\b.*\b(find|reveal|expose)\b/i,
    ],
    threshold: 0.5,
    refusalEn: "I can't help identify or locate private individuals. This platform provides aggregate conflict intelligence, not personal data about specific people.",
    refusalUk: "Я не можу допомогти ідентифікувати або знайти приватних осіб. Ця платформа надає агреговані дані про конфлікт, а не особисті дані про конкретних людей.",
  },
  {
    category: "targeting",
    patterns: [
      /\b(strike|attack|hit|destroy|kill|target)\b.*\b(location|coordinate|grid|position)\b/i,
      /\b(gps|coordinate|lat|lon|latitude|longitude)\b.*\b(target|weapon|strike|attack)\b/i,
      /\breal.?time\b.*\b(position|location|movement)\b.*\b(unit|soldier|troop|vehicle)\b/i,
      /\bbest (time|route|approach|angle)\b.*\b(attack|strike|ambush)\b/i,
    ],
    threshold: 0.5,
    refusalEn: "I can't provide targeting assistance. This platform doesn't support real-time operational targeting.",
    refusalUk: "Я не можу надати допомогу у цілевказанні. Платформа не підтримує оперативне цілевказання в реальному часі.",
  },
  {
    category: "weapons",
    patterns: [
      /\b(make|build|construct|assemble|acquire|buy)\b.*\b(bomb|explosive|weapon|missile|drone bomb|IED)\b/i,
      /\b(weapon|explosive|detonator)\b.*\b(instructions|guide|how to|recipe|formula)\b/i,
      /\b(smuggle|traffic|purchase|obtain)\b.*\b(weapon|gun|rifle|ammo|ammunition)\b/i,
    ],
    threshold: 0.5,
    refusalEn: "I can't help with weapons acquisition or construction.",
    refusalUk: "Я не можу допомогти з придбанням або виготовленням зброї.",
  },
  {
    category: "pii_enrichment",
    patterns: [
      /\b(list|find|get|retrieve)\b.*\b(phone number|email|address|ssn|passport|id number)\b/i,
      /\b(enrich|aggregate|cross-reference)\b.*\b(personal|private|individual)\b.*\b(data|information|record)\b/i,
      /\bwho (is|are)\b.*\b(their (phone|email|address|id))\b/i,
    ],
    threshold: 0.5,
    refusalEn: "I can't retrieve or enrich personal information about individuals.",
    refusalUk: "Я не можу отримувати або збагачувати персональну інформацію про осіб.",
  },
  {
    category: "info_ops",
    patterns: [
      /\b(create|write|generate|produce)\b.*\b(propaganda|disinformation|fake news|false report)\b/i,
      /\b(amplify|boost|spread|viral)\b.*\b(narrative|story|report)\b.*\b(fake|false|fabricat)\b/i,
      /\b(coordinate|orchestrate|astroturf)\b.*\b(campaign|account|post)\b/i,
    ],
    threshold: 0.5,
    refusalEn: "I can't assist with information operations, propaganda, or coordinated inauthentic behavior.",
    refusalUk: "Я не можу допомогти з інформаційними операціями, пропагандою або скоординованою неавтентичною поведінкою.",
  },
  {
    category: "surveillance",
    patterns: [
      /\b(track|monitor|surveil|watch|follow)\b.*\b(individual|person|civilian|journalist|activist)\b/i,
      /\b(who visited|who attended|who was at)\b/i,
      /\b(movement pattern|daily routine|location history)\b.*\b(person|individual|user)\b/i,
    ],
    threshold: 0.5,
    refusalEn: "I can't help surveil or monitor private individuals, activists, or journalists.",
    refusalUk: "Я не можу допомогти стежити за приватними особами, активістами або журналістами.",
  },
  {
    category: "tactical_uplift",
    patterns: [
      /\b(current|live|real.?time)\b.*\b(position|location|movement)\b.*\b(troop|unit|force|vehicle|convoy)\b/i,
      /\b(where|location)\b.*\b(troops|soldiers|military unit|battalion)\b.*\b(now|currently|today)\b/i,
      /\boperational\b.*\b(detail|plan|route|timetable)\b/i,
    ],
    threshold: 0.5,
    refusalEn: "I don't provide real-time tactical military intelligence. Verified historical and aggregate data is available through the platform's map and search features.",
    refusalUk: "Я не надаю тактичну військову розвідку в реальному часі. Верифіковані історичні та агреговані дані доступні через карту та пошук платформи.",
  },
];

/**
 * Evaluate a user query against all guardrail rules.
 * Returns the first (highest-confidence) block, or a non-blocked result.
 */
export function evaluateGuardrails(query: string): GuardrailResult {
  let bestBlock: GuardrailResult | null = null;

  for (const rule of RULES) {
    const matched = rule.patterns.filter((p) => p.test(query)).length;
    const confidence = matched / rule.patterns.length;

    if (confidence >= rule.threshold) {
      if (!bestBlock || confidence > bestBlock.confidence) {
        bestBlock = {
          blocked: true,
          category: rule.category,
          confidence,
          reason: `Query matches ${rule.category} guardrail`,
          refusalEn: rule.refusalEn,
          refusalUk: rule.refusalUk,
        };
      }
    }
  }

  return bestBlock ?? { blocked: false, confidence: 0 };
}

/**
 * Quick boolean check — use evaluateGuardrails() for full detail.
 */
export function isBlocked(query: string): boolean {
  return evaluateGuardrails(query).blocked;
}
