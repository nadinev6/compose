/**
 * Database type definitions for Supabase
 * Generated from the database schema
 */

export type EmailSendStatus = 'pending' | 'sent' | 'failed';

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
          subject: string;
          html: string;
          template_type: string;
          images: string[];
          generation_prompt: string | null;
          validation_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          subject: string;
          html: string;
          template_type?: string;
          images?: string[];
          generation_prompt?: string | null;
          validation_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          subject?: string;
          html?: string;
          template_type?: string;
          images?: string[];
          generation_prompt?: string | null;
          validation_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      email_sends: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          subject: string;
          recipients: EmailRecipients;
          status: EmailSendStatus;
          mailgun_message_id: string | null;
          error_message: string | null;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id?: string | null;
          subject: string;
          recipients: EmailRecipients;
          status?: EmailSendStatus;
          mailgun_message_id?: string | null;
          error_message?: string | null;
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string | null;
          subject?: string;
          recipients?: EmailRecipients;
          status?: EmailSendStatus;
          mailgun_message_id?: string | null;
          error_message?: string | null;
          sent_at?: string;
          created_at?: string;
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
      [_ in never]: never;
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

// Re-export for convenience
export type { Database };