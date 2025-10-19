/**
 * CENTRAL CONFIG: Component & tool registration for Tambo AI
 * 
 * Simple HTML display component that updates the editor
 */

import { z } from 'zod';
import { InteractableEditor } from '@/components/tambo/interactable-editor';

// Register the interactable editor
export const components = [
  {
    name: 'CodeEditor',
    description: 'A code editor that can display and edit HTML/CSS content. Use this to show generated HTML/CSS code.',
    component: InteractableEditor,
    propsSchema: z.object({
      content: z.string().describe('HTML/CSS content to display in the editor'),
      language: z.string().default('html').describe('Programming language for syntax highlighting'),
    }),
  },
];

export const tools: any[] = [];

// Types for email templates
export interface EmailTemplateProps {
  subject: string;
  content: string;
  previewText?: string;
}
