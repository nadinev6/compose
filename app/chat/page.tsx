'use client';

/**
 * Chat Page - Tambo MessageThreadFull + Canvas Space
 * Exactly as shown in the reference image
 */

import { TamboProvider } from '@tambo-ai/react';
import { MessageThreadFullCustom } from '@/components/tambo/message-thread-full-custom';
import { InteractableEditor } from '@/components/tambo/interactable-editor';
import { components, tools } from '@/src/lib/tambo';
import { useState, useEffect, createContext, useContext } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading editor...</div>
});

// Create a context for sharing editor content between components
const EditorContext = createContext<{
  content: string;
  setContent: (content: string) => void;
}>({
  content: '',
  setContent: () => {},
});

function CanvasWithEditor() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'code'>('canvas');
  const [deviceSize, setDeviceSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const { content, setContent } = useContext(EditorContext);
  


  return (
    <div className="h-full flex flex-col" style={{ 
      backgroundColor: 'var(--color-surface)',
      borderColor: 'var(--color-border)'
    }}>
      {/* Tab Navigation with Device Size Controls */}
      <div className="flex justify-between items-center" style={{ 
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        padding: '0 16px'
      }}>
        {/* Tab Buttons */}
        <div className="flex">
          <button
            onClick={() => setActiveTab('canvas')}
            className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderBottomColor: activeTab === 'canvas' ? 'var(--color-text-selected)' : 'transparent',
              backgroundColor: activeTab === 'canvas' ? 'var(--color-surface-selected)' : 'transparent',
              color: activeTab === 'canvas' ? 'var(--color-text-selected)' : 'var(--color-text-secondary)',
            }}
          >
            Canvas
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            style={{
              borderBottomColor: activeTab === 'code' ? 'var(--color-text-selected)' : 'transparent',
              backgroundColor: activeTab === 'code' ? 'var(--color-surface-selected)' : 'transparent',
              color: activeTab === 'code' ? 'var(--color-text-selected)' : 'var(--color-text-secondary)',
            }}
          >
            Code
          </button>
        </div>

        {/* Device Size Controls - Only show in Canvas tab */}
        {activeTab === 'canvas' && (
          <div className="flex gap-2">
            <button
              onClick={() => setDeviceSize('desktop')}
              className="px-3 py-1 text-xs rounded transition-colors"
              style={{
                backgroundColor: deviceSize === 'desktop' ? 'var(--accent)' : 'transparent',
                color: deviceSize === 'desktop' ? 'var(--accent-foreground)' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)'
              }}
            >
              Desktop
            </button>
            <button
              onClick={() => setDeviceSize('tablet')}
              className="px-3 py-1 text-xs rounded transition-colors"
              style={{
                backgroundColor: deviceSize === 'tablet' ? 'var(--accent)' : 'transparent',
                color: deviceSize === 'tablet' ? 'var(--accent-foreground)' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)'
              }}
            >
              Tablet
            </button>
            <button
              onClick={() => setDeviceSize('mobile')}
              className="px-3 py-1 text-xs rounded transition-colors"
              style={{
                backgroundColor: deviceSize === 'mobile' ? 'var(--accent)' : 'transparent',
                color: deviceSize === 'mobile' ? 'var(--accent-foreground)' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)'
              }}
            >
              Mobile
            </button>
          </div>
        )}
      </div>

      {/* Always render InteractableEditor for Tambo to control */}
      <div className="flex-1 overflow-hidden relative">
        <div 
          className="absolute inset-0"
          style={{ 
            visibility: activeTab === 'code' ? 'visible' : 'hidden',
            zIndex: activeTab === 'code' ? 1 : -1
          }}
        >
          <InteractableEditor
            content={content}
            language="html"
            onContentChange={(newContent) => {
              console.log('Content changed:', newContent.substring(0, 50) + '...');
              setContent(newContent);
            }}
          />
        </div>
        
        {activeTab === 'canvas' && (
          <div className="absolute inset-0 flex flex-col" style={{ 
            backgroundColor: 'var(--background)',
            zIndex: 1
          }}>


            
            {/* Device Preview Area */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              {(() => {
                const deviceStyles = {
                  desktop: { width: '100%', maxWidth: '1200px', height: '100%' },
                  tablet: { width: '600px', height: '800px' },
                  mobile: { width: '320px', height: '568px' }
                };

                const frameStyles = {
                  desktop: {},
                  tablet: {
                    border: '8px solid white',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  },
                  mobile: {
                    border: '6px solid white',
                    borderRadius: '18px',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    position: 'relative'
                  }
                };

                return (
                  <div 
                    className="email-preview-container"
                    style={{
                      ...deviceStyles[deviceSize],
                      ...frameStyles[deviceSize],
                      minHeight: deviceSize === 'desktop' ? '600px' : 'auto'
                    }}
                  >
                    {/* Home indicator for mobile */}
                    {deviceSize === 'mobile' && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '30px',
                        height: '2px',
                        backgroundColor: '#ddd',
                        borderRadius: '1px'
                      }} />
                    )}
                    
                    <div 
                      className="email-preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'white',
                        borderRadius: deviceSize === 'desktop' ? '8px' : '10px',
                        overflow: 'hidden'
                      }}
                    >
                      {content ? (
                        <iframe
                          srcDoc={(() => {
                            // Handle full HTML documents with DOCTYPE
                            if (content.includes('<!DOCTYPE') || content.includes('<html')) {
                              // Extract head and body content to preserve styles
                              const headMatch = content.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
                              const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                              
                              if (headMatch && bodyMatch) {
                                return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${headMatch[1]}</head><body>${bodyMatch[1]}</body></html>`;
                              }
                              return content;
                            }
                            return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body>${content}</body></html>`;
                          })()}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          title="Email Preview"
                        />
                      ) : (
                        <div style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
                          No content to preview
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
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