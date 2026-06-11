import 'server-only';
import { DeepLClient } from './deepl';
import { LingvanexClient } from './lingvanex';

export { DeepLClient, deepLClient, DEEPL_SUPPORTED_LANGS } from './deepl';
export { LingvanexClient, lingvanexClient } from './lingvanex';

/** Common interface implemented by all translation providers. */
export interface TranslationProvider {
  name: string;
  isConfigured(): boolean;
  translate(text: string, target: string, source?: string): Promise<string>;
  translateBatch(texts: string[], target: string, source?: string): Promise<string[]>;
}

/** No-op mock provider used in CI / unit tests. */
class MockTranslationProvider implements TranslationProvider {
  readonly name = 'mock';
  isConfigured(): boolean { return true; }
  async translate(text: string): Promise<string> { return `[mock] ${text}`; }
  async translateBatch(texts: string[]): Promise<string[]> {
    return texts.map((t) => `[mock] ${t}`);
  }
}

/**
 * Returns the best available translation provider:
 * 1. DeepL (DEEPL_API_KEY)
 * 2. Lingvanex (LINGVANEX_API_KEY)
 * 3. Mock (dev / CI — returns prefixed originals, never throws)
 */
export function getTranslationProvider(): TranslationProvider {
  const deepl = new DeepLClient();
  if (deepl.isConfigured()) {
    return Object.assign(deepl, { name: 'deepl' }) as TranslationProvider;
  }

  const lingvanex = new LingvanexClient();
  if (lingvanex.isConfigured()) {
    return Object.assign(lingvanex, { name: 'lingvanex' }) as TranslationProvider;
  }

  return new MockTranslationProvider();
}
