/**
 * Email delivery tracking service
 * Handles real-time email delivery status updates and notifications
 */

import { createMailgunService } from './mailgun';
import DataAccessLayer from './data-access';
import type { EmailSendStatus, EmailSend } from './database.types';

export interface DeliveryEvent {
  event: string;
  timestamp: number;
  recipient?: string;
  reason?: string;
  description?: string;
}

export interface TrackingResult {
  sendId: string;
  status: EmailSendStatus;
  events: DeliveryEvent[];
  lastUpdated: Date;
  deliveryRate?: number;
  openRate?: number;
  clickRate?: number;
}

export class EmailTrackingService {
  /**
   * Update delivery status for an email send
   */
  static async updateDeliveryStatus(sendId: string, userId: string): Promise<TrackingResult | null> {
    try {
      // Get email send record
      const emailSend = await DataAccessLayer.getEmailSend(sendId, userId);
      if (!emailSend || !emailSend.mailgun_message_id) {
        return null;
      }

      // Get delivery status from Mailgun
      const mailgunService = createMailgunService();
      const deliveryStatus = await mailgunService.getDeliveryStatus(emailSend.mailgun_message_id);

      // Update our record if status has changed
      if (deliveryStatus.status !== emailSend.status) {
        await DataAccessLayer.updateEmailSendStatus(
          sendId,
          userId,
          deliveryStatus.status
        );
      }

      // Calculate metrics
      const metrics = this.calculateDeliveryMetrics(deliveryStatus.events, emailSend);

      return {
        sendId,
        status: deliveryStatus.status,
        events: deliveryStatus.events.map(event => ({
          event: event.event,
          timestamp: event.timestamp,
          recipient: event.recipient,
          reason: event.reason,
          description: this.getEventDescription(event.event)
        })),
        lastUpdated: new Date(),
        ...metrics
      };
    } catch (error) {
      console.error('Error updating delivery status:', error);
      return null;
    }
  }

  /**
   * Get tracking information for multiple email sends
   */
  static async getTrackingInfo(sendIds: string[], userId: string): Promise<TrackingResult[]> {
    const results = await Promise.all(
      sendIds.map(sendId => this.updateDeliveryStatus(sendId, userId))
    );
    
    return results.filter((result): result is TrackingResult => result !== null);
  }

  /**
   * Get delivery statistics for a user
   */
  static async getDeliveryStats(userId: string, days: number = 30): Promise<{
    totalSent: number;
    delivered: number;
    failed: number;
    bounced: number;
    deliveryRate: number;
    recentActivity: Array<{
      date: string;
      sent: number;
      delivered: number;
      failed: number;
    }>;
  }> {
    try {
      const emailSends = await DataAccessLayer.getEmailSends(userId);
      
      // Filter by date range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentSends = emailSends.filter(send => 
        new Date(send.sent_at) >= cutoffDate
      );

      // Calculate totals
      const totalSent = recentSends.length;
      const delivered = recentSends.filter(send => 
        send.status === 'delivered' || send.status === 'sent'
      ).length;
      const failed = recentSends.filter(send => 
        send.status === 'failed'
      ).length;
      const bounced = recentSends.filter(send => 
        send.status === 'bounced'
      ).length;

      const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;

      // Group by date for activity chart
      const activityMap = new Map<string, { sent: number; delivered: number; failed: number }>();
      
      recentSends.forEach(send => {
        const date = new Date(send.sent_at).toISOString().split('T')[0];
        const current = activityMap.get(date) || { sent: 0, delivered: 0, failed: 0 };
        
        current.sent++;
        if (send.status === 'delivered' || send.status === 'sent') {
          current.delivered++;
        } else if (send.status === 'failed' || send.status === 'bounced') {
          current.failed++;
        }
        
        activityMap.set(date, current);
      });

      const recentActivity = Array.from(activityMap.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalSent,
        delivered,
        failed,
        bounced,
        deliveryRate,
        recentActivity
      };
    } catch (error) {
      console.error('Error getting delivery stats:', error);
      return {
        totalSent: 0,
        delivered: 0,
        failed: 0,
        bounced: 0,
        deliveryRate: 0,
        recentActivity: []
      };
    }
  }

  /**
   * Set up real-time tracking for an email send
   */
  static async setupRealTimeTracking(sendId: string, userId: string): Promise<{
    trackingUrl: string;
    webhookConfigured: boolean;
  }> {
    try {
      // In a real implementation, this would set up webhooks and tracking URLs
      const trackingUrl = `/api/email/status/${sendId}`;
      
      // Check if webhook is configured
      const webhookConfigured = !!process.env.MAILGUN_WEBHOOK_SIGNING_KEY;
      
      return {
        trackingUrl,
        webhookConfigured
      };
    } catch (error) {
      console.error('Error setting up real-time tracking:', error);
      return {
        trackingUrl: '',
        webhookConfigured: false
      };
    }
  }

  /**
   * Get email engagement metrics
   */
  static async getEngagementMetrics(templateId: string, userId: string): Promise<{
    totalSends: number;
    uniqueOpens: number;
    uniqueClicks: number;
    openRate: number;
    clickRate: number;
    clickToOpenRate: number;
    topLinks: Array<{ url: string; clicks: number }>;
  }> {
    try {
      const emailSends = await DataAccessLayer.getEmailSendsForTemplate(templateId, userId);
      
      // In a real implementation, this would aggregate data from Mailgun events
      // For now, we'll provide mock data structure
      const totalSends = emailSends.length;
      const deliveredSends = emailSends.filter(send => 
        send.status === 'delivered' || send.status === 'sent'
      ).length;

      // Mock engagement data (in real implementation, this would come from Mailgun events)
      const uniqueOpens = Math.floor(deliveredSends * 0.25); // 25% open rate
      const uniqueClicks = Math.floor(uniqueOpens * 0.15); // 15% click rate of opens
      
      const openRate = deliveredSends > 0 ? (uniqueOpens / deliveredSends) * 100 : 0;
      const clickRate = deliveredSends > 0 ? (uniqueClicks / deliveredSends) * 100 : 0;
      const clickToOpenRate = uniqueOpens > 0 ? (uniqueClicks / uniqueOpens) * 100 : 0;

      return {
        totalSends,
        uniqueOpens,
        uniqueClicks,
        openRate,
        clickRate,
        clickToOpenRate,
        topLinks: [] // Would be populated from actual click tracking data
      };
    } catch (error) {
      console.error('Error getting engagement metrics:', error);
      return {
        totalSends: 0,
        uniqueOpens: 0,
        uniqueClicks: 0,
        openRate: 0,
        clickRate: 0,
        clickToOpenRate: 0,
        topLinks: []
      };
    }
  }

  /**
   * Calculate delivery metrics from events
   */
  private static calculateDeliveryMetrics(events: any[], emailSend: EmailSend): {
    deliveryRate?: number;
    openRate?: number;
    clickRate?: number;
  } {
    const totalRecipients = emailSend.recipients.to.length + 
      (emailSend.recipients.cc?.length || 0) + 
      (emailSend.recipients.bcc?.length || 0);

    const deliveredEvents = events.filter(e => e.event === 'delivered').length;
    const openEvents = events.filter(e => e.event === 'opened').length;
    const clickEvents = events.filter(e => e.event === 'clicked').length;

    return {
      deliveryRate: totalRecipients > 0 ? (deliveredEvents / totalRecipients) * 100 : undefined,
      openRate: deliveredEvents > 0 ? (openEvents / deliveredEvents) * 100 : undefined,
      clickRate: deliveredEvents > 0 ? (clickEvents / deliveredEvents) * 100 : undefined
    };
  }

  /**
   * Get human-readable description for Mailgun events
   */
  private static getEventDescription(event: string): string {
    const descriptions: Record<string, string> = {
      'accepted': 'Email accepted by Mailgun for delivery',
      'rejected': 'Email rejected due to policy or content issues',
      'delivered': 'Email successfully delivered to recipient',
      'failed': 'Email delivery failed permanently',
      'opened': 'Email was opened by recipient',
      'clicked': 'Link in email was clicked by recipient',
      'unsubscribed': 'Recipient unsubscribed from emails',
      'complained': 'Recipient marked email as spam',
      'stored': 'Email stored (for large attachments)'
    };

    return descriptions[event] || `Unknown event: ${event}`;
  }
}

// Utility functions for tracking
export function getStatusColor(status: EmailSendStatus): string {
  const colors: Record<EmailSendStatus, string> = {
    queued: 'text-yellow-600 bg-yellow-100',
    sending: 'text-blue-600 bg-blue-100',
    sent: 'text-green-600 bg-green-100',
    delivered: 'text-green-700 bg-green-200',
    failed: 'text-red-600 bg-red-100',
    bounced: 'text-orange-600 bg-orange-100'
  };
  
  return colors[status] || 'text-gray-600 bg-gray-100';
}

export function getStatusIcon(status: EmailSendStatus): string {
  const icons: Record<EmailSendStatus, string> = {
    queued: '⏳',
    sending: '📤',
    sent: '✅',
    delivered: '📬',
    failed: '❌',
    bounced: '⚠️'
  };
  
  return icons[status] || '❓';
}

export function formatDeliveryRate(rate: number): string {
  if (rate >= 95) return 'Excellent';
  if (rate >= 85) return 'Good';
  if (rate >= 70) return 'Fair';
  return 'Poor';
}