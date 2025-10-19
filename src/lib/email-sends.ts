/**
 * Email sends data access layer
 * CRUD operations for email send tracking with Supabase
 */

import { supabase } from './supabase';
import type { 
  EmailSend, 
  EmailSendInsert, 
  EmailSendUpdate, 
  EmailSendStatus,
  EmailRecipients,
  Database
} from './database.types';

// Error types
export class EmailSendError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'EmailSendError';
  }
}

export class EmailValidationError extends EmailSendError {
  constructor(message: string, public validationErrors: string[]) {
    super(message, 'VALIDATION_ERROR', { validationErrors });
  }
}

// Email send operations
export class EmailSendService {
  /**
   * Get all email sends for the current user
   */
  static async getEmailSends(userId: string, limit?: number): Promise<EmailSend[]> {
    try {
      let query = (supabase as any)
        .from('email_sends')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new EmailSendError('Failed to fetch email sends', 'FETCH_ERROR', error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof EmailSendError) throw error;
      throw new EmailSendError('Unexpected error fetching email sends', 'UNKNOWN_ERROR', error);
    }
  }

  /**
   * Get email sends for a specific template
   */
  static async getEmailSendsForTemplate(templateId: string, userId: string): Promise<EmailSend[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('email_sends')
        .select('*')
        .eq('template_id', templateId)
        .eq('user_id', userId)
        .order('sent_at', { ascending: false });

      if (error) {
        throw new EmailSendError('Failed to fetch email sends for template', 'FETCH_ERROR', error);
      }

      return data || [];
    } catch (error) {
      if (error instanceof EmailSendError) throw error;
      throw new EmailSendError('Unexpected error fetching email sends for template', 'UNKNOWN_ERROR', error);
    }
  }

  /**
   * Get a specific email send by ID
   */
  static async getEmailSend(emailSendId: string, userId: string): Promise<EmailSend | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('email_sends')
        .select('*')
        .eq('id', emailSendId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Email send not found
        }
        throw new EmailSendError('Failed to fetch email send', 'FETCH_ERROR', error);
      }

      return data;
    } catch (error) {
      if (error instanceof EmailSendError) throw error;
      throw new EmailSendError('Unexpected error fetching email send', 'UNKNOWN_ERROR', error);
    }
  }

  /**
   * Create a new email send record
   */
  static async createEmailSend(emailSend: EmailSendInsert): Promise<EmailSend> {
    try {
      // Validate the email send
      this.validateEmailSend(emailSend);

      const { data, error } = await (supabase as any)
        .from('email_sends')
        .insert(emailSend)
        .select()
        .single();

      if (error) {
        throw new EmailSendError('Failed to create email send record', 'CREATE_ERROR', error);
      }

      return data;
    } catch (error) {
      if (error instanceof EmailSendError) throw error;
      throw new EmailSendError('Unexpected error creating email send record', 'UNKNOWN_ERROR', error);
    }
  }

  /**
   * Update an email send record (typically for status updates)
   */
  static async updateEmailSend(
    emailSendId: string, 
    userId: string, 
    updates: EmailSendUpdate
  ): Promise<EmailSend> {
    try {
      const { data, error } = await (supabase as any)
        .from('email_sends')
        .update(updates)
        .eq('id', emailSendId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new EmailSendError('Failed to update email send record', 'UPDATE_ERROR', error);
      }

      return data;
    } catch (error) {
      if (error instanceof EmailSendError) throw error;
      throw new EmailSendError('Unexpected error updating email send record', 'UNKNOWN_ERROR', error);
    }
  }

  /**
   * Update email send status
   */
  static async updateEmailSendStatus(
    emailSendId: string, 
    userId: string, 
    status: EmailSendStatus,
    errorMessage?: string,
    mailgunMessageId?: string
  ): Promise<EmailSend> {
    const updates: EmailSendUpdate = { status };
    
    if (errorMessage) {
      updates.error_message = errorMessage;
    }
    
    if (mailgunMessageId) {
      updates.mailgun_message_id = mailgunMessageId;
    }

    return this.updateEmailSend(emailSendId, userId, updates);
  }

  /**
   * Get email send statistics for a user
   */
  static async getEmailSendStats(userId: string): Promise<{
    total: number;
    sent: number;
    failed: number;
    queued: number;
    recentSends: EmailSend[];
  }> {
    try {
      const { data, error } = await (supabase as any)
        .from('email_sends')
        .select('status, sent_at')
        .eq('user_id', userId);

      if (error) {
        throw new EmailSendError('Failed to fetch email send statistics', 'FETCH_ERROR', error);
      }

      const sends = data || [];
      const stats: any = {
        total: sends.length,
        sent: sends.filter((s: any) => s.status === 'sent' || s.status === 'delivered').length,
        failed: sends.filter((s: any) => s.status === 'failed' || s.status === 'bounced').length,
        queued: sends.filter((s: any) => s.status === 'queued' || s.status === 'sending').length,
        recentSends: []
      };

      // Get recent sends
      const recentSends = await this.getEmailSends(userId, 5);
      stats.recentSends = recentSends;

      return stats;
    } catch (error) {
      if (error instanceof EmailSendError) throw error;
      throw new EmailSendError('Unexpected error fetching email send statistics', 'UNKNOWN_ERROR', error);
    }
  }

  /**
   * Validate email send data
   */
  private static validateEmailSend(emailSend: Partial<EmailSendInsert>): void {
    const errors: string[] = [];

    // Validate subject
    if (emailSend.subject !== undefined) {
      if (!emailSend.subject || emailSend.subject.trim().length === 0) {
        errors.push('Email subject is required');
      }
    }

    // Validate recipients
    if (emailSend.recipients !== undefined) {
      if (!emailSend.recipients || typeof emailSend.recipients !== 'object') {
        errors.push('Recipients object is required');
      } else {
        const recipients = emailSend.recipients as EmailRecipients;
        
        if (!recipients.to || !Array.isArray(recipients.to) || recipients.to.length === 0) {
          errors.push('At least one recipient email address is required');
        } else {
          // Validate email addresses
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          
          for (const email of recipients.to) {
            if (!emailRegex.test(email)) {
              errors.push(`Invalid email address: ${email}`);
            }
          }

          if (recipients.cc) {
            for (const email of recipients.cc) {
              if (!emailRegex.test(email)) {
                errors.push(`Invalid CC email address: ${email}`);
              }
            }
          }

          if (recipients.bcc) {
            for (const email of recipients.bcc) {
              if (!emailRegex.test(email)) {
                errors.push(`Invalid BCC email address: ${email}`);
              }
            }
          }
        }
      }
    }

    // Validate status
    if (emailSend.status !== undefined) {
      const validStatuses: EmailSendStatus[] = ['queued', 'sending', 'sent', 'failed', 'bounced', 'delivered'];
      if (!validStatuses.includes(emailSend.status as EmailSendStatus)) {
        errors.push('Invalid email send status');
      }
    }

    if (errors.length > 0) {
      throw new EmailValidationError('Email send validation failed', errors);
    }
  }
}

// Utility functions
export function isValidEmailAddress(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function parseEmailAddresses(emailString: string): string[] {
  return emailString
    .split(/[,;]/)
    .map(email => email.trim())
    .filter(email => email.length > 0 && isValidEmailAddress(email));
}

export function formatEmailSendStatus(status: EmailSendStatus): string {
  const statusMap: Record<EmailSendStatus, string> = {
    queued: 'Queued',
    sending: 'Sending',
    sent: 'Sent',
    failed: 'Failed',
    bounced: 'Bounced',
    delivered: 'Delivered'
  };
  return statusMap[status] || status;
}

// Export the service as default
export default EmailSendService;