import 'server-only';
import type { EmailMessage, EmailResult, EmailProvider } from './types';

export class ResendEmailProvider implements EmailProvider {
  readonly name = 'resend';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY ?? '';
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async send(msg: EmailMessage): Promise<EmailResult> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: msg.from,
          to: Array.isArray(msg.to) ? msg.to : [msg.to],
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
          reply_to: msg.replyTo,
          headers: msg.headers,
          tags: msg.tags?.map((t) => ({ name: t, value: 'true' })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText })) as { message: string };
        return {
          id: '',
          success: false,
          provider: this.name,
          error: `Resend error (${res.status}): ${err.message}`,
        };
      }

      const data = (await res.json()) as { id: string };
      return { id: data.id, success: true, provider: this.name };
    } catch (err) {
      return {
        id: '',
        success: false,
        provider: this.name,
        error: String(err),
      };
    }
  }
}
