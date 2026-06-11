export interface EmailMessage {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
  /** Provider-specific tags / categories for analytics. */
  tags?: string[];
}

export interface EmailResult {
  id: string;
  success: boolean;
  provider: string;
  error?: string;
}

export interface EmailProvider {
  name: string;
  send(msg: EmailMessage): Promise<EmailResult>;
}
