/**
 * Combined data access layer
 * Centralized access to all database operations with error handling and retry logic
 */

import { supabase } from './supabase';
import TemplateService, { TemplateError, ValidationError } from './templates';
import EmailSendService, { EmailSendError, EmailValidationError } from './email-sends';
import type { Template, EmailSend, TemplateStats } from './database.types';

// Re-export services and types
export { TemplateService, EmailSendService };
export { TemplateError, ValidationError, EmailSendError, EmailValidationError };
export type { Template, EmailSend, TemplateStats };

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000,  // 5 seconds
};

// Generic retry function
async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Don't retry validation errors or user errors
    if (error instanceof ValidationError || 
        error instanceof EmailValidationError ||
        error?.code === 'PGRST116' || // Not found
        error?.code === '23505') {    // Unique constraint violation
      throw error;
    }

    if (retries > 0) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * (RETRY_CONFIG.maxRetries - retries + 1),
        RETRY_CONFIG.maxDelay
      );
      
      console.warn(`Operation failed, retrying in ${delay}ms. Retries left: ${retries}`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, retries - 1);
    }
    
    throw error;
  }
}

// Enhanced data access layer with retry logic
export class DataAccessLayer {
  // Template operations with retry
  static async getTemplates(userId: string): Promise<Template[]> {
    return withRetry(() => TemplateService.getTemplates(userId));
  }

  static async getTemplate(templateId: string, userId: string): Promise<Template | null> {
    return withRetry(() => TemplateService.getTemplate(templateId, userId));
  }

  static async createTemplate(template: Parameters<typeof TemplateService.createTemplate>[0]): Promise<Template> {
    return withRetry(() => TemplateService.createTemplate(template));
  }

  static async updateTemplate(
    templateId: string, 
    userId: string, 
    updates: Parameters<typeof TemplateService.updateTemplate>[2]
  ): Promise<Template> {
    return withRetry(() => TemplateService.updateTemplate(templateId, userId, updates));
  }

  static async deleteTemplate(templateId: string, userId: string): Promise<void> {
    return withRetry(() => TemplateService.deleteTemplate(templateId, userId));
  }

  static async searchTemplates(userId: string, query: string): Promise<Template[]> {
    return withRetry(() => TemplateService.searchTemplates(userId, query));
  }

  static async duplicateTemplate(templateId: string, userId: string, newName?: string): Promise<Template> {
    return withRetry(() => TemplateService.duplicateTemplate(templateId, userId, newName));
  }

  static async getTemplateStats(userId: string): Promise<TemplateStats[]> {
    return withRetry(() => TemplateService.getTemplateStats(userId));
  }

  static async createExampleTemplates(userId: string): Promise<void> {
    return withRetry(() => TemplateService.createExampleTemplates(userId));
  }

  // Email send operations with retry
  static async getEmailSends(userId: string, limit?: number): Promise<EmailSend[]> {
    return withRetry(() => EmailSendService.getEmailSends(userId, limit));
  }

  static async getEmailSendsForTemplate(templateId: string, userId: string): Promise<EmailSend[]> {
    return withRetry(() => EmailSendService.getEmailSendsForTemplate(templateId, userId));
  }

  static async getEmailSend(emailSendId: string, userId: string): Promise<EmailSend | null> {
    return withRetry(() => EmailSendService.getEmailSend(emailSendId, userId));
  }

  static async createEmailSend(emailSend: Parameters<typeof EmailSendService.createEmailSend>[0]): Promise<EmailSend> {
    return withRetry(() => EmailSendService.createEmailSend(emailSend));
  }

  static async updateEmailSendStatus(
    emailSendId: string, 
    userId: string, 
    status: Parameters<typeof EmailSendService.updateEmailSendStatus>[2],
    errorMessage?: string,
    mailgunMessageId?: string
  ): Promise<EmailSend> {
    return withRetry(() => EmailSendService.updateEmailSendStatus(
      emailSendId, userId, status, errorMessage, mailgunMessageId
    ));
  }

  static async getEmailSendStats(userId: string): Promise<ReturnType<typeof EmailSendService.getEmailSendStats>> {
    return withRetry(() => EmailSendService.getEmailSendStats(userId));
  }

  // Health check
  static async healthCheck(): Promise<{ database: boolean; timestamp: Date }> {
    try {
      const { error } = await supabase.from('templates').select('count').limit(1);
      return {
        database: !error,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        database: false,
        timestamp: new Date()
      };
    }
  }

  // Batch operations
  static async batchDeleteTemplates(templateIds: string[], userId: string): Promise<void> {
    const deletePromises = templateIds.map(id => this.deleteTemplate(id, userId));
    await Promise.all(deletePromises);
  }

  // Dashboard data - get everything needed for the main dashboard
  static async getDashboardData(userId: string): Promise<{
    templates: Template[];
    recentEmailSends: EmailSend[];
    templateStats: TemplateStats[];
    emailSendStats: Awaited<ReturnType<typeof EmailSendService.getEmailSendStats>>;
  }> {
    try {
      const [templates, recentEmailSends, templateStats, emailSendStats] = await Promise.all([
        this.getTemplates(userId),
        this.getEmailSends(userId, 10),
        this.getTemplateStats(userId),
        this.getEmailSendStats(userId)
      ]);

      return {
        templates,
        recentEmailSends,
        templateStats,
        emailSendStats
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}

// Export as default
export default DataAccessLayer;