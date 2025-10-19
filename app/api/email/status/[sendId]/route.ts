/**
 * Email Status API Route
 * Get tracking status for a specific email send
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { EmailTrackingService } from '@/lib/email-tracking';
import { getEmailSendById } from '@/lib/data-access';

export async function GET(
  request: NextRequest,
  { params }: { params: { sendId: string } }
) {
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

    const { sendId } = params;

    // Verify the email send belongs to the user
    const emailSend = await getEmailSendById(sendId, session.user.id);
    
    if (!emailSend) {
      return NextResponse.json(
        { error: 'Email send not found' },
        { status: 404 }
      );
    }

    // Get tracking data
    const trackingData = await EmailTrackingService.updateDeliveryStatus(
      sendId,
      session.user.id
    );

    if (!trackingData) {
      return NextResponse.json(
        { 
          error: 'Unable to fetch tracking data',
          emailSend: emailSend
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      emailSend: emailSend,
      tracking: trackingData
    });

  } catch (error) {
    console.error('Email status API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
