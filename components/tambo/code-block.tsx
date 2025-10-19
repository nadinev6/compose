'use client';

import { z } from 'zod';
import { useContext, useEffect } from 'react';

// Schema for the code block
const codeBlockSchema = z.object({
  content: z.string().describe('HTML/CSS content to display and send to the editor'),
  language: z.string().default('html').describe('Programming language'),
  title: z.string().optional().describe('Optional title for the code block'),
});

interface CodeBlockComponentProps {
  content: string;
  language?: string;
  title?: string;
}

// Global callback for updating the editor
let globalEditorCallback: ((content: string) => void) | null = null;

export function setEditorCallback(callback: (content: string) => void) {
  globalEditorCallback = callback;
}

export function CodeBlock({ content, language = 'html', title }: CodeBlockComponentProps) {
  // Update the editor when this component renders
  useEffect(() => {
    if (globalEditorCallback && content) {
      globalEditorCallback(content);
    }
  }, [content]);

  return (
    <div className="my-4 border rounded-lg overflow-hidden" style={{ 
      backgroundColor: 'var(--card)',
      borderColor: 'var(--border)'
    }}>
      {title && (
        <div className="px-4 py-2 border-b" style={{ 
          backgroundColor: 'var(--muted)',
          borderColor: 'var(--border)'
        }}>
          <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            {title}
          </h3>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
            {language.toUpperCase()}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(content);
            }}
            className="text-xs px-2 py-1 rounded"
            style={{ 
              backgroundColor: 'var(--secondary)',
              color: 'var(--secondary-foreground)'
            }}
          >
            Copy
          </button>
        </div>
        <pre className="text-sm overflow-x-auto" style={{ 
          backgroundColor: 'var(--muted)',
          color: 'var(--foreground)',
          padding: '12px',
          borderRadius: '6px',
          fontFamily: 'var(--font-mono)'
        }}>
          <code>{content}</code>
        </pre>
        <div className="mt-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          ✨ Code automatically sent to editor
        </div>
      </div>
    </div>
  );
}

export { codeBlockSchema };
export type CodeBlockProps = z.infer<typeof codeBlockSchema>;