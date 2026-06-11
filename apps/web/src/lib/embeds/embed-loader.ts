/**
 * Embed Loader — lightweight (<30 KB) bootstrap script generator.
 *
 * The loader script is injected once per page by third-party publishers.
 * It discovers all embed placeholders, lazy-loads the full embed bundle,
 * and injects iframes only when they enter the viewport.
 *
 * Генерує легкий (< 30 КБ) завантажувальний скрипт для сторонніх сайтів.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Target maximum size for the loader script in kilobytes. Ліміт розміру скрипту. */
export const EMBED_LOADER_MAX_KB = 30;

/** Whether to lazy-load embeds by default. Ліниве завантаження увімкнено за замовчуванням. */
export const EMBED_LOADER_LAZY = true;

/** CDN path where the full embed bundle is served. CDN-шлях до повного бандлу. */
const EMBED_BUNDLE_CDN_PATH = 'https://aegislens.uk/static/embeds/bundle.js';

/** CSS class placed on placeholder elements. CSS-клас плейсхолдера. */
const EMBED_PLACEHOLDER_CLASS = 'aegis-embed';

// ── Interfaces ────────────────────────────────────────────────────────────────

/**
 * Options that can be passed to the loader at initialisation time.
 *
 * Параметри ініціалізації завантажувача.
 */
export interface EmbedLoaderConfig {
  /** Override CDN bundle URL (e.g. self-hosted). Своя URL бандлу. */
  bundleUrl?: string;
  /** Disable lazy loading (load all embeds immediately). Вимкнути ліниве завантаження. */
  eagerLoad?: boolean;
  /** Root margin for IntersectionObserver (default '200px'). Відступ для спостерігача. */
  rootMargin?: string;
  /** Nonce for Content-Security-Policy. Nonce для CSP. */
  nonce?: string;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

/**
 * English note for developers integrating the loader.
 *
 * Опис для розробників, що інтегрують завантажувач (англ.).
 */
export const LOADER_NOTE_EN =
  'Add this snippet once before </body>. It finds all .aegis-embed placeholders ' +
  'and lazy-loads the embed bundle when they enter the viewport.';

/**
 * Ukrainian note for developers integrating the loader.
 *
 * Опис для розробників (укр.).
 */
export const LOADER_NOTE_UK =
  'Додайте цей сніпет один раз перед </body>. Він знаходить усі .aegis-embed ' +
  'та ліниво завантажує бандл embed-ів, коли вони потрапляють у viewport.';

// ── Loader script builder ─────────────────────────────────────────────────────

/**
 * Build the lightweight loader script as an inline <script> tag.
 * The generated script stays well under EMBED_LOADER_MAX_KB.
 *
 * Генерує вбудований тег <script> для завантажувача embed-ів.
 */
export function buildLoaderScript(config: EmbedLoaderConfig = {}): string {
  const {
    bundleUrl = EMBED_BUNDLE_CDN_PATH,
    eagerLoad = !EMBED_LOADER_LAZY,
    rootMargin = '200px',
    nonce,
  } = config;

  const nonceAttr = nonce ? ` nonce="${nonce}"` : '';

  // Minified loader logic inline — must stay < EMBED_LOADER_MAX_KB.
  // Мінімізована логіка завантажувача — має бути < EMBED_LOADER_MAX_KB.
  const loaderBody = `(function(){
  var BUNDLE="${bundleUrl}";
  var LAZY=${eagerLoad ? 'false' : 'true'};
  var ROOT_MARGIN="${rootMargin}";
  var CLS="${EMBED_PLACEHOLDER_CLASS}";
  var loaded=false;
  function loadBundle(){
    if(loaded)return;loaded=true;
    var s=document.createElement('script');
    s.src=BUNDLE;s.async=true;
    document.head.appendChild(s);
  }
  function observe(){
    var els=document.querySelectorAll('.'+CLS);
    if(!els.length)return;
    if(!LAZY||!('IntersectionObserver' in window)){loadBundle();return;}
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){if(e.isIntersecting){loadBundle();io.disconnect();}});
    },{rootMargin:ROOT_MARGIN});
    els.forEach(function(el){io.observe(el);});
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',observe);
  }else{observe();}
})();`;

  return [
    `<!-- Aegis Lens Embed Loader | aegislens.uk | max ${EMBED_LOADER_MAX_KB}KB -->`,
    `<script${nonceAttr}>`,
    loaderBody,
    `</script>`,
  ].join('\n');
}
