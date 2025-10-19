'use client';

import { useEffect } from 'react';

interface HtmlDisplayProps {
  html: string;
  title?: string;
}

// Global callback for updating the editor
let globalEditorCallback: ((content: string) => void) | null = null;

export function setGlobalEditorCallback(callback: (content: string) => void) {
  globalEditorCallback = callback;
}

export function HtmlDisplay({ html, title }: HtmlDisplayProps) {
  // Update the editor when this component renders
  useEffect(() => {
    if (globalEditorCallback && html) {
      globalEditorCallback(html);
    }
  }, [html]);

  return (
    <div className="my-4 p-4 border rounded-lg" style={{ 
      backgroundColor: 'var(--card)',
      borderColor: 'var(--border)'
    }}>
      {title && (
        <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
          {title}
        </h3>
      )}
      <div className="mb-3">
        <div className="text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>
          Generated HTML:
        </div>
        <pre className="text-xs p-3 rounded overflow-x-auto" style={{ 
          backgroundColor: 'var(--muted)',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-mono)',
          maxHeight: '200px'
        }}>
          {html}
        </pre>
      </div>
      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
        ✨ Code sent to editor automatically
      </div>
    </div>
  );
}