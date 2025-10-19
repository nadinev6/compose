'use client';

/**
 * Email Tracking Dashboard Component
 * Real-time email delivery tracking and analytics
 */

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { EmailTrackingService, getStatusColor, getStatusIcon, formatDeliveryRate } from '@/lib/email-tracking';
import type { TrackingResult } from '@/lib/email-tracking';
import type { EmailSend } from '@/lib/database.types';

interface EmailTrackingDashboardProps {
  user: User;
  sessionToken?: string;
  emailSends?: EmailSend[];
}

export default function EmailTrackingDashboard({ 
  user, 
  sessionToken,
  emailSends = []
}: EmailTrackingDashboardProps) {
  const [trackingData, setTrackingData] = useState<TrackingResult[]>([]);
  const [deliveryStats, setDeliveryStats] = useState<any>(null);
  const [selectedSend, setSelectedSend] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load tracking data
  useEffect(() => {
    const loadTrackingData = async () => {
      if (emailSends.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const sendIds = emailSends.map(send => send.id);
        const [tracking, stats] = await Promise.all([
          EmailTrackingService.getTrackingInfo(sendIds, user.id),
          EmailTrackingService.getDeliveryStats(user.id)
        ]);

        setTrackingData(tracking);
        setDeliveryStats(stats);
      } catch (error) {
        console.error('Error loading tracking data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrackingData();
  }, [emailSends, user.id]);

  // Auto-refresh tracking data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      if (emailSends.length > 0) {
        const sendIds = emailSends.map(send => send.id);
        const tracking = await EmailTrackingService.getTrackingInfo(sendIds, user.id);
        setTrackingData(tracking);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, emailSends, user.id]);

  const selectedTrackingData = trackingData.find(t => t.sendId === selectedSend);
  const selectedEmailSend = emailSends.find(send => send.id === selectedSend);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  if (emailSends.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Emails Sent Yet</h3>
        <p className="text-gray-600">Send your first email to see tracking data here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Email Tracking</h2>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Auto-refresh</span>
          </label>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Delivery Statistics */}
      {deliveryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">{deliveryStats.totalSent}</div>
            <div className="text-sm text-gray-600">Total Sent</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{deliveryStats.delivered}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{deliveryStats.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">
              {deliveryStats.deliveryRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              Delivery Rate ({formatDeliveryRate(deliveryStats.deliveryRate)})
            </div>
          </div>
        </div>
      )}

      {/* Email List */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Recent Emails</h3>
        </div>
        <div className="divide-y">
          {emailSends.map((emailSend) => {
            const tracking = trackingData.find(t => t.sendId === emailSend.id);
            const totalRecipients = emailSend.recipients.to.length + 
              (emailSend.recipients.cc?.length || 0) + 
              (emailSend.recipients.bcc?.length || 0);

            return (
              <div
                key={emailSend.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedSend === emailSend.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => setSelectedSend(selectedSend === emailSend.id ? null : emailSend.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getStatusIcon(emailSend.status)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{emailSend.subject}</h4>
                        <p className="text-sm text-gray-600">
                          To {totalRecipients} recipient{totalRecipients !== 1 ? 's' : ''} • 
                          {new Date(emailSend.sent_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(emailSend.status)}`}>
                      {emailSend.status.toUpperCase()}
                    </span>
                    {tracking && tracking.deliveryRate !== undefined && (
                      <div className="text-sm text-gray-600">
                        {tracking.deliveryRate.toFixed(0)}% delivered
                      </div>
                    )}
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedSend === emailSend.id ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedSend === emailSend.id && selectedTrackingData && selectedEmailSend && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {selectedTrackingData.deliveryRate !== undefined && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {selectedTrackingData.deliveryRate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Delivery Rate</div>
                        </div>
                      )}
                      {selectedTrackingData.openRate !== undefined && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {selectedTrackingData.openRate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Open Rate</div>
                        </div>
                      )}
                      {selectedTrackingData.clickRate !== undefined && (
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {selectedTrackingData.clickRate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">Click Rate</div>
                        </div>
                      )}
                    </div>

                    {/* Events Timeline */}
                    {selectedTrackingData.events.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Delivery Events</h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {selectedTrackingData.events
                            .sort((a, b) => b.timestamp - a.timestamp)
                            .map((event, index) => (
                            <div key={index} className="flex items-center space-x-3 text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                              <div className="flex-1">
                                <span className="font-medium">{event.event}</span>
                                {event.recipient && (
                                  <span className="text-gray-600"> • {event.recipient}</span>
                                )}
                                <div className="text-gray-500 text-xs">
                                  {new Date(event.timestamp * 1000).toLocaleString()}
                                </div>
                                {event.description && (
                                  <div className="text-gray-600 text-xs mt-1">{event.description}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {selectedEmailSend.error_message && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="text-sm text-red-800">
                          <strong>Error:</strong> {selectedEmailSend.error_message}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}