/**
 * Database type definitions for Supabase
 * Generated from the database schema
 */

export type EmailSendStatus = 'queued' | 'sending' | 'sent' | 'failed' | 'bounced' | 'delivered';
export type TemplateType = 'marketing' | 'transactional' | 'newsletter';

export interface TemplateMetadata {
  templateType: TemplateType;
  imageUrls: string[];
  generationPrompt: string;
  [key: string]: any;
}

export interface EmailRecipients {
  to: string[];
  cc?: string[];
  bcc?: string[];
}

export interface Database {
  public: {
    Tables: {
      templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          html: string;
          subject: string | null;
          metadata: TemplateMetadata;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          html: string;
          subject?: string | null;
          metadata?: TemplateMetadata;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          html?: string;
          subject?: string | null;
          metadata?: TemplateMetadata;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_sends: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          recipients: EmailRecipients;
          subject: string;
          status: EmailSendStatus;
          mailgun_message_id: string | null;
          sent_at: string;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id?: string | null;
          recipients: EmailRecipients;
          subject: string;
          status?: EmailSendStatus;
          mailgun_message_id?: string | null;
          sent_at?: string;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string | null;
          recipients?: EmailRecipients;
          subject?: string;
          status?: EmailSendStatus;
          mailgun_message_id?: string | null;
          sent_at?: string;
          error_message?: string | null;
        };
      };
    };
    Views: {
      template_stats: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          updated_at: string;
          send_count: number;
          successful_sends: number;
          failed_sends: number;
          last_sent_at: string | null;
        };
      };
    };
    Functions: {
      create_example_templates: {
        Args: {
          target_user_id: string;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for working with the database
export type Template = Database['public']['Tables']['templates']['Row'];
export type TemplateInsert = Database['public']['Tables']['templates']['Insert'];
export type TemplateUpdate = Database['public']['Tables']['templates']['Update'];

export type EmailSend = Database['public']['Tables']['email_sends']['Row'];
export type EmailSendInsert = Database['public']['Tables']['email_sends']['Insert'];
export type EmailSendUpdate = Database['public']['Tables']['email_sends']['Update'];

export type TemplateStats = Database['public']['Views']['template_stats']['Row'];