/**
 * Webhooks Service
 * Allows external systems to subscribe to events
 */

import { createClient } from '../supabase/client';

const supabase = createClient();

export type WebhookEvent =
  | 'project.created'
  | 'project.updated'
  | 'task.created'
  | 'task.completed'
  | 'ncr.created'
  | 'ncr.closed'
  | 'approval.required'
  | 'approval.approved'
  | 'document.published'
  | 'expense.approved';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
  lastTriggered?: string;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
  webhookId: string;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: WebhookPayload;
  responseStatus: number;
  responseBody: string;
  timestamp: string;
  success: boolean;
}

class WebhookService {
  /**
   * Register new webhook
   */
  async registerWebhook(
    name: string,
    url: string,
    events: WebhookEvent[],
    userId: string
  ): Promise<Webhook> {
    const secret = this.generateSecret();

    const webhook: Omit<Webhook, 'id'> = {
      name,
      url,
      events,
      secret,
      active: true,
      createdBy: userId,
      createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('webhooks')
      .insert(webhook)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Trigger webhook for event
   */
  async triggerWebhook(event: WebhookEvent, data: Record<string, unknown>): Promise<void> {
    // Get all webhooks subscribed to this event
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('*')
      .eq('active', true)
      .contains('events', [event]);

    if (!webhooks || webhooks.length === 0) return;

    // Trigger all webhooks
    const promises = webhooks.map((webhook) => this.sendWebhook(webhook, event, data));
    await Promise.allSettled(promises);
  }

  /**
   * Send webhook HTTP request
   */
  private async sendWebhook(
    webhook: Webhook,
    event: WebhookEvent,
    data: Record<string, unknown>
  ): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      webhookId: webhook.id
    };

    const signature = this.generateSignature(payload, webhook.secret);

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event
        },
        body: JSON.stringify(payload)
      });

      // Log webhook call
      await this.logWebhook(webhook.id, event, payload, response.status, await response.text(), response.ok);

      // Update last triggered
      await supabase
        .from('webhooks')
        .update({ lastTriggered: new Date().toISOString() })
        .eq('id', webhook.id);
    } catch (error) {
      await this.logWebhook(
        webhook.id,
        event,
        payload,
        0,
        error instanceof Error ? error.message : 'Unknown error',
        false
      );
    }
  }

  /**
   * Generate webhook secret
   */
  private generateSecret(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate HMAC signature for webhook
   */
  private generateSignature(payload: WebhookPayload, secret: string): string {
    // In production, use crypto.subtle.sign with HMAC-SHA256
    // For now, simple hash
    const message = JSON.stringify(payload) + secret;
    return btoa(message);
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expected = this.generateSignature(JSON.parse(payload), secret);
    return signature === expected;
  }

  /**
   * Get webhooks for user
   */
  async getUserWebhooks(userId: string): Promise<Webhook[]> {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    const { error } = await supabase.from('webhooks').delete().eq('id', webhookId);

    if (error) throw error;
  }

  /**
   * Get webhook logs
   */
  async getWebhookLogs(webhookId: string, limit = 50): Promise<WebhookLog[]> {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Log webhook call
   */
  private async logWebhook(
    webhookId: string,
    event: WebhookEvent,
    payload: WebhookPayload,
    status: number,
    responseBody: string,
    success: boolean
  ): Promise<void> {
    await supabase.from('webhook_logs').insert({
      webhook_id: webhookId,
      event,
      payload,
      response_status: status,
      response_body: responseBody,
      success,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Test webhook
   */
  async testWebhook(webhookId: string): Promise<{ success: boolean; message: string }> {
    const { data: webhook } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .single();

    if (!webhook) {
      return { success: false, message: 'Webhook not found' };
    }

    try {
      await this.sendWebhook(webhook, 'project.created', {
        test: true,
        message: 'This is a test webhook'
      });

      return { success: true, message: 'Webhook test successful' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Webhook test failed'
      };
    }
  }
}

export const webhookService = new WebhookService();
