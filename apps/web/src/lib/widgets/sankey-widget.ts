/**
 * Sankey / flow widget — data model and skeleton builder for flow diagrams.
 * Віджет Sankey / потокова діаграма — модель даних і будівник скелету для діаграм потоків.
 *
 * NOTE (EN): Nodes represent entities; links represent flows between them with a numeric value (volume/weight).
 * NOTE (UK): Вузли представляють сутності; зв'язки представляють потоки між ними з числовим значенням (обсяг/вага).
 *
 * NOTE (EN): Use cases include arms flows, supply chains, financial transfers, information flows, entity relationships.
 * NOTE (UK): Варіанти використання: потоки зброї, ланцюги постачання, фінансові перекази, інформаційні потоки, зв'язки сутностей.
 *
 * NOTE (EN): buildSankeyFromEvents is a skeleton — replace with domain-specific aggregation logic.
 * NOTE (UK): buildSankeyFromEvents — скелет; замінити доменною логікою агрегації.
 */

// ---------------------------------------------------------------------------
// SankeyNode
// ---------------------------------------------------------------------------

export interface SankeyNode {
  id: string;
  label: string;
  labelUk: string;
  category: string;
  value: number;
}

// ---------------------------------------------------------------------------
// SankeyLink
// ---------------------------------------------------------------------------

export interface SankeyLink {
  sourceId: string;
  targetId: string;
  value: number;
  label?: string;
}

// ---------------------------------------------------------------------------
// SankeyWidgetData
// ---------------------------------------------------------------------------

export interface SankeyWidgetData {
  nodes: SankeyNode[];
  links: SankeyLink[];
  title: string;
  titleUk: string;
}

// ---------------------------------------------------------------------------
// USE_CASES
// ---------------------------------------------------------------------------

export const USE_CASES_EN: string[] = [
  "Arms flows",
  "Supply chain",
  "Financial flows",
  "Information flows",
  "Entity relationships",
];

export const USE_CASES_UK: string[] = [
  "Потоки зброї",
  "Ланцюг постачання",
  "Фінансові потоки",
  "Інформаційні потоки",
  "Зв'язки сутностей",
];

// ---------------------------------------------------------------------------
// buildSankeyFromEvents
// ---------------------------------------------------------------------------

/**
 * Build a skeleton SankeyWidgetData from a list of raw events.
 * Replace the aggregation logic with domain-specific extraction.
 *
 * Будує скелет SankeyWidgetData зі списку необроблених подій.
 * Замініть логіку агрегації доменно-специфічною обробкою.
 */
export function buildSankeyFromEvents(events: any[]): SankeyWidgetData { // eslint-disable-line @typescript-eslint/no-explicit-any
  const nodeMap = new Map<string, SankeyNode>();
  const linkMap = new Map<string, SankeyLink>();

  for (const event of events) {
    const sourceId: string = event?.sourceId ?? "unknown-source";
    const targetId: string = event?.targetId ?? "unknown-target";

    if (!nodeMap.has(sourceId)) {
      nodeMap.set(sourceId, {
        id: sourceId,
        label: sourceId,
        labelUk: sourceId,
        category: event?.sourceCategory ?? "entity",
        value: 0,
      });
    }
    if (!nodeMap.has(targetId)) {
      nodeMap.set(targetId, {
        id: targetId,
        label: targetId,
        labelUk: targetId,
        category: event?.targetCategory ?? "entity",
        value: 0,
      });
    }

    const linkKey = `${sourceId}→${targetId}`;
    const existing = linkMap.get(linkKey);
    if (existing) {
      linkMap.set(linkKey, { ...existing, value: existing.value + 1 });
    } else {
      linkMap.set(linkKey, { sourceId, targetId, value: 1 });
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links: Array.from(linkMap.values()),
    title: "Flow Diagram",
    titleUk: "Діаграма потоків",
  };
}
