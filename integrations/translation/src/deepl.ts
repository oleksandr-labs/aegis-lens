import 'server-only';

export interface DeepLConfig {
  apiKey: string;
  baseUrl: string;
  plan: 'free' | 'pro';
}

/** DeepL-supported language codes (subset most relevant to Aegis Lens). */
export const DEEPL_SUPPORTED_LANGS: string[] = [
  'BG', 'CS', 'DA', 'DE', 'EL', 'EN', 'EN-GB', 'EN-US',
  'ES', 'ET', 'FI', 'FR', 'HU', 'ID', 'IT', 'JA',
  'KO', 'LT', 'LV', 'NB', 'NL', 'PL', 'PT', 'PT-BR', 'PT-PT',
  'RO', 'RU', 'SK', 'SL', 'SV', 'TR', 'UK', 'ZH',
];

export class DeepLClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config?: Partial<DeepLConfig>) {
    this.apiKey = config?.apiKey ?? process.env.DEEPL_API_KEY ?? '';
    const plan = config?.plan ?? (process.env.DEEPL_PLAN as 'free' | 'pro' | undefined) ?? 'free';
    this.baseUrl =
      config?.baseUrl ??
      (plan === 'pro'
        ? 'https://api.deepl.com/v2'
        : 'https://api-free.deepl.com/v2');
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Translates a single text string.
   * @param text — source text
   * @param targetLang — ISO 639-1 language code (e.g. "UK", "EN-GB")
   * @param sourceLang — optional; DeepL auto-detects if omitted
   */
  async translate(
    text: string,
    targetLang: string,
    sourceLang?: string,
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('DeepL is not configured (DEEPL_API_KEY missing).');
    }

    const body = new URLSearchParams({
      text,
      target_lang: targetLang.toUpperCase(),
    });
    if (sourceLang) body.set('source_lang', sourceLang.toUpperCase());

    const res = await fetch(`${this.baseUrl}/translate`, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`DeepL translate failed (${res.status}): ${err}`);
    }

    const data = (await res.json()) as {
      translations: Array<{ text: string; detected_source_language: string }>;
    };

    return data.translations[0]?.text ?? '';
  }

  /**
   * Translates multiple texts in a single API call (more quota-efficient).
   */
  async translateBatch(
    texts: string[],
    targetLang: string,
    sourceLang?: string,
  ): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error('DeepL is not configured (DEEPL_API_KEY missing).');
    }

    const body = new URLSearchParams({ target_lang: targetLang.toUpperCase() });
    texts.forEach((t) => body.append('text', t));
    if (sourceLang) body.set('source_lang', sourceLang.toUpperCase());

    const res = await fetch(`${this.baseUrl}/translate`, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`DeepL translateBatch failed (${res.status}): ${err}`);
    }

    const data = (await res.json()) as {
      translations: Array<{ text: string }>;
    };

    return data.translations.map((t) => t.text);
  }
}

export const deepLClient = new DeepLClient();
