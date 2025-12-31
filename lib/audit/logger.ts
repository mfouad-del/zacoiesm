/**
 * Audit Trail Logger
 * Logs all critical operations to activity_logs table
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '../supabase/client';

export type AuditAction = 
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'LOGIN' | 'LOGOUT'
  | 'APPROVE' | 'REJECT'
  | 'EXPORT' | 'IMPORT';

export type AuditEntity = 
  | 'project' | 'task' | 'contract' | 'variation'
  | 'ncr' | 'timesheet' | 'document' | 'report'
  | 'incident' | 'user' | 'settings';

interface AuditLogEntry {
  action: AuditAction;
  entity_type: AuditEntity;
  entity_id?: string;
  entity_name?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

class AuditLogger {
  private supabase = createClient();

  /**
   * Log an audit entry
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user for audit log');
        return;
      }

      const { error } = await this.supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          action: entry.action,
          entity_type: entry.entity_type,
          entity_id: entry.entity_id,
          entity_name: entry.entity_name,
          old_values: entry.old_values,
          new_values: entry.new_values,
          metadata: entry.metadata,
          ip_address: entry.ip_address || this.getClientIP(),
          user_agent: entry.user_agent || navigator.userAgent
        });

      if (error) {
        console.error('Failed to log audit entry:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  /**
   * Log project creation
   */
  async logProjectCreate(projectId: string, projectName: string, projectData: any): Promise<void> {
    await this.log({
      action: 'CREATE',
      entity_type: 'project',
      entity_id: projectId,
      entity_name: projectName,
      new_values: projectData,
      metadata: { source: 'web_app' }
    });
  }

  /**
   * Log project update
   */
  async logProjectUpdate(
    projectId: string, 
    projectName: string, 
    oldData: any, 
    newData: any
  ): Promise<void> {
    await this.log({
      action: 'UPDATE',
      entity_type: 'project',
      entity_id: projectId,
      entity_name: projectName,
      old_values: oldData,
      new_values: newData,
      metadata: { 
        changed_fields: this.getChangedFields(oldData, newData)
      }
    });
  }

  /**
   * Log timesheet approval
   */
  async logTimesheetApproval(timesheetId: string, employeeName: string): Promise<void> {
    await this.log({
      action: 'APPROVE',
      entity_type: 'timesheet',
      entity_id: timesheetId,
      entity_name: `Timesheet for ${employeeName}`,
      metadata: { approval_status: 'approved' }
    });
  }

  /**
   * Log NCR status change
   */
  async logNCRStatusChange(
    ncrId: string, 
    ncrNumber: string, 
    oldStatus: string, 
    newStatus: string
  ): Promise<void> {
    await this.log({
      action: 'UPDATE',
      entity_type: 'ncr',
      entity_id: ncrId,
      entity_name: ncrNumber,
      old_values: { status: oldStatus },
      new_values: { status: newStatus },
      metadata: { status_transition: `${oldStatus} → ${newStatus}` }
    });
  }

  /**
   * Log document upload
   */
  async logDocumentUpload(documentId: string, fileName: string, fileSize: number): Promise<void> {
    await this.log({
      action: 'CREATE',
      entity_type: 'document',
      entity_id: documentId,
      entity_name: fileName,
      metadata: { 
        file_size: fileSize,
        upload_timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log user login
   */
  async logLogin(email: string): Promise<void> {
    await this.log({
      action: 'LOGIN',
      entity_type: 'user',
      entity_name: email,
      metadata: { 
        login_timestamp: new Date().toISOString(),
        platform: 'web'
      }
    });
  }

  /**
   * Get changed fields between old and new objects
   */
  private getChangedFields(oldData: any, newData: any): string[] {
    const changed: string[] = [];
    
    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changed.push(key);
      }
    }
    
    return changed;
  }

  /**
   * Get client IP (best effort - may not work in all environments)
   */
  private getClientIP(): string {
    // In production, this should be set by backend/proxy
    return 'client';
  }

  /**
   * Query audit logs with filters
   */
  async queryLogs(filters: {
    userId?: string;
    entityType?: AuditEntity;
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    let query = this.supabase
      .from('activity_logs')
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .order('created_at', { ascending: false });

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to query audit logs:', error);
      return [];
    }

    return data;
  }
}

// Singleton instance
export const auditLogger = new AuditLogger();
