/**
 * Real-time Notifications Service using Supabase Realtime
 */

import { createClient } from '../supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient();

export interface RealtimeNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  entityType?: string;
  entityId?: string;
}

export type NotificationCallback = (notification: RealtimeNotification) => void;

class RealtimeNotificationService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private callbacks: Map<string, NotificationCallback[]> = new Map();

  /**
   * Subscribe to user's notifications channel
   */
  subscribeToNotifications(userId: string, callback: NotificationCallback): () => void {
    const channelName = `notifications:${userId}`;

    // Add callback
    if (!this.callbacks.has(userId)) {
      this.callbacks.set(userId, []);
    }
    this.callbacks.get(userId)!.push(callback);

    // Create channel if not exists
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const notification = payload.new as RealtimeNotification;
            this.notifyCallbacks(userId, notification);
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(userId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }

      // If no more callbacks, unsubscribe channel
      if (!callbacks || callbacks.length === 0) {
        const channel = this.channels.get(channelName);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(channelName);
        }
        this.callbacks.delete(userId);
      }
    };
  }

  /**
   * Subscribe to project updates
   */
  subscribeToProject(projectId: string, callback: (data: unknown) => void): () => void {
    const channelName = `project:${projectId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => callback(payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ncr_reports',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => callback(payload)
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    };
  }

  /**
   * Subscribe to approval requests updates
   */
  subscribeToApprovals(userId: string, callback: (data: unknown) => void): () => void {
    const channelName = `approvals:${userId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'approval_requests',
          filter: `requester_id=eq.${userId}`
        },
        (payload) => callback(payload)
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    };
  }

  private notifyCallbacks(userId: string, notification: RealtimeNotification): void {
    const callbacks = this.callbacks.get(userId);
    if (callbacks) {
      callbacks.forEach((cb) => cb(notification));
    }
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.callbacks.clear();
  }
}

export const realtimeNotificationService = new RealtimeNotificationService();
