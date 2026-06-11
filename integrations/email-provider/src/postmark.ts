import 'server-only';
import type { EmailMessage, EmailResult, EmailProvider } from './types';

export class PostmarkEmailProvider implements EmailProvider {
  readonly name = 'postmark';
  private readonly serverToken: string;

  constructor() {
    this.serverToken = process.env.POSTMARK_SERVER_TOKEN ?? '';
  }

  isConfigured(): boolean {
    return this.serverToken.length > 0;
  }

  async send(msg: EmailMessage): Promise<EmailResult> {
    try {
      const res = await fetch('https://api.postmarkapp.com/email', {
        method: 'POST',
        headers: {
          'X-Postmark-Server-Token': this.serverToken,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          From: msg.from,
          To: Array.isArray(msg.to) ? msg.to.join(',') : msg.to,
          Subject: msg.subject,
          HtmlBody: msg.html,
          TextBody: msg.text,
          ReplyTo: msg.replyTo,
          Headers: msg.headers
            ? Object.entries(msg.headers).map(([Name, Value]) => ({ Name, Value }))
            : undefined,
          Tag: msg.tags?.[0], // Postmark supports a single tag per message
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({ Message: res.statusText }))) as { Message: string; ErrorCode?: number };
        return {
          id: '',
          success: false,
          provider: this.name,
          error: `Postmark error (${res.status} / ${err.ErrorCode ?? 'N/A'}): ${err.Message}`,
        };
      }

      const data = (await res.json()) as { MessageID: string };
      return { id: data.MessageID, success: true, provider: this.name };
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
