/**
 * Timeline bookmarks and chapters.
 * Закладки та розділи часової шкали.
 *
 * Bookmarks mark significant timestamps on the timeline; chapters group
 * bookmarks into named narrative segments (e.g. "Day 1 — Kyiv Offensive").
 * Both can be persisted to a Notebook entry and shared via a signed URL.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TimelineBookmark {
  bookmarkId: string;
  /** ISO 8601 timestamp this bookmark points to. */
  timestamp: string;
  label: string;
  labelUk: string;
  /** Optional highlight colour (hex). Defaults to amber. */
  color?: string;
  /** Notebook entry ID if this bookmark was persisted. */
  notebookId?: string;
}

export interface TimelineChapter {
  chapterId: string;
  fromTimestamp: string;
  toTimestamp: string;
  title: string;
  titleUk: string;
  bookmarks: TimelineBookmark[];
}

// ── Store class ───────────────────────────────────────────────────────────────

class BookmarkStore {
  private bookmarks = new Map<string, TimelineBookmark>();
  private chapters = new Map<string, TimelineChapter>();
  private seq = 0;

  /** Add a bookmark; generates bookmarkId if not present. */
  add(bookmark: Omit<TimelineBookmark, 'bookmarkId'> & { bookmarkId?: string }): TimelineBookmark {
    const id = bookmark.bookmarkId ?? `bm-${++this.seq}-${Date.now()}`;
    const entry: TimelineBookmark = { ...bookmark, bookmarkId: id };
    this.bookmarks.set(id, entry);
    return entry;
  }

  /** Remove a bookmark by ID. */
  remove(bookmarkId: string): boolean {
    return this.bookmarks.delete(bookmarkId);
  }

  /** List all bookmarks ordered by timestamp ascending. */
  list(): TimelineBookmark[] {
    return [...this.bookmarks.values()].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }

  /** Add or replace a chapter. */
  addChapter(chapter: TimelineChapter): void {
    this.chapters.set(chapter.chapterId, chapter);
  }

  /** Get all chapters ordered by fromTimestamp. */
  getChapters(): TimelineChapter[] {
    return [...this.chapters.values()].sort(
      (a, b) =>
        new Date(a.fromTimestamp).getTime() - new Date(b.fromTimestamp).getTime(),
    );
  }

  /** Remove a chapter. */
  removeChapter(chapterId: string): boolean {
    return this.chapters.delete(chapterId);
  }
}

/** Singleton store instance. */
export const bookmarkStore = new BookmarkStore();

// ── Shareable URL ─────────────────────────────────────────────────────────────

/**
 * Build a shareable URL for a single timeline bookmark.
 * Побудова URL для спільного доступу до закладки часової шкали.
 *
 * URL format: <baseUrl>/map?t=<ISO>&bm=<bookmarkId>
 *
 * @param bookmark  Bookmark to share
 * @param baseUrl   Base site URL (default '' for relative)
 */
export function buildShareableBookmarkUrl(
  bookmark: TimelineBookmark,
  baseUrl = '',
): string {
  const params = new URLSearchParams({
    t: bookmark.timestamp,
    bm: bookmark.bookmarkId,
  });
  return `${baseUrl}/map?${params.toString()}`;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const BOOKMARK_NOTES_EN: Record<string, string> = {
  'bookmark-persisted-to-notebook':
    'Set notebookId on a bookmark after persisting it to the Notebook service. ' +
    'The timeline UI shows a notebook icon on bookmarks with a linked note.',
  'shareable-link':
    'buildShareableBookmarkUrl() produces a relative URL. ' +
    'Pass the absolute origin as baseUrl in production for OG-card-compatible links.',
};

export const BOOKMARK_NOTES_UK: Record<string, string> = {
  'bookmark-persisted-to-notebook':
    'Встановіть notebookId у закладці після збереження її до сервісу Notebook. ' +
    'Інтерфейс часової шкали показує іконку нотатника для закладок із пов\'язаними нотатками.',
  'shareable-link':
    'buildShareableBookmarkUrl() повертає відносний URL. ' +
    'Передавайте абсолютний origin як baseUrl у продакшені для посилань, сумісних із OG-картками.',
};
