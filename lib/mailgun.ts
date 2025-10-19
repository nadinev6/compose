/**
 * Mailgun API integration service
 * Handles email sending through Mailgun API
 */

import { EmailRecipients, EmailSendStatus } from './database.types';

export interface MailgunConfig {
  apiKey: string;
  domain: string;
  apiBaseUrl: string;
}

export interface EmailSendRequest {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: string[];
  customVariables?: Record<string, string>;
}

export interface MailgunResponse {
  id: string;
  message: string;
}

export interface MailgunError {
  message: string;
  code?: string;
  status?: number;
}

export class MailgunService {
  private config: MailgunConfig;

  constructor(config: MailgunConfig) {
    this.config = config;
  }

  /**
   * Send email through Mailgun API
   */
  async sendEmail(request: EmailSendRequest): Promise<MailgunResponse> {
    try {
      // Validate request
      this.validateEmailRequest(request);

      // Prepare form data for Mailgun API
      const formData = new FormData();
      
      // Recipients
      request.to.forEach(email => formData.append('to', email));
      if (request.cc) {
        request.cc.forEach(email => formData.append('cc', email));
      }
      if (request.bcc) {
        request.bcc.forEach(email => formData.append('bcc', email));
      }

      // Content
      formData.append('subject', request.subject);
      formData.append('html', request.html);
      if (request.text) {
        formData.append('text', request.text);
      }

      // Sender info
      formData.append('from', request.from || `Compose <noreply@${this.config.domain}>`);
      if (request.replyTo) {
        formData.append('h:Reply-To', request.replyTo);
      }

      // Tags for tracking
      if (request.tags) {
        request.tags.forEach(tag => formData.append('o:tag', tag));
      }

      // Custom variables
      if (request.customVariables) {
        Object.entries(request.customVariables).forEach(([key, value]) => {
          formData.append(`v:${key}`, value);
        });
      }

      // Add tracking
      formData.append('o:tracking', 'true');
      formData.append('o:tracking-clicks', 'true');
      formData.append('o:tracking-opens', 'true');

      // Make API request
      const response = await fetch(`${this.config.apiBaseUrl}/${this.config.domain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString('base64')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Mailgun API error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        message: data.message
      };
    } catch (error) {
      console.error('Mailgun send error:', error);
      throw this.handleMailgunError(error);
    }
  }

  /**
   * Get email delivery status from Mailgun
   */
  async getDeliveryStatus(messageId: string): Promise<{
    status: EmailSendStatus;
    events: Array<{
      event: string;
      timestamp: number;
      recipient?: string;
      reason?: string;
    }>;
  }> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/${this.config.domain}/events?message-id=${messageId}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString('base64')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get delivery status: ${response.status}`);
      }

      const data = await response.json();
      const events = data.items || [];
      
      // Determine status from events - map to database schema
      let status: EmailSendStatus = 'pending';
      if (events.some((e: any) => e.event === 'delivered')) {
        status = 'sent';
      } else if (events.some((e: any) => e.event === 'failed')) {
        status = 'failed';
      } else if (events.some((e: any) => e.event === 'rejected')) {
        status = 'failed';
      } else if (events.some((e: any) => e.event === 'accepted')) {
        status = 'sent';
      }

      return {
        status,
        events: events.map((event: any) => ({
          event: event.event,
          timestamp: event.timestamp,
          recipient: event.recipient,
          reason: event.reason
        }))
      };
    } catch (error) {
      console.error('Error getting delivery status:', error);
      throw error;
    }
  }

  /**
   * Validate email addresses
   */
  async validateEmail(email: string): Promise<{
    isValid: boolean;
    reason?: string;
    suggestion?: string;
  }> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/address/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString('base64')}`
        },
        body: new URLSearchParams({ address: email })
      });

      if (!response.ok) {
        return { isValid: false, reason: 'Validation service unavailable' };
      }

      const data = await response.json();
      return {
        isValid: data.is_valid,
        reason: data.reason,
        suggestion: data.suggestion
      };
    } catch (error) {
      console.error('Email validation error:', error);
      return { isValid: false, reason: 'Validation failed' };
    }
  }

  /**
   * Get account sending statistics
   */
  async getStats(): Promise<{
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    clicked: number;
  }> {
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/${this.config.domain}/stats/total`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.config.apiKey}`).toString('base64')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get stats: ${response.status}`);
      }

      const data = await response.json();
      const stats = data.stats?.[0] || {};
      
      return {
        sent: stats.sent?.total || 0,
        delivered: stats.delivered?.total || 0,
        failed: stats.failed?.total || 0,
        opened: stats.opened?.total || 0,
        clicked: stats.clicked?.total || 0
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        sent: 0,
        delivered: 0,
        failed: 0,
        opened: 0,
        clicked: 0
      };
    }
  }

  /**
   * Validate email request
   */
  private validateEmailRequest(request: EmailSendRequest): void {
    if (!request.to || request.to.length === 0) {
      throw new Error('At least one recipient is required');
    }

    if (!request.subject || request.subject.trim().length === 0) {
      throw new Error('Subject is required');
    }

    if (!request.html || request.html.trim().length === 0) {
      throw new Error('Email content is required');
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    for (const email of request.to) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }

    if (request.cc) {
      for (const email of request.cc) {
        if (!emailRegex.test(email)) {
          throw new Error(`Invalid CC email address: ${email}`);
        }
      }
    }

    if (request.bcc) {
      for (const email of request.bcc) {
        if (!emailRegex.test(email)) {
          throw new Error(`Invalid BCC email address: ${email}`);
        }
      }
    }
  }

  /**
   * Handle Mailgun API errors
   */
  private handleMailgunError(error: any): Error {
    if (error.message?.includes('401')) {
      return new Error('Invalid Mailgun API key');
    } else if (error.message?.includes('402')) {
      return new Error('Mailgun account payment required');
    } else if (error.message?.includes('403')) {
      return new Error('Mailgun API access forbidden');
    } else if (error.message?.includes('404')) {
      return new Error('Mailgun domain not found');
    } else if (error.message?.includes('429')) {
      return new Error('Mailgun rate limit exceeded');
    } else if (error.message?.includes('500')) {
      return new Error('Mailgun server error');
    } else {
      return error instanceof Error ? error : new Error('Unknown Mailgun error');
    }
  }
}

// Utility functions
export function createMailgunService(): MailgunService {
  const config: MailgunConfig = {
    apiKey: process.env.MAILGUN_API_KEY || '',
    domain: process.env.MAILGUN_DOMAIN || '',
    apiBaseUrl: process.env.MAILGUN_API_BASE_URL || 'https://api.mailgun.net/v3'
  };

  if (!config.apiKey) {
    throw new Error('MAILGUN_API_KEY environment variable is required');
  }

  if (!config.domain) {
    throw new Error('MAILGUN_DOMAIN environment variable is required');
  }

  return new MailgunService(config);
}

export function convertRecipientsToMailgun(recipients: EmailRecipients): {
  to: string[];
  cc?: string[];
  bcc?: string[];
} {
  return {
    to: recipients.to,
    cc: recipients.cc,
    bcc: recipients.bcc
  };
}