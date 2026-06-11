/**
 * Widget data binding — connects widgets to org-scoped data sources with filters.
 * Прив'язка даних віджетів — підключає віджети до джерел даних у межах організації з фільтрами.
 *
 * NOTE (EN): All bindings are org-scoped; a widget in org A cannot see org B data sources.
 * NOTE (UK): Усі прив'язки обмежені організацією; віджет орг. A не може бачити джерела орг. B.
 *
 * NOTE (EN): Filter DSL is a flat Record<string,unknown>; runtime validators should narrow types.
 * NOTE (UK): DSL фільтрів — плаский Record<string,unknown>; валідатори середовища виконання звужують типи.
 *
 * NOTE (EN): resolveData is a placeholder — replace with real DB/API fetch in production.
 * NOTE (UK): resolveData — заглушка; у продакшні замінити реальним запитом до БД/API.
 *
 * NOTE (EN): Cache TTL per binding defaults to refreshIntervalS; set to 0 to disable caching.
 * NOTE (UK): TTL кешу для прив'язки за замовчуванням = refreshIntervalS; встановіть 0 для вимкнення.
 */

// ---------------------------------------------------------------------------
// DataSource
// ---------------------------------------------------------------------------

export interface DataSource {
  sourceId: string;
  orgId: string;
  type: "events" | "alerts" | "entities" | "metrics" | "external";
  filters: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// WidgetDataBinding
// ---------------------------------------------------------------------------

export interface WidgetDataBinding {
  widgetId: string;
  dataSourceId: string;
  /** Maps widget field names → data source field names */
  fieldMappings: Record<string, string>;
  /** Polling interval in seconds; 0 means push-only */
  refreshIntervalS: number;
}

// ---------------------------------------------------------------------------
// DataBindingStore
// ---------------------------------------------------------------------------

/**
 * In-memory store for widget data bindings.
 * Сховище прив'язок даних віджетів у пам'яті.
 */
export class DataBindingStore {
  private readonly bindings = new Map<string, WidgetDataBinding>();
  private readonly sources = new Map<string, DataSource>();

  /** Register a data source. / Реєструє джерело даних. */
  registerSource(source: DataSource): void {
    this.sources.set(source.sourceId, source);
  }

  /** Bind a widget to a data source. / Прив'язує віджет до джерела даних. */
  bind(widgetId: string, binding: WidgetDataBinding): void {
    this.bindings.set(widgetId, binding);
  }

  /** Get the binding for a widget. / Повертає прив'язку для віджета. */
  getBinding(widgetId: string): WidgetDataBinding | undefined {
    return this.bindings.get(widgetId);
  }

  /** Get a registered data source. / Повертає зареєстроване джерело даних. */
  getSource(sourceId: string): DataSource | undefined {
    return this.sources.get(sourceId);
  }

  /**
   * Resolve data for a binding — placeholder implementation.
   * Returns a skeleton response; replace with real fetch in production.
   *
   * Вирішення даних для прив'язки — заглушка.
   * Повертає порожній скелет; у продакшні замінити реальним запитом.
   */
  resolveData(binding: WidgetDataBinding): {
    widgetId: string;
    sourceId: string;
    data: unknown[];
    resolvedAt: string;
  } {
    const source = this.sources.get(binding.dataSourceId);
    return {
      widgetId: binding.widgetId,
      sourceId: binding.dataSourceId,
      data: source ? [] : [],
      resolvedAt: new Date().toISOString(),
    };
  }

  /** List all bindings. / Повертає всі прив'язки. */
  listBindings(): WidgetDataBinding[] {
    return Array.from(this.bindings.values());
  }

  /** Remove a binding. / Видаляє прив'язку. */
  unbind(widgetId: string): void {
    this.bindings.delete(widgetId);
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

/** Global in-memory data binding store singleton. */
export const dataBindingStore = new DataBindingStore();
