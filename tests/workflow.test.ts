/**
 * Workflow Service Tests
 */

import { workflowEngine, WorkflowInstance } from '@/lib/workflow/engine';
import { approvalService } from '@/lib/workflow/approval.service';

describe('Workflow Engine', () => {
  const engine = workflowEngine;

  describe('Document Workflow', () => {
    it('should start document workflow in DRAFT stage', () => {
      const workflow = engine.getWorkflow('document');
      if (!workflow) throw new Error('Workflow not found');
      const result = engine.canPerformAction(workflow, 'draft', 'submit', 'site_engineer');
      expect(result).toBe(true);
    });

    it('should require review before approval', () => {
       const workflow = engine.getWorkflow('document');
       if (!workflow) throw new Error('Workflow not found');
       // In draft, 'approve' is not allowed
       const canApprove = engine.canPerformAction(workflow, 'draft', 'approve', 'site_engineer');
       expect(canApprove).toBe(false);
    });

    it('should follow correct sequence', async () => {
      const instance: WorkflowInstance = {
           id: 'test-id',
           entityType: 'document',
           entityId: 'doc-1',
           currentStage: 'draft',
           history: [],
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString()
       };

       // Draft -> Submit -> Review
       const result = await engine.transitionWorkflow(instance, 'submit', 'user-1', 'User', 'site_engineer');
       expect(result.currentStage).toBe('review');
       
       // Review -> Approve -> Approval
       const result2 = await engine.transitionWorkflow(result, 'approve', 'manager-1', 'Manager', 'project_manager');
       expect(result2.currentStage).toBe('approval');
    });
  });

  describe('Expense Workflow', () => {
    it('should handle expense approval hierarchy', () => {
      const workflow = engine.getWorkflow('expense');
      if (!workflow) throw new Error('Workflow not found');
      const result = engine.canPerformAction(workflow, 'pending', 'submit', 'site_engineer');
      expect(result).toBe(true);
    });
  });
});

describe('Approval Service', () => {
  const service = approvalService;

  it('should be defined', () => {
      expect(service).toBeDefined();
  });
});
