/**
 * Approval Service - Handles approval requests and notifications
 */

import { createClient } from '../supabase/client';
import { WorkflowInstance, WorkflowAction, workflowEngine } from './engine';
import { notificationService } from '../notifications/service';

const supabase = createClient();

export interface ApprovalRequest {
  id: string;
  entityType: 'ncr' | 'document' | 'expense';
  entityId: string;
  workflowInstanceId: string;
  requesterId: string;
  requesterName: string;
  approverId?: string;
  status: 'pending' | 'approved' | 'rejected';
  currentStage: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export class ApprovalService {
  async createApprovalRequest(
    entityType: 'ncr' | 'document' | 'expense',
    entityId: string,
    userId: string,
    userName: string
  ): Promise<ApprovalRequest> {
    // Create workflow instance
    const workflow = workflowEngine.getWorkflow(entityType);
    if (!workflow) throw new Error('Invalid workflow type');

    const workflowInstance: WorkflowInstance = {
      id: `wf_${Date.now()}`,
      entityType,
      entityId,
      currentStage: workflow.initialStage,
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save workflow instance to database
    const { data, error } = await supabase
      .from('workflow_instances')
      .insert(workflowInstance)
      .select()
      .single();

    if (error) throw error;

    // Create approval request
    const approvalRequest: ApprovalRequest = {
      id: `apr_${Date.now()}`,
      entityType,
      entityId,
      workflowInstanceId: data.id,
      requesterId: userId,
      requesterName: userName,
      status: 'pending',
      currentStage: workflow.initialStage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { data: requestData, error: requestError } = await supabase
      .from('approval_requests')
      .insert(approvalRequest)
      .select()
      .single();

    if (requestError) throw requestError;

    // Send notification to approvers
    await this.notifyApprovers(requestData);

    return requestData;
  }

  async processApproval(
    approvalRequestId: string,
    action: WorkflowAction,
    userId: string,
    userName: string,
    userRole: string,
    comment?: string
  ): Promise<ApprovalRequest> {
    // Get approval request
    const { data: request, error } = await supabase
      .from('approval_requests')
      .select('*, workflow_instance:workflow_instances(*)')
      .eq('id', approvalRequestId)
      .single();

    if (error) throw error;

    // Get workflow instance
    const workflowInstance = request.workflow_instance;

    // Transition workflow
    const updatedInstance = await workflowEngine.transitionWorkflow(
      workflowInstance,
      action,
      userId,
      userName,
      userRole,
      comment
    );

    // Update workflow instance in database
    await supabase
      .from('workflow_instances')
      .update({
        currentStage: updatedInstance.currentStage,
        history: updatedInstance.history,
        updatedAt: updatedInstance.updatedAt
      })
      .eq('id', workflowInstance.id);

    // Update approval request
    const updatedRequest: Partial<ApprovalRequest> = {
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'pending',
      currentStage: updatedInstance.currentStage,
      approverId: userId,
      comment,
      updatedAt: new Date().toISOString()
    };

    const { data: finalRequest, error: updateError } = await supabase
      .from('approval_requests')
      .update(updatedRequest)
      .eq('id', approvalRequestId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Send notification
    await notificationService.create({
      user_id: request.requesterId,
      type: 'approval_update',
      title: `Approval ${action}`,
      message: `Your ${request.entityType} has been ${action}`,
      entity_type: request.entityType,
      entity_id: request.entityId
    });

    return finalRequest;
  }

  async getApprovalRequests(userId: string, userRole: string): Promise<ApprovalRequest[]> {
    // Get approval requests where user can approve based on role and stage
    const { data, error } = await supabase
      .from('approval_requests')
      .select('*, workflow_instance:workflow_instances(*)')
      .eq('status', 'pending');

    if (error) throw error;

    // Filter based on role and current stage
    return data.filter((request) => {
      const workflow = workflowEngine.getWorkflow(request.entityType);
      if (!workflow) return false;

      const stage = workflow.stages[request.currentStage];
      return stage && stage.requiredRole.includes(userRole);
    });
  }

  async getUserApprovalHistory(userId: string): Promise<ApprovalRequest[]> {
    const { data, error } = await supabase
      .from('approval_requests')
      .select('*')
      .or(`requesterId.eq.${userId},approverId.eq.${userId}`)
      .order('updatedAt', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }

  private async notifyApprovers(request: ApprovalRequest): Promise<void> {
    const workflow = workflowEngine.getWorkflow(request.entityType);
    if (!workflow) return;

    const stage = workflow.stages[request.currentStage];
    if (!stage || stage.requiredRole.length === 0) return;

    // Get users with required roles
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, full_name')
      .in('role', stage.requiredRole);

    if (error || !users) return;

    // Send notifications to all approvers
    for (const user of users) {
      await notificationService.create({
        user_id: user.id,
        type: 'approval_required',
        title: 'Approval Required',
        message: `New ${request.entityType} requires your approval`,
        entity_type: request.entityType,
        entity_id: request.entityId
      });
    }
  }
}

export const approvalService = new ApprovalService();
