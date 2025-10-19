'use client';

/**
 * Email Sender Component for Tambo AI
 * Handles email sending workflow within the chat interface
 */

import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { EmailTemplate } from '@/lib/tambo';
import { EmailRecipients } from '@/lib/database.types';
import { parseEmailAddresses, isValidEmailAddress } from '@/lib/email-sends';
import { EmailValidator } from '@/lib/email-validation';

interface EmailSenderComponentProps {
  template: EmailTemplate;
  user: User;
  session: Session | null;
  onSendComplete: (result: EmailSendResult) => void;
  onCancel?: () => void;
}

interface EmailSendResult {
  success: boolean;
  sendId?: string;
  mailgunMessageId?: string;
  error?: string;
  recipients: EmailRecipients;
  subject: string;
}

export default function EmailSenderComponent({
  template,
  user: _user,
  session,
  onSendComplete,
  onCancel
}: EmailSenderComponentProps) {
  const [step, setStep] = useState<'recipients' | 'preview' | 'sending' | 'complete'>('recipients');
  const [recipients, setRecipients] = useState<EmailRecipients>({ to: [] });
  const [subject, setSubject] = useState(template.subject || '');
  const [customizations, setCustomizations] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<EmailSendResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Validate template on mount
  useEffect(() => {
    const validation = EmailValidator.validate(template.html);
    if (!validation.isValid) {
      const errors = validation.errors.filter(e => e.type === 'error').map(e => e.message);
      setValidationErrors(errors);
    }
  }, [template.html]);

  const handleRecipientsChange = (field: keyof EmailRecipients, value: string) => {
    const emails = parseEmailAddresses(value);
    setRecipients(prev => ({
      ...prev,
      [field]: emails
    }));
  };

  const validateRecipients = (): boolean => {
    if (recipients.to.length === 0) {
      return false;
    }

    const allEmails = [
      ...recipients.to,
      ...(recipients.cc || []),
      ...(recipients.bcc || [])
    ];

    return allEmails.every(email => isValidEmailAddress(email));
  };

  const handleSendEmail = async () => {
    if (!validateRecipients() || !subject.trim()) {
      return;
    }

    setIsSending(true);
    setStep('sending');

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          templateId: template.id,
          recipients,
          subject: subject.trim(),
          customizations
        })
      });

      const data = await response.json();

      if (response.ok) {
        const result: EmailSendResult = {
          success: true,
          sendId: data.sendId,
          mailgunMessageId: data.mailgunMessageId,
          recipients,
          subject: subject.trim()
        };
        setSendResult(result);
        setStep('complete');
        onSendComplete(result);
      } else {
        const result: EmailSendResult = {
          success: false,
          error: data.error || 'Failed to send email',
          recipients,
          subject: subject.trim()
        };
        setSendResult(result);
        setStep('complete');
        onSendComplete(result);
      }
    } catch (error) {
      const result: EmailSendResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        recipients,
        subject: subject.trim()
      };
      setSendResult(result);
      setStep('complete');
      onSendComplete(result);
    } finally {
      setIsSending(false);
    }
  };

  const getTotalRecipients = () => {
    return recipients.to.length + (recipients.cc?.length || 0) + (recipients.bcc?.length || 0);
  };

  if (validationErrors.length > 0) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cannot Send Email</h3>
          <p className="text-gray-600 mb-4">
            This template has validation errors that prevent sending:
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <ul className="text-left text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Please fix these issues in the template editor before sending.
          </p>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back to Editor
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Send Email</h2>
        <p className="text-gray-600">Template: {template.name}</p>
      </div>

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          {['recipients', 'preview', 'sending', 'complete'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === stepName ? 'bg-blue-600 text-white' :
                ['recipients', 'preview', 'sending'].indexOf(step) > index ? 'bg-green-600 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {['recipients', 'preview', 'sending'].indexOf(step) > index ? '✓' : index + 1}
              </div>
              {index < 3 && (
                <div className={`w-12 h-0.5 ${
                  ['recipients', 'preview', 'sending'].indexOf(step) > index ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      {step === 'recipients' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email subject"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To (Recipients) *
            </label>
            <textarea
              value={recipients.to.join(', ')}
              onChange={(e) => handleRecipientsChange('to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Enter email addresses separated by commas"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {recipients.to.length} recipient{recipients.to.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CC (Optional)
            </label>
            <textarea
              value={recipients.cc?.join(', ') || ''}
              onChange={(e) => handleRecipientsChange('cc', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Enter CC email addresses separated by commas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BCC (Optional)
            </label>
            <textarea
              value={recipients.bcc?.join(', ') || ''}
              onChange={(e) => handleRecipientsChange('bcc', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Enter BCC email addresses separated by commas"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600">
              Total recipients: {getTotalRecipients()}
            </div>
            <div className="flex space-x-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={() => setStep('preview')}
                disabled={!validateRecipients() || !subject.trim()}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  validateRecipients() && subject.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Preview Email
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Email Preview</h3>
            <div className="space-y-2 text-sm">
              <div><strong>To:</strong> {recipients.to.join(', ')}</div>
              {recipients.cc && recipients.cc.length > 0 && (
                <div><strong>CC:</strong> {recipients.cc.join(', ')}</div>
              )}
              {recipients.bcc && recipients.bcc.length > 0 && (
                <div><strong>BCC:</strong> {recipients.bcc.join(', ')}</div>
              )}
              <div><strong>Subject:</strong> {subject}</div>
            </div>
          </div>

          <div className="border rounded-lg p-4 max-h-96 overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: template.html }} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setStep('recipients')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSendEmail}
              className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Send Email
            </button>
          </div>
        </div>
      )}

      {step === 'sending' && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sending Email...</h3>
          <p className="text-gray-600">
            Sending to {getTotalRecipients()} recipient{getTotalRecipients() !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {step === 'complete' && sendResult && (
        <div className="text-center py-8">
          {sendResult.success ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent Successfully!</h3>
              <p className="text-gray-600 mb-4">
                Your email has been sent to {getTotalRecipients()} recipient{getTotalRecipients() !== 1 ? 's' : ''}
              </p>
              {sendResult.sendId && (
                <p className="text-xs text-gray-500 mb-4">
                  Send ID: {sendResult.sendId}
                </p>
              )}
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Send Failed</h3>
              <p className="text-gray-600 mb-4">
                {sendResult.error || 'An error occurred while sending the email'}
              </p>
              <button
                onClick={() => setStep('recipients')}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}