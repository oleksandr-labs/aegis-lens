/**
 * Rich Text + Embeds — MDX embed parsing for map snapshots, charts, event cards,
 * callouts, videos and code blocks embedded inside editorial content.
 *
 * Rich Text + Embeds — парсинг MDX-вставок: карти, графіки, картки подій,
 * callout-и, відео та блоки коду всередині редакторського контенту.
 */

// ── Embed types ───────────────────────────────────────────────────────────────

/**
 * Supported embed component types in rich text / MDX content.
 *
 * Підтримувані типи вставок у rich text / MDX-контенті.
 */
export enum EmbedType {
  Map = "map",
  Chart = "chart",
  EventCard = "event-card",
  Callout = "callout",
  Video = "video",
  Code = "code",
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RichTextEmbed {
  /** Embed variant. / Вид вставки. */
  type: EmbedType;
  /** Raw JSX attribute string parsed from the MDX source. */
  rawProps: string;
  /** Parsed key/value props (best-effort; strings only). */
  props: Record<string, string>;
  /** Character offset of the embed opening tag in the source. */
  offset: number;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export const RICH_TEXT_NOTE_EN =
  "Embeds are MDX JSX components inside editorial content. " +
  "Keystatic renders them via custom components registered in keystatic.config.ts. " +
  "Supported embeds: <MapEmbed>, <ChartEmbed>, <EventCard>, <Callout>, <VideoEmbed>, <CodeBlock>. " +
  "Each embed is isolated: it cannot access the parent page's state directly.";

export const RICH_TEXT_NOTE_UK =
  "Вставки — це JSX-компоненти MDX всередині редакторського контенту. " +
  "Keystatic рендерить їх через кастомні компоненти, зареєстровані в keystatic.config.ts. " +
  "Підтримувані вставки: <MapEmbed>, <ChartEmbed>, <EventCard>, <Callout>, <VideoEmbed>, <CodeBlock>. " +
  "Кожна вставка ізольована: вона не може напряму звертатися до стану батьківської сторінки.";

// ── Parser ────────────────────────────────────────────────────────────────────

/** Map from EmbedType to its MDX component tag name. */
const EMBED_TAG_MAP: Record<EmbedType, string> = {
  [EmbedType.Map]: "MapEmbed",
  [EmbedType.Chart]: "ChartEmbed",
  [EmbedType.EventCard]: "EventCard",
  [EmbedType.Callout]: "Callout",
  [EmbedType.Video]: "VideoEmbed",
  [EmbedType.Code]: "CodeBlock",
};

/**
 * Parse all embed components from an MDX string.
 * Uses a lightweight regex scan — not a full MDX AST parser.
 *
 * Парсить усі вставки з MDX-рядка.
 * Використовує легкий regex-скан, а не повний MDX AST-парсер.
 */
export function parseRichTextEmbeds(mdx: string): RichTextEmbed[] {
  const results: RichTextEmbed[] = [];

  for (const [embedType, tagName] of Object.entries(EMBED_TAG_MAP)) {
    // Match self-closing or opening tags: <TagName ...props... />  or <TagName ...>
    const pattern = new RegExp(`<${tagName}(\\s[^>]*)?\\/?>`, "g");
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(mdx)) !== null) {
      const rawProps = (match[1] ?? "").trim();
      const props = _parseProps(rawProps);

      results.push({
        type: embedType as EmbedType,
        rawProps,
        props,
        offset: match.index,
      });
    }
  }

  // Sort by appearance order in the source
  results.sort((a, b) => a.offset - b.offset);
  return results;
}

// ── Prop parser helper ────────────────────────────────────────────────────────

/**
 * Best-effort key="value" prop parser for simple JSX attributes.
 *
 * Найпростіший парсер атрибутів key="value" для JSX.
 */
function _parseProps(raw: string): Record<string, string> {
  const props: Record<string, string> = {};
  const attrPattern = /(\w[\w-]*)=["']([^"']*)["']/g;
  let m: RegExpExecArray | null;
  while ((m = attrPattern.exec(raw)) !== null) {
    props[m[1]] = m[2];
  }
  return props;
}
