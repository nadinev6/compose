/**
 * Data access layer for Supabase database operations
 * Provides CRUD functions for templates and email sends
 */

import { supabase } from './supabase';
import type {
  Template,
  TemplateInsert,
  TemplateUpdate,
  EmailSend,
  EmailSendInsert,
  EmailSendUpdate,
  TemplateStats,
} from './database.types';

/**
 * Custom error class for data access errors
 */
export class DataAccessError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DataAccessError';
  }
}

// ============================================================================
// Template CRUD Operations
// ============================================================================

/**
 * Get all templates for the current user
 * @param userId - The user ID to fetch templates for
 * @returns Array of templates
 */
export async function getTemplates(userId: string): Promise<Template[]> {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new DataAccessError(
        'Failed to fetch templates',
        error.code,
        error
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    throw new DataAccessError(
      'Unexpected error fetching templates',
      undefined,
      error
    );
  }
}

/**
 * Get a single template by ID
 * @param templateId - The template ID to fetch
 * @param userId - The user ID (for RLS verification)
 * @returns The template or null if not found
 */
export async function getTemplateById(
  templateId: string,
  userId: string
): Promise<Template | null> {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new DataAccessError(
        'Failed to fetch template',
        error.code,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    throw new DataAccessError(
      'Unexpected error fetching template',
      undefined,
      error
    );
  }
}

/**
 * Create a new template
 * @param template - The template data to insert
 * @returns The created template
 */
export async function createTemplate(
  template: TemplateInsert
): Promise<Template> {
  try {
    // Validate required fields
    if (!template.user_id || !template.name || !template.subject || !template.html) {
      throw new DataAccessError(
        'Missing required fields: user_id, name, subject, and html are required',
        'VALIDATION_ERROR'
      );
    }

    const { data, error } = await supabase
      .from('templates')
      .insert(template as any)
      .select()
      .single();

    if (error) {
      throw new DataAccessError(
        'Failed to create template',
        error.code,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    throw new DataAccessError(
      'Unexpected error creating template',
      undefined,
      error
    );
  }
}

/**
 * Update an existing template
 * @param templateId - The template ID to update
 * @param userId - The user ID (for RLS verification)
 * @param updates - The fields to update
 * @returns The updated template
 */
export async function updateTemplate(
  templateId: string,
  userId: string,
  updates: TemplateUpdate
): Promise<Template> {
  try {
    const { data, error } = await ((supabase
      .from('templates') as any)
      .update(updates)
      .eq('id', templateId)
      .eq('user_id', userId)
      .select()
      .single());

    if (error) {
      if (error.code === 'PGRST116') {
        throw new DataAccessError(
          'Template not found or access denied',
          'NOT_FOUND'
        );
      }
      throw new DataAccessError(
        'Failed to update template',
        error.code,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    throw new DataAccessError(
      'Unexpected error updating template',
      undefined,
      error
    );
  }
}

/**
 * Delete a template
 * @param templateId - The template ID to delete
 * @param userId - The user ID (for RLS verification)
 * @returns True if deleted successfully
 */
export async function deleteTemplate(
  templateId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', userId);

    if (error) {
      throw new DataAccessError(
        'Failed to delete template',
        error.code,
        error
      );
    }

    return true;
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    throw new DataAccessError(
      'Unexpected error deleting template',
      undefined,
      error
    );
  }
}

/**
 * Get template statistics
 * @param userId - The user ID to fetch stats for
 * @returns Array of template statistics
 */
export async function getTemplateStats(userId: string): Promise<TemplateStats[]> {
  try {
    const { data, error } = await supabase
      .from('template_stats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new DataAccessError(
        'Failed to fetch template statistics',
        error.code,
        error
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    throw new DataAccessError(
      'Unexpected error fetching template statistics',
      undefined,
      error
    );
  }
}

// ============================================================================
// Email Send CRUD Operations
// ============================================================================

/**
 * Get all email sends for the current user
 * @param userId - The user ID to fetch email sends for
 * @param limit - Optional limit on number of results
 * @returns Array of email sends
 */
export async function getEmailSends(
  userId: string,
  limit?: number
): Promise<EmailSend[]> {
  try {
    let query = supabase
      .from('email_sends')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new DataAccessError(
        'Failed to fetch email sends',
        error.code,
        error
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    throw new DataAccessError(
      'Unexpected error fetching email sends',
      undefined,
      error
    );
  }
}

/**
 * Get a single email send by ID
 * @param sendId - The email send ID to fetch
 * @param userId - The user ID (for RLS verification)
 * @returns The email send or null if not found
 */
export async function getEmailSendById(
  sendId: string,
  userId: string
): Promise<EmailSend | null> {
  try {
    const { data, error } = await supabase
      .from('email_sends')
      .select('*')
      .eq('id', sendId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new DataAccessError(
        'Failed to fetch email send',
        error.code,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    throw new DataAccessError(
      'Unexpected error fetching email send',
      undefined,
      error
    );
  }
}

/**
 * Create a new email send record
 * @param emailSend - The email send data to insert
 * @returns The created email send
 */
export async function createEmailSend(
  emailSend: EmailSendInsert
): Promise<EmailSend> {
  try {
    // Validate required fields
    if (!emailSend.user_id || !emailSend.subject || !emailSend.recipients) {
      throw new DataAccessError(
        'Missing required fields: user_id, subject, and recipients are required',
        'VALIDATION_ERROR'
      );
    }

    // Validate recipients structure
    if (!emailSend.recipients.to || emailSend.recipients.to.length === 0) {
      throw new DataAccessError(
        'At least one recipient in "to" field is required',
        'VALIDATION_ERROR'
      );
    }

    const { data, error } = await supabase
      .from('email_sends')
      .insert(emailSend as any)
      .select()
      .single();

    if (error) {
      throw new DataAccessError(
        'Failed to create email send record',
        error.code,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    throw new DataAccessError(
      'Unexpected error creating email send record',
      undefined,
      error
    );
  }
}

/**
 * Update an email send record (typically for status updates)
 * @param sendId - The email send ID to update
 * @param userId - The user ID (for RLS verification)
 * @param updates - The fields to update
 * @returns The updated email send
 */
export async function updateEmailSend(
  sendId: string,
  userId: string,
  updates: EmailSendUpdate
): Promise<EmailSend> {
  try {
    const { data, error } = await ((supabase
      .from('email_sends') as any)
      .update(updates)
      .eq('id', sendId)
      .eq('user_id', userId)
      .select()
      .single());

    if (error) {
      if (error.code === 'PGRST116') {
        throw new DataAccessError(
          'Email send not found or access denied',
          'NOT_FOUND'
        );
      }
      throw new DataAccessError(
        'Failed to update email send',
        error.code,
        error
      );
    }

    return data;
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    throw new DataAccessError(
      'Unexpected error updating email send',
      undefined,
      error
    );
  }
}

/**
 * Get email sends for a specific template
 * @param templateId - The template ID to fetch sends for
 * @param userId - The user ID (for RLS verification)
 * @returns Array of email sends
 */
export async function getEmailSendsByTemplate(
  templateId: string,
  userId: string
): Promise<EmailSend[]> {
  try {
    const { data, error } = await supabase
      .from('email_sends')
      .select('*')
      .eq('template_id', templateId)
      .eq('user_id', userId)
      .order('sent_at', { ascending: false });

    if (error) {
      throw new DataAccessError(
        'Failed to fetch email sends for template',
        error.code,
        error
      );
    }

    return data || [];
  } catch (error) {
    if (error instanceof DataAccessError) {
      throw error;
    }
    throw new DataAccessError(
      'Unexpected error fetching email sends for template',
      undefined,
      error
    );
  }
}
