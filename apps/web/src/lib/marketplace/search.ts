/**
 * Marketplace — Categories, search, and filter facets.
 *
 * Defines the plugin category taxonomy, filter facets, search query/result
 * types, and an in-memory search implementation for the marketplace browser.
 *
 * Категорії плагінів, фільтри, типи запиту/результату та пошук по маркетплейсу.
 */

// ── MarketplaceCategory ───────────────────────────────────────────────────────

/**
 * Exhaustive category taxonomy for marketplace plugins.
 * Each plugin must declare exactly one category in its listing.
 *
 * Вичерпний перелік категорій плагінів у маркетплейсі.
 */
export enum MarketplaceCategory {
  /** Adds a new data source to the map */
  DataLayer = "data-layer",
  /** Adds a dashboard widget */
  Widget = "widget",
  /** Extends copilot with an AI tool */
  AiTool = "ai-tool",
  /** Adds a command-palette action */
  Action = "action",
  /** Adds a new export format */
  Exporter = "exporter",
  /** Adds a notification delivery channel */
  Notification = "notification",
  /** Visualisation / chart layer */
  Visualization = "visualization",
  /** Third-party service integration */
  Integration = "integration",
  /** Usage metrics and reporting */
  Analytics = "analytics",
  /** Utility / helper tooling */
  Utility = "utility",
}

// ── Filter facets ─────────────────────────────────────────────────────────────

export interface FilterFacet {
  key: string;
  label_en: string;
  label_uk: string;
  values: string[];
}

/**
 * Standard filter facets shown in the marketplace sidebar.
 *
 * Стандартні фільтри бокової панелі маркетплейсу.
 */
export const MARKETPLACE_FILTER_FACETS: FilterFacet[] = [
  {
    key: "category",
    label_en: "Category",
    label_uk: "Категорія",
    values: Object.values(MarketplaceCategory),
  },
  {
    key: "pricing",
    label_en: "Pricing",
    label_uk: "Ціна",
    values: ["free", "paid", "subscription"],
  },
  {
    key: "verified",
    label_en: "Verified Developer",
    label_uk: "Верифікований розробник",
    values: ["true"],
  },
  {
    key: "sort",
    label_en: "Sort By",
    label_uk: "Сортування",
    values: ["installs", "rating", "newest", "name"],
  },
];

// ── MarketplaceSearchQuery ────────────────────────────────────────────────────

/**
 * Query object for searching the plugin marketplace.
 *
 * Запит для пошуку плагінів у маркетплейсі.
 */
export interface MarketplaceSearchQuery {
  /** Free-text search string */
  q?: string;
  /** Filter by one or more categories */
  categories?: MarketplaceCategory[];
  /** Filter by pricing model */
  pricing?: "free" | "paid" | "subscription";
  /** Only show verified-developer plugins */
  verifiedOnly?: boolean;
  /** Sort order — default: installs */
  sort?: "installs" | "rating" | "newest" | "name";
  page?: number;
  pageSize?: number;
}

// ── MarketplaceSearchResult ───────────────────────────────────────────────────

export interface MarketplaceResultItem {
  pluginId: string;
  name: string;
  description: string;
  category: MarketplaceCategory;
  authorName: string;
  isVerifiedDeveloper: boolean;
  installCount: number;
  averageRating: number;
  pricingModel: "free" | "paid" | "subscription";
  priceUsd: number | null;
  iconUrl?: string;
  slug: string;
  updatedAt: string;
}

/**
 * Paginated result set from a marketplace search.
 *
 * Посторінковий результат пошуку по маркетплейсу.
 */
export interface MarketplaceResult {
  items: MarketplaceResultItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  facetCounts: Record<string, Record<string, number>>;
}

// ── In-memory search store ────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE = 20;

/**
 * In-memory marketplace search implementation.
 * In production, replace with a full-text search backend (e.g. Meilisearch).
 *
 * Пошук по маркетплейсу в пам'яті.
 * У проді замінити на повнотекстовий бекенд (Meilisearch тощо).
 */
export class MarketplaceSearchStore {
  private readonly items = new Map<string, MarketplaceResultItem>();

  /** Register or update a plugin in the search index. */
  index(item: MarketplaceResultItem): void {
    this.items.set(item.pluginId, item);
  }

  /** Remove a plugin from the search index. */
  deindex(pluginId: string): void {
    this.items.delete(pluginId);
  }

  /**
   * Execute a marketplace search query.
   *
   * Виконує пошуковий запит по маркетплейсу.
   */
  search(query: MarketplaceSearchQuery): MarketplaceResult {
    const {
      q,
      categories,
      pricing,
      verifiedOnly,
      sort = "installs",
      page = 1,
      pageSize = DEFAULT_PAGE_SIZE,
    } = query;

    let results = Array.from(this.items.values());

    // ── Filter ──
    if (q) {
      const lq = q.toLowerCase();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(lq) ||
          r.description.toLowerCase().includes(lq) ||
          r.authorName.toLowerCase().includes(lq),
      );
    }
    if (categories?.length) {
      results = results.filter((r) => categories.includes(r.category));
    }
    if (pricing) {
      results = results.filter((r) => r.pricingModel === pricing);
    }
    if (verifiedOnly) {
      results = results.filter((r) => r.isVerifiedDeveloper);
    }

    // ── Sort ──
    results.sort((a, b) => {
      switch (sort) {
        case "installs": return b.installCount - a.installCount;
        case "rating":   return b.averageRating - a.averageRating;
        case "newest":   return b.updatedAt.localeCompare(a.updatedAt);
        case "name":     return a.name.localeCompare(b.name);
        default:         return 0;
      }
    });

    // ── Facet counts ──
    const facetCounts: Record<string, Record<string, number>> = {
      category: {},
      pricing: {},
    };
    for (const item of results) {
      facetCounts.category[item.category] = (facetCounts.category[item.category] ?? 0) + 1;
      facetCounts.pricing[item.pricingModel] = (facetCounts.pricing[item.pricingModel] ?? 0) + 1;
    }

    // ── Paginate ──
    const total = results.length;
    const offset = (page - 1) * pageSize;
    const items = results.slice(offset, offset + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: offset + pageSize < total,
      facetCounts,
    };
  }
}

// ── Singleton + convenience export ───────────────────────────────────────────

export const marketplaceSearchStore = new MarketplaceSearchStore();

/**
 * Convenience function — delegates to the singleton store.
 *
 * Зручна функція-обгортка над синглтоном.
 */
export function searchPlugins(query: MarketplaceSearchQuery): MarketplaceResult {
  return marketplaceSearchStore.search(query);
}
