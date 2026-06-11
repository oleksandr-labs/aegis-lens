import 'server-only';

const LINGVANEX_BASE_URL = 'https://api-b2b.backenster.com/b1/api/v3';

/**
 * Lingvanex translation client — used as a fallback when DeepL is not configured.
 * Implements the same interface as DeepLClient for drop-in substitution.
 */
export class LingvanexClient {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.LINGVANEX_API_KEY ?? '';
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async translate(
    text: string,
    targetLang: string,
    sourceLang?: string,
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Lingvanex is not configured (LINGVANEX_API_KEY missing).');
    }

    const res = await fetch(`${LINGVANEX_BASE_URL}/translate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sourceLang ? `${sourceLang.toLowerCase()}_${sourceLang.toUpperCase()}` : undefined,
        to: `${targetLang.toLowerCase()}_${targetLang.toUpperCase()}`,
        data: text,
        platform: 'api',
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(`Lingvanex translate failed (${res.status}): ${err}`);
    }

    const data = (await res.json()) as { result: string; err?: string };
    if (data.err) throw new Error(`Lingvanex error: ${data.err}`);
    return data.result;
  }

  async translateBatch(
    texts: string[],
    targetLang: string,
    sourceLang?: string,
  ): Promise<string[]> {
    // Lingvanex does not have a native batch endpoint — parallelise individually
    return Promise.all(texts.map((t) => this.translate(t, targetLang, sourceLang)));
  }
}

export const lingvanexClient = new LingvanexClient();
