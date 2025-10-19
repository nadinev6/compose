/**
 * Email Send API Route
 * Handles email sending through Mailgun with authentication and validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createMailgunService, convertRecipientsToMailgun } from '@/lib/mailgun';
import { EmailValidator } from '@/lib/email-validation';
import { getTemplateById } from '@/lib/data-access';
import { EmailRecipients } from '@/lib/database.types';

interface SendEmailRequest {
  templateId: string;
  recipients: EmailRecipients;
  subject: string;
  customizations?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    // Get session from cookies
    const cookieStore = cookies();
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: SendEmailRequest = await request.json();
    const { templateId, recipients, subject, customizations } = body;

    // Validate request
    if (!templateId || !recipients || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: templateId, recipients, subject' },
        { status: 400 }
      );
    }

    // Validate recipients
    if (!recipients.to || recipients.to.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient is required' },
        { status: 400 }
      );
    }

    // Get template from database
    const template = await getTemplateById(templateId, session.user.id);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Validate template HTML
    const validation = EmailValidator.validate(template.html);
    if (!validation.isValid) {
      const errors = validation.errors.filter(e => e.type === 'error');
      return NextResponse.json(
        { 
          error: 'Template has validation errors',
          validationErrors: errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    // Apply customizations to HTML if provided
    let finalHtml = template.html;
    if (customizations) {
      Object.entries(customizations).forEach(([key, value]) => {
        finalHtml = finalHtml.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    }

    // Create email send record in database (pending status)
    const { data: emailSend, error: createError } = await supabaseServer
      .from('email_sends')
      .insert({
        user_id: session.user.id,
        template_id: templateId,
        subject: subject.trim(),
        recipients,
        status: 'pending'
      })
      .select()
      .single();

    if (createError || !emailSend) {
      console.error('Failed to create email send record:', createError);
      return NextResponse.json(
        { error: 'Failed to create send record' },
        { status: 500 }
      );
    }

    // Send email through Mailgun
    try {
      const mailgunService = createMailgunService();
      const mailgunRecipients = convertRecipientsToMailgun(recipients);
      
      const mailgunResponse = await mailgunService.sendEmail({
        ...mailgunRecipients,
        subject: subject.trim(),
        html: finalHtml,
        tags: ['compose-app', `template-${templateId}`, `send-${emailSend.id}`],
        customVariables: {
          sendId: emailSend.id,
          templateId: templateId,
          userId: session.user.id
        }
      });

      // Update email send record with Mailgun message ID and sent status
      const { error: updateError } = await supabaseServer
        .from('email_sends')
        .update({
          status: 'sent',
          mailgun_message_id: mailgunResponse.id,
          sent_at: new Date().toISOString()
        })
        .eq('id', emailSend.id);

      if (updateError) {
        console.error('Failed to update email send record:', updateError);
        // Don't fail the request since email was sent successfully
      }

      return NextResponse.json({
        success: true,
        sendId: emailSend.id,
        mailgunMessageId: mailgunResponse.id,
        message: 'Email sent successfully'
      });

    } catch (mailgunError) {
      console.error('Mailgun send error:', mailgunError);

      // Update email send record with failed status
      const errorMessage = mailgunError instanceof Error ? mailgunError.message : 'Unknown error';
      
      await supabaseServer
        .from('email_sends')
        .update({
          status: 'failed',
          error_message: errorMessage
        })
        .eq('id', emailSend.id);

      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: errorMessage,
          sendId: emailSend.id
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email send API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
