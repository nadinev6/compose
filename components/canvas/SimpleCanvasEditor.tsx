'use client';

/**
 * Simple Canvas Editor Component
 * Basic HTML editor with preview (simplified version for MVP)
 */

import { useState, useEffect } from 'react';
import { EmailValidator } from '@/lib/email-validation';
import type { Template } from '@/lib/database.types';

interface SimpleCanvasEditorProps {
  template: Template;
  onSave?: (html: string) => void;
  onValidationChange?: (isValid: boolean, score: number) => void;
}

export function SimpleCanvasEditor({ 
  template, 
  onSave,
  onValidationChange 
}: SimpleCanvasEditorProps) {
  const [html, setHtml] = useState(template.html);
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Validate on HTML change
  useEffect(() => {
    const result = EmailValidator.validate(html);
    setValidationResult(result);
    
    if (onValidationChange) {
      onValidationChange(result.isValid, result.score);
    }
  }, [html, onValidationChange]);

  const handleSave = async () => {
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(html);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'visual'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Visual Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'code'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            HTML Code
          </button>
        </div>
        
        {validationResult && (
          <div className="flex items-center space-x-4">
            <div className={`text-sm font-medium ${
              validationResult.score >= 80 ? 'text-green-600' :
              validationResult.score >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              Score: {validationResult.score}/100
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'visual' ? (
        <div className="border border-gray-200 rounded-lg p-4 bg-white min-h-[500px]">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            className="w-full h-[500px] p-4 font-mono text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
          />
        </div>
      )}

      {/* Validation Messages */}
      {validationResult && validationResult.errors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Validation Issues</h4>
          <ul className="space-y-1 text-sm text-yellow-800">
            {validationResult.errors.slice(0, 5).map((error: any, index: number) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
          {validationResult.errors.length > 5 && (
            <p className="text-sm text-yellow-700 mt-2">
              And {validationResult.errors.length - 5} more issues...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
