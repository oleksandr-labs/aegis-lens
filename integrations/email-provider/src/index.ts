import 'server-only';
import { ResendEmailProvider } from './resend';
import { PostmarkEmailProvider } from './postmark';

export { ResendEmailProvider } from './resend';
export { PostmarkEmailProvider } from './postmark';
export type { EmailMessage, EmailResult, EmailProvider } from './types';

/** Console mock used in development and CI. */
class ConsoleEmailProvider {
  readonly name = 'console';

  async send(msg: import('./types').EmailMessage): Promise<import('./types').EmailResult> {
    console.log('[email-provider:mock] Would send email:', {
      to: msg.to,
      subject: msg.subject,
      provider: 'console',
    });
    return { id: `mock-${Date.now()}`, success: true, provider: 'console' };
  }
}

/**
 * Returns the best available email provider:
 * 1. Resend (RESEND_API_KEY)
 * 2. Postmark (POSTMARK_SERVER_TOKEN)
 * 3. Console mock (development / CI)
 */
export function getEmailProvider(): import('./types').EmailProvider {
  const resend = new ResendEmailProvider();
  if (resend.isConfigured()) return resend;

  const postmark = new PostmarkEmailProvider();
  if (postmark.isConfigured()) return postmark;

  return new ConsoleEmailProvider();
}
