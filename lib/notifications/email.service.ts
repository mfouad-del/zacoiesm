/**
 * Email Notification Service
 * Integration with email providers (Resend/SendGrid)
 */

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface EmailTemplate {
  type: 'approval_required' | 'approval_approved' | 'approval_rejected' | 'task_assigned' | 'ncr_created';
  data: Record<string, unknown>;
}

class EmailService {
  constructor() {
    // External email providers are intentionally disabled in this project.
  }

  async send(notification: EmailNotification): Promise<boolean> {
    console.warn('Email sending is disabled (no external APIs).');
    return false;
  }

  async sendFromTemplate(to: string, template: EmailTemplate): Promise<boolean> {
    const { subject, html, text } = this.buildTemplate(template);

    return this.send({
      to,
      subject,
      html,
      text
    });
  }

  private buildTemplate(template: EmailTemplate): { subject: string; html: string; text: string } {
    switch (template.type) {
      case 'approval_required':
        return {
          subject: 'Approval Required - IEMS',
          html: this.buildApprovalRequiredHTML(template.data),
          text: `Approval Required: ${template.data.entityType} #${template.data.entityId}`
        };

      case 'approval_approved':
        return {
          subject: 'Your Request has been Approved - IEMS',
          html: this.buildApprovalApprovedHTML(template.data),
          text: `Your ${template.data.entityType} request has been approved.`
        };

      case 'approval_rejected':
        return {
          subject: 'Your Request has been Rejected - IEMS',
          html: this.buildApprovalRejectedHTML(template.data),
          text: `Your ${template.data.entityType} request has been rejected.`
        };

      case 'task_assigned':
        return {
          subject: 'New Task Assigned - IEMS',
          html: this.buildTaskAssignedHTML(template.data),
          text: `You have been assigned a new task: ${template.data.taskName}`
        };

      case 'ncr_created':
        return {
          subject: 'New NCR Created - IEMS',
          html: this.buildNCRCreatedHTML(template.data),
          text: `New NCR created: ${template.data.ncrTitle}`
        };

      default:
        return {
          subject: 'Notification - IEMS',
          html: '<p>You have a new notification.</p>',
          text: 'You have a new notification.'
        };
    }
  }

  private buildApprovalRequiredHTML(data: Record<string, unknown>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Approval Required</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>A new <strong>${data.entityType}</strong> requires your approval:</p>
            <ul>
              <li><strong>ID:</strong> ${data.entityId}</li>
              <li><strong>Requester:</strong> ${data.requesterName}</li>
              <li><strong>Date:</strong> ${new Date().toLocaleDateString()}</li>
            </ul>
            <a href="${data.link || '#'}" class="button">Review Now</a>
          </div>
          <div class="footer">
            <p>© 2025 IEMS - Integrated Engineering Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private buildApprovalApprovedHTML(data: Record<string, unknown>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><style>body { font-family: Arial, sans-serif; } .container { max-width: 600px; margin: 0 auto; padding: 20px; }</style></head>
      <body>
        <div class="container">
          <h2 style="color: #10b981;">✓ Approved</h2>
          <p>Your <strong>${data.entityType}</strong> request has been approved.</p>
          <p><strong>ID:</strong> ${data.entityId}</p>
          <p><strong>Approved by:</strong> ${data.approverName}</p>
        </div>
      </body>
      </html>
    `;
  }

  private buildApprovalRejectedHTML(data: Record<string, unknown>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><style>body { font-family: Arial, sans-serif; } .container { max-width: 600px; margin: 0 auto; padding: 20px; }</style></head>
      <body>
        <div class="container">
          <h2 style="color: #ef4444;">✗ Rejected</h2>
          <p>Your <strong>${data.entityType}</strong> request has been rejected.</p>
          <p><strong>ID:</strong> ${data.entityId}</p>
          <p><strong>Reason:</strong> ${data.comment || 'No reason provided'}</p>
        </div>
      </body>
      </html>
    `;
  }

  private buildTaskAssignedHTML(data: Record<string, unknown>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><style>body { font-family: Arial, sans-serif; }</style></head>
      <body>
        <h2>New Task Assigned</h2>
        <p><strong>Task:</strong> ${data.taskName}</p>
        <p><strong>Project:</strong> ${data.projectName}</p>
        <p><strong>Due Date:</strong> ${data.dueDate}</p>
      </body>
      </html>
    `;
  }

  private buildNCRCreatedHTML(data: Record<string, unknown>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><style>body { font-family: Arial, sans-serif; }</style></head>
      <body>
        <h2>New NCR Created</h2>
        <p><strong>NCR:</strong> ${data.ncrTitle}</p>
        <p><strong>Severity:</strong> ${data.severity}</p>
        <p><strong>Location:</strong> ${data.location}</p>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
