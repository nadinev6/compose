'use client';

/**
 * Email Template Component
 * Registered in src/lib/tambo.ts for AI to dynamically render
 */

import type { EmailTemplateProps } from '../../lib/tambo';

export function EmailTemplate({ subject, content, previewText }: EmailTemplateProps) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Email Template</h3>
        {previewText && (
          <p className="text-sm text-gray-600 mt-1">{previewText}</p>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <div className="p-3 bg-gray-50 rounded border">
            {subject}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content Preview
          </label>
          <div 
            className="p-4 bg-gray-50 rounded border min-h-[200px]"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
}