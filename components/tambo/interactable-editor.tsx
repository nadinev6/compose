'use client';

import { withInteractable } from '@tambo-ai/react';
import { z } from 'zod';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading editor...</div>
});

// Schema for the editor props
const editorSchema = z.object({
  content: z.string().describe('HTML/CSS content to display in the editor'),
  language: z.string().default('html').describe('Programming language for syntax highlighting'),
});

interface EditorProps {
  content: string;
  language?: string;
  onContentChange?: (content: string) => void;
}

function Editor({ content, language = 'html', onContentChange }: EditorProps) {
  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        defaultLanguage={language}
        value={content}
        onChange={(value) => onContentChange?.(value || '')}
        theme="vs-light"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}

// Make the editor interactable with Tambo
export const InteractableEditor = withInteractable(Editor, {
  componentName: 'CodeEditor',
  description: 'A code editor that can display and edit HTML/CSS content',
  propsSchema: editorSchema,
});

export type InteractableEditorProps = z.infer<typeof editorSchema>;