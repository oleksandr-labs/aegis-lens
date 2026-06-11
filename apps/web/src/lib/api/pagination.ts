/**
 * Cursor pagination — generic CursorPage type, encoder/decoder, and page builder.
 * Курсорна пагінація — універсальний тип CursorPage, кодувальник/декодувальник та побудова сторінки.
 *
 * Uses keyset pagination on (createdAt, id) for consistent ordering.
 * Використовує keyset-пагінацію за (createdAt, id) для стабільного сортування.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CursorPage<T> {
  items: T[];
  nextCursor?: string;
  prevCursor?: string;
  total?: number;
  hasMore: boolean;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
  direction?: "forward" | "backward";
}

// ── Notes ─────────────────────────────────────────────────────────────────────

/** Keyset pagination — avoids OFFSET performance degradation on large tables */
export const PAGINATION_NOTE_KEYSET_EN =
  "Keyset pagination — avoids OFFSET performance degradation on large tables; cursors encode the last-seen (id, createdAt) pair as opaque base64 JSON; safe across concurrent inserts/deletes.";
export const PAGINATION_NOTE_KEYSET_UK =
  "Keyset-пагінація — уникає погіршення продуктивності OFFSET на великих таблицях; курсори кодують останню переглянуту пару (id, createdAt) як непрозорий base64 JSON; стабільна при паралельних вставках/видаленнях.";

/** Consistent sort by (createdAt DESC, id DESC) across all paginated endpoints */
export const PAGINATION_NOTE_SORT_EN =
  "Consistent sort by (createdAt DESC, id DESC) across all paginated endpoints — the compound sort key ensures deterministic ordering even when multiple records share the same timestamp.";
export const PAGINATION_NOTE_SORT_UK =
  "Стабільне сортування за (createdAt DESC, id DESC) на всіх пагінованих ендпоінтах — складений ключ сортування забезпечує детермінований порядок навіть коли кілька записів мають однаковий timestamp.";

export const PAGINATION_NOTES_EN = [PAGINATION_NOTE_KEYSET_EN, PAGINATION_NOTE_SORT_EN];
export const PAGINATION_NOTES_UK = [PAGINATION_NOTE_KEYSET_UK, PAGINATION_NOTE_SORT_UK];

// ── Cursor codec ──────────────────────────────────────────────────────────────

/**
 * Encode an (id, createdAt) pair as an opaque base64 cursor string.
 * Кодування пари (id, createdAt) у непрозорий рядок курсора base64.
 */
export function encodeCursor(id: string, createdAt: string): string {
  return Buffer.from(JSON.stringify({ id, createdAt })).toString("base64url");
}

/**
 * Decode a cursor string back to its (id, createdAt) components.
 * Returns null if the cursor is malformed or missing required fields.
 *
 * Декодування рядка курсора в компоненти (id, createdAt).
 * Повертає null якщо курсор некоректний або відсутні обов'язкові поля.
 */
export function decodeCursor(cursor: string): { id: string; createdAt: string } | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.createdAt === "string"
    ) {
      return { id: parsed.id, createdAt: parsed.createdAt };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Page builder ──────────────────────────────────────────────────────────────

/**
 * Build a CursorPage from an in-memory array of items.
 * In production, the cursor is used to build a WHERE clause for keyset pagination.
 *
 * Побудова CursorPage з масиву елементів у пам'яті.
 * У виробничому середовищі курсор використовується для побудови WHERE-виразу keyset-пагінації.
 */
export function buildPage<T>(
  items: T[],
  params: CursorPaginationParams,
  getKey: (item: T) => { id: string; createdAt: string },
): CursorPage<T> {
  const { limit, cursor, direction = "forward" } = params;

  // Filter from cursor position if provided
  let filtered = items;
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      const { id: cursorId, createdAt: cursorTs } = decoded;
      const cursorTime = new Date(cursorTs).getTime();
      if (direction === "forward") {
        filtered = items.filter((item) => {
          const key = getKey(item);
          const itemTime = new Date(key.createdAt).getTime();
          return itemTime < cursorTime || (itemTime === cursorTime && key.id < cursorId);
        });
      } else {
        filtered = items.filter((item) => {
          const key = getKey(item);
          const itemTime = new Date(key.createdAt).getTime();
          return itemTime > cursorTime || (itemTime === cursorTime && key.id > cursorId);
        });
      }
    }
  }

  const page = filtered.slice(0, limit);
  const hasMore = filtered.length > limit;

  let nextCursor: string | undefined;
  let prevCursor: string | undefined;

  if (hasMore && page.length > 0) {
    const last = page[page.length - 1];
    const lastKey = getKey(last);
    nextCursor = encodeCursor(lastKey.id, lastKey.createdAt);
  }
  if (cursor && page.length > 0) {
    const first = page[0];
    const firstKey = getKey(first);
    prevCursor = encodeCursor(firstKey.id, firstKey.createdAt);
  }

  return {
    items: page,
    nextCursor,
    prevCursor,
    total: items.length,
    hasMore,
  };
}
