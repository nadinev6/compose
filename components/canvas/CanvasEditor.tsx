'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { EmailValidator, ValidationResult } from '@/lib/email-validation';
import { Template } from '@/lib/database.types';

interface CanvasEditorProps {
  template: Template;
  onSave: (template: Template) => Promise<void>;
  onContentChange?: (content: string) => void;
}

type TabType = 'visual' | 'code';
type PreviewMode = 'desktop' | 'tablet' | 'mobile';

export function CanvasEditor({ template, onSave, onContentChange }: CanvasEditorProps) {
  const [content, setContent] = useState(template.html || '');
  const [activeTab, setActiveTab] = useState<TabType>('code');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showValidationPanel, setShowValidationPanel] = useState(true);

  // Validate on content change
  useEffect(() => {
    if (content) {
      const result = EmailValidator.validate(content);
      setValidationResult(result);
    }
  }, [content]);

  // Auto-save with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== template.html && content.trim() !== '') {
        handleSave();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [content, template.html]);

  const handleContentChange = (value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    onContentChange?.(newContent);
  };

  const handleSave = async () => {
    if (!validationResult) return;

    // Prevent saving if there are critical errors
    const criticalErrors = validationResult.errors.filter(e => e.type === 'error');
    if (criticalErrors.length > 0) {
      console.warn('Cannot save template with critical errors');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        ...template,
        html: content,
        validation_score: validationResult.score
      });
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
      default:
        return '100%';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="canvas-editor flex flex-col h-full">
      {/* Header with tabs and validation score */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'code'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'visual'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Validation Score Display */}
        {validationResult && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowValidationPanel(!showValidationPanel)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {showValidationPanel ? 'Hide' : 'Show'} Validation
            </button>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getScoreBgColor(
                validationResult.score
              )}`}
            >
              <span className="text-sm font-medium text-gray-700">Compatibility Score:</span>
              <span className={`text-lg font-bold ${getScoreColor(validationResult.score)}`}>
                {validationResult.score}/100
              </span>
            </div>
            {isSaving && (
              <span className="text-sm text-gray-500">Saving...</span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor/Preview Area */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'code' ? (
            <div className="flex-1">
              <Editor
                height="100%"
                language="html"
                value={content}
                onChange={handleContentChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                }}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-gray-100 p-4">
              {/* Preview Controls */}
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    previewMode === 'mobile'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Mobile
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    previewMode === 'tablet'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Tablet
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    previewMode === 'desktop'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Desktop
                </button>
              </div>

              {/* Preview Frame */}
              <div className="flex-1 flex justify-center items-start overflow-auto">
                <div
                  className="bg-white shadow-lg transition-all duration-300"
                  style={{
                    width: getPreviewWidth(),
                    maxWidth: '100%',
                    minHeight: '400px',
                  }}
                >
                  <iframe
                    srcDoc={content}
                    className="w-full h-full border-0"
                    style={{ minHeight: '600px' }}
                    title="Email Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Validation Panel */}
        {showValidationPanel && validationResult && (
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Validation Results</h3>

              {/* Summary */}
              <div className={`p-3 rounded-lg mb-4 ${getScoreBgColor(validationResult.score)}`}>
                <p className="text-sm font-medium">
                  {EmailValidator.getValidationSummary(validationResult)}
                </p>
              </div>

              {/* Errors */}
              {validationResult.errors.filter(e => e.type === 'error').length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                    Errors ({validationResult.errors.filter(e => e.type === 'error').length})
                  </h4>
                  <div className="space-y-2">
                    {validationResult.errors
                      .filter(e => e.type === 'error')
                      .map((error, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 border border-red-200 rounded text-sm"
                        >
                          <p className="font-medium text-red-900 mb-1">{error.message}</p>
                          {error.suggestion && (
                            <p className="text-red-700 text-xs mt-1">
                              💡 {error.suggestion}
                            </p>
                          )}
                          <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                            {error.category}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-yellow-600 mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full"></span>
                    Warnings ({validationResult.warnings.length})
                  </h4>
                  <div className="space-y-2">
                    {validationResult.warnings.map((warning, index) => (
                      <div
                        key={index}
                        className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm"
                      >
                        <p className="font-medium text-yellow-900 mb-1">{warning.message}</p>
                        {warning.suggestion && (
                          <p className="text-yellow-700 text-xs mt-1">
                            💡 {warning.suggestion}
                          </p>
                        )}
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                          {warning.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success State */}
              {validationResult.errors.filter(e => e.type === 'error').length === 0 &&
                validationResult.warnings.length === 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-sm font-medium text-green-900">
                      Perfect! Your email template is fully compatible.
                    </p>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
