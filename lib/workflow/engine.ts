/**
 * Workflow Engine - Multi-stage approval system
 * Supports NCR, Documents, and Expenses workflows
 */

export type WorkflowType = 'ncr' | 'document' | 'expense';
export type WorkflowAction = 'submit' | 'approve' | 'reject' | 'request_changes' | 'complete';

export interface WorkflowStage {
  id: string;
  name: string;
  requiredRole: string[];
  nextStages: string[];
  allowedActions: WorkflowAction[];
}

export interface WorkflowDefinition {
  type: WorkflowType;
  stages: Record<string, WorkflowStage>;
  initialStage: string;
  finalStages: string[];
}

export interface WorkflowInstance {
  id: string;
  entityType: WorkflowType;
  entityId: string;
  currentStage: string;
  history: WorkflowHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowHistoryEntry {
  stageId: string;
  action: WorkflowAction;
  userId: string;
  userName: string;
  timestamp: string;
  comment?: string;
}

// NCR Workflow: Open → Inspection → Corrective Action → Verification → Closed
export const NCR_WORKFLOW: WorkflowDefinition = {
  type: 'ncr',
  initialStage: 'open',
  finalStages: ['closed', 'rejected'],
  stages: {
    open: {
      id: 'open',
      name: 'Open',
      requiredRole: ['site_engineer', 'qa_manager'],
      nextStages: ['inspection', 'rejected'],
      allowedActions: ['submit', 'reject']
    },
    inspection: {
      id: 'inspection',
      name: 'Inspection',
      requiredRole: ['qa_manager'],
      nextStages: ['corrective_action', 'open'],
      allowedActions: ['approve', 'request_changes']
    },
    corrective_action: {
      id: 'corrective_action',
      name: 'Corrective Action',
      requiredRole: ['site_engineer', 'project_manager'],
      nextStages: ['verification'],
      allowedActions: ['complete']
    },
    verification: {
      id: 'verification',
      name: 'Verification',
      requiredRole: ['qa_manager'],
      nextStages: ['closed', 'corrective_action'],
      allowedActions: ['approve', 'request_changes']
    },
    closed: {
      id: 'closed',
      name: 'Closed',
      requiredRole: [],
      nextStages: [],
      allowedActions: []
    },
    rejected: {
      id: 'rejected',
      name: 'Rejected',
      requiredRole: [],
      nextStages: [],
      allowedActions: []
    }
  }
};

// Document Workflow: Draft → Review → Approval → Published
export const DOCUMENT_WORKFLOW: WorkflowDefinition = {
  type: 'document',
  initialStage: 'draft',
  finalStages: ['published', 'rejected'],
  stages: {
    draft: {
      id: 'draft',
      name: 'Draft',
      requiredRole: ['site_engineer', 'project_manager'],
      nextStages: ['review'],
      allowedActions: ['submit']
    },
    review: {
      id: 'review',
      name: 'Under Review',
      requiredRole: ['project_manager', 'qa_manager'],
      nextStages: ['approval', 'draft'],
      allowedActions: ['approve', 'request_changes']
    },
    approval: {
      id: 'approval',
      name: 'Pending Approval',
      requiredRole: ['admin', 'super_admin'],
      nextStages: ['published', 'review'],
      allowedActions: ['approve', 'reject']
    },
    published: {
      id: 'published',
      name: 'Published',
      requiredRole: [],
      nextStages: [],
      allowedActions: []
    },
    rejected: {
      id: 'rejected',
      name: 'Rejected',
      requiredRole: [],
      nextStages: [],
      allowedActions: []
    }
  }
};

// Expense Workflow: Pending → Manager Approval → Finance Approval → Paid
export const EXPENSE_WORKFLOW: WorkflowDefinition = {
  type: 'expense',
  initialStage: 'pending',
  finalStages: ['paid', 'rejected'],
  stages: {
    pending: {
      id: 'pending',
      name: 'Pending',
      requiredRole: ['site_engineer', 'project_manager'],
      nextStages: ['manager_approval'],
      allowedActions: ['submit']
    },
    manager_approval: {
      id: 'manager_approval',
      name: 'Manager Approval',
      requiredRole: ['project_manager'],
      nextStages: ['finance_approval', 'rejected'],
      allowedActions: ['approve', 'reject']
    },
    finance_approval: {
      id: 'finance_approval',
      name: 'Finance Approval',
      requiredRole: ['accountant', 'admin'],
      nextStages: ['paid', 'manager_approval'],
      allowedActions: ['approve', 'request_changes']
    },
    paid: {
      id: 'paid',
      name: 'Paid',
      requiredRole: [],
      nextStages: [],
      allowedActions: []
    },
    rejected: {
      id: 'rejected',
      name: 'Rejected',
      requiredRole: [],
      nextStages: [],
      allowedActions: []
    }
  }
};

export class WorkflowEngine {
  private workflows: Map<WorkflowType, WorkflowDefinition> = new Map([
    ['ncr', NCR_WORKFLOW],
    ['document', DOCUMENT_WORKFLOW],
    ['expense', EXPENSE_WORKFLOW]
  ]);

  getWorkflow(type: WorkflowType): WorkflowDefinition | undefined {
    return this.workflows.get(type);
  }

  canPerformAction(
    workflow: WorkflowDefinition,
    currentStage: string,
    action: WorkflowAction,
    userRole: string
  ): boolean {
    const stage = workflow.stages[currentStage];
    if (!stage) return false;

    // Check if action is allowed in this stage
    if (!stage.allowedActions.includes(action)) return false;

    // Check if user has required role
    if (stage.requiredRole.length > 0 && !stage.requiredRole.includes(userRole)) {
      return false;
    }

    return true;
  }

  getNextStage(
    workflow: WorkflowDefinition,
    currentStage: string,
    action: WorkflowAction
  ): string | null {
    const stage = workflow.stages[currentStage];
    if (!stage) return null;

    // Simple mapping - in real implementation, this would be more complex
    const actionToStageMap: Record<WorkflowAction, number> = {
      submit: 0,
      approve: 0,
      reject: 1, // Usually goes to rejected stage
      request_changes: 1, // Usually goes back
      complete: 0
    };

    const nextStageIndex = actionToStageMap[action] || 0;
    return stage.nextStages[nextStageIndex] || null;
  }

  async transitionWorkflow(
    instance: WorkflowInstance,
    action: WorkflowAction,
    userId: string,
    userName: string,
    userRole: string,
    comment?: string
  ): Promise<WorkflowInstance> {
    const workflow = this.getWorkflow(instance.entityType);
    if (!workflow) throw new Error('Invalid workflow type');

    if (!this.canPerformAction(workflow, instance.currentStage, action, userRole)) {
      throw new Error('Action not allowed for current stage and user role');
    }

    const nextStage = this.getNextStage(workflow, instance.currentStage, action);
    if (!nextStage) throw new Error('No valid next stage');

    // Create history entry
    const historyEntry: WorkflowHistoryEntry = {
      stageId: instance.currentStage,
      action,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      comment
    };

    // Update instance
    return {
      ...instance,
      currentStage: nextStage,
      history: [...instance.history, historyEntry],
      updatedAt: new Date().toISOString()
    };
  }

  isWorkflowComplete(workflow: WorkflowDefinition, currentStage: string): boolean {
    return workflow.finalStages.includes(currentStage);
  }
}

export const workflowEngine = new WorkflowEngine();
