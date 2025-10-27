'use client';

/**
 * Chat Page - Tambo MessageThreadFull + Canvas Space
 * Exactly as shown in the reference image
 */

import { TamboProvider } from '@tambo-ai/react';
import { MessageThreadFullCustom } from '@/components/tambo/message-thread-full-custom';
import { InteractableEditor } from '@/components/tambo/interactable-editor';
import { CanvasEditor } from '@/components/canvas/CanvasEditor';
import { components, tools } from '@/src/lib/tambo';
import { useState, useEffect, createContext, useContext } from 'react';
import { Template } from '@/lib/database.types';

// Create a context for sharing editor content between components
const EditorContext = createContext<{
  content: string;
  setContent: (content: string) => void;
}>({
  content: '',
  setContent: () => {},
});

function CanvasWithEditor() {
  const { content, setContent } = useContext(EditorContext);
  
  // Create a template object for the CanvasEditor
  const template: Template = {
    id: 'chat-template',
    name: 'Chat Template',
    html: content,
    user_id: 'chat-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    validation_score: null
  };

  const handleSave = async (updatedTemplate: Template) => {
    // Update the content in the context
    setContent(updatedTemplate.html || '');
    console.log('Template saved:', updatedTemplate.html?.substring(0, 50) + '...');
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className="h-full">
      <CanvasEditor
        template={template}
        onSave={handleSave}
        onContentChange={handleContentChange}
      />
    </div>
  );
}

export default function ChatPage() {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;
  const [leftWidth, setLeftWidth] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  // No callback setup needed - InteractableEditor handles updates directly

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setLeftWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Add event listeners for resizing
  useEffect(() => {
    const handleMove = (e: MouseEvent) => handleMouseMove(e);
    const handleUp = () => handleMouseUp();
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isResizing, leftWidth]);

  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <h1 style={{ color: 'var(--color-text-primary)', fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-4)' }}>
            Configuration Required
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-4)' }}>
            Please set NEXT_PUBLIC_TAMBO_API_KEY in your environment variables.
          </p>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
            Once configured, you'll be able to chat with AI to generate email templates.
          </p>
        </div>
      </div>
    );
  }

  return (
    <EditorContext.Provider value={{ content: editorContent, setContent: setEditorContent }}>
      <TamboProvider 
        apiKey={apiKey}
        components={components}
        tools={tools}
      >
        <div style={{ 
          display: 'flex', 
          height: '100vh',
          backgroundColor: 'var(--color-background)',
          position: 'relative'
        }}>
          {/* Tambo MessageThreadFull - Resizable left side */}
          <div style={{ 
            width: `${leftWidth}%`,
            minWidth: 0,
            backgroundColor: 'var(--color-surface)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <MessageThreadFullCustom 
              defaultCollapsed={false}
            />
          </div>
          
          {/* Resizable Handle */}
          <div
            className={`resize-handle ${isResizing ? 'resizing' : ''}`}
            onMouseDown={handleMouseDown}
          />
          
          {/* Canvas Space - Resizable right side */}
          <div 
            data-canvas-space="true"
            style={{ 
              flex: 1,
              minWidth: 0,
              backgroundColor: 'var(--color-surface)',
              overflow: 'hidden'
            }}
          >
            <CanvasWithEditor />
          </div>
        </div>
      </TamboProvider>
    </EditorContext.Provider>
  );
}