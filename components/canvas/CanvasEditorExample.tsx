'use client';

import { useState } from 'react';
import { CanvasEditor } from './CanvasEditor';
import { Template } from '@/lib/database.types';

/**
 * Example component demonstrating Canvas Editor with validation
 * This shows how to integrate the Canvas Editor in your application
 */
export function CanvasEditorExample() {
  const [template, setTemplate] = useState<Template>({
    id: 'example-1',
    user_id: 'user-1',
    name: 'Example Email Template',
    subject: 'Welcome to Compose',
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body>
  <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
    <tr>
      <td style="font-family: Arial, sans-serif; padding: 20px;">
        <h1 style="color: #333333; font-size: 24px; margin-bottom: 16px;">Welcome to Compose!</h1>
        <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
          This is an example email template with proper email client compatibility.
        </p>
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color: #3b82f6; padding: 12px 24px; border-radius: 4px;">
              <a href="https://example.com" style="color: #ffffff; text-decoration: none; font-weight: bold;">
                Get Started
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    template_type: 'custom',
    images: [],
    generation_prompt: null,
    validation_score: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const handleSave = async (updatedTemplate: Template) => {
    console.log('Saving template:', updatedTemplate);
    // In a real application, this would save to Supabase
    setTemplate(updatedTemplate);
  };

  const handleContentChange = (content: string) => {
    console.log('Content changed, length:', content.length);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Canvas Editor with Validation</h1>
        <p className="text-sm text-gray-600 mt-1">
          Edit your email template and see real-time validation feedback
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <CanvasEditor
          template={template}
          onSave={handleSave}
          onContentChange={handleContentChange}
        />
      </div>
    </div>
  );
}
