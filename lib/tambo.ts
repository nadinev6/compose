/**
 * Tambo AI type definitions and utilities
 * 
 * Note: The @tambo-ai/react package is not yet installed.
 * See TAMBO_SETUP.md for installation instructions.
 */

import { Template } from './database.types';

/**
 * EmailTemplate type for Tambo AI integration
 * This extends the database Template type with additional fields
 */
export interface EmailTemplate extends Omit<Template, 'metadata'> {
  validation_score?: number;
  generation_prompt?: string;
  template_type?: string;
  images?: string[];
}

/**
 * Message type for Tambo AI chat
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Tambo AI configuration
 */
export interface TamboConfig {
  apiKey: string;
  userId: string;
  conversationId?: string;
}

/**
 * Placeholder for Tambo AI components
 * These will be imported from @tambo-ai/react once the package is installed
 */
export interface TamboMessageThreadProps {
  apiKey: string;
  userId: string;
  conversationId?: string;
  onMessageSent?: (message: Message) => void;
  onTemplateGenerated?: (template: EmailTemplate) => void;
  theme?: 'light' | 'dark';
}

export interface TamboCanvasProps {
  content: string;
  onContentChange?: (content: string) => void;
  readOnly?: boolean;
  theme?: 'light' | 'dark';
}

/**
 * Email constraints for validation
 */
export const EMAIL_CONSTRAINTS = {
  MAX_WIDTH: 600,
  MAX_FILE_SIZE: 102400, // 100KB
  ALLOWED_TAGS: ['table', 'tr', 'td', 'div', 'span', 'p', 'a', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'br'],
  REQUIRED_INLINE_STYLES: true,
  SUPPORTED_CSS_PROPERTIES: [
    'color', 'background-color', 'font-size', 'font-family', 'font-weight',
    'text-align', 'padding', 'margin', 'border', 'width', 'height'
  ]
};
