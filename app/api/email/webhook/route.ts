/**
 * Mailgun Webhook Handler
 * Receives real-time email delivery events from Mailgun
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateEmailSend } from '@/lib/data-access';
import { EmailSendStatus } from '@/lib/database.types';

interface MailgunWebhookEvent {
  signature: {
    timestamp: string;
    token: string;
    signature: string;
  };
  'event-data': {
    event: string;
    timestamp: number;
    id: string;
    recipient: string;
    message: {
      headers: {
        'message-id': string;
      };
    };
    'user-variables': {
      sendId?: string;
      templateId?: string;
      userId?: string;
    };
    'delivery-status'?: {
      message?: string;
      code?: number;
    };
    reason?: string;
  };
}

/**
 * Verify Mailgun webhook signature
 */
function verifyWebhookSignature(
  timestamp: string,
  token: string,
  signature: string
): boolean {
  const signingKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY;
  
  if (!signingKey) {
    console.warn('MAILGUN_WEBHOOK_SIGNING_KEY not configured');
    return false;
  }

  const encodedToken = crypto
    .createHmac('sha256', signingKey)
    .update(timestamp + token)
    .digest('hex');

  return encodedToken === signature;
}

/**
 * Map Mailgun event to database status
 */
function mapEventToStatus(event: string): EmailSendStatus | null {
  const eventMap: Record<string, EmailSendStatus> = {
    'accepted': 'pending',
    'delivered': 'sent',
    'failed': 'failed',
    'rejected': 'failed',
    'complained': 'failed',
    'unsubscribed': 'failed'
  };

  return eventMap[event] || null;
}

export async function POST(request: NextRequest) {
  try {
    const body: MailgunWebhookEvent = await request.json();

    // Verify webhook signature
    const { timestamp, token, signature } = body.signature;
    
    if (!verifyWebhookSignature(timestamp, token, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const eventData = body['event-data'];
    const event = eventData.event;
    const userVariables = eventData['user-variables'] || {};
    const sendId = userVariables.sendId;
    const userId = userVariables.userId;

    // Log the event
    console.log(`Mailgun webhook: ${event} for send ${sendId}`);

    // If we don't have the sendId, we can't update our records
    if (!sendId || !userId) {
      console.warn('Webhook missing sendId or userId in user variables');
      return NextResponse.json({ received: true });
    }

    // Map event to status
    const newStatus = mapEventToStatus(event);
    
    if (newStatus) {
      // Update email send status
      const updates: any = {
        status: newStatus
      };

      // Add error message for failed events
      if (newStatus === 'failed') {
        const deliveryStatus = eventData['delivery-status'];
        const reason = eventData.reason;
        updates.error_message = deliveryStatus?.message || reason || `Email ${event}`;
      }

      await updateEmailSend(sendId, userId, updates);
      
      console.log(`Updated send ${sendId} to status: ${newStatus}`);
    }

    // Return success
    return NextResponse.json({ 
      received: true,
      event: event,
      sendId: sendId
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Return 200 to prevent Mailgun from retrying
    // Log the error for investigation
    return NextResponse.json(
      { 
        received: true,
        error: 'Processing error logged'
      },
      { status: 200 }
    );
  }
}

// Disable body parsing to allow raw body access for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};
