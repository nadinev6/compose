/**
 * Email Tracking API Route
 * Fetches tracking data from Mailgun events API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { EmailTrackingService } from '@/lib/email-tracking';
import { getEmailSends } from '@/lib/data-access';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const sendIds = searchParams.get('sendIds')?.split(',') || [];
    const days = parseInt(searchParams.get('days') || '30');

    // If specific send IDs are requested
    if (sendIds.length > 0) {
      const trackingData = await EmailTrackingService.getTrackingInfo(
        sendIds,
        session.user.id
      );

      return NextResponse.json({
        success: true,
        tracking: trackingData
      });
    }

    // Otherwise, get all email sends and their tracking data
    const emailSends = await getEmailSends(session.user.id);
    const sendIdList = emailSends.map(send => send.id);
    
    const [trackingData, deliveryStats] = await Promise.all([
      EmailTrackingService.getTrackingInfo(sendIdList, session.user.id),
      EmailTrackingService.getDeliveryStats(session.user.id, days)
    ]);

    return NextResponse.json({
      success: true,
      tracking: trackingData,
      stats: deliveryStats,
      emailSends: emailSends
    });

  } catch (error) {
    console.error('Email tracking API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
