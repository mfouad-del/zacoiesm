/**
 * Document Revision Control System
 * Handles Rev A, Rev B, Rev C... versioning
 */

import { createClient } from '../supabase/client';

const supabase = createClient();

export interface DocumentRevision {
  id: string;
  documentId: string;
  revisionNumber: string; // A, B, C, etc.
  version: number; // 1, 2, 3, etc.
  title: string;
  description?: string;
  fileUrl: string;
  fileSize: number;
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'review' | 'approved' | 'superseded';
  approvedBy?: string;
  approvedAt?: string;
  changes?: string;
}

export interface RevisionComparison {
  oldRevision: DocumentRevision;
  newRevision: DocumentRevision;
  changes: string[];
}

class RevisionService {
  /**
   * Generate next revision letter (A -> B -> C ... Z -> AA -> AB)
   */
  generateNextRevision(currentRevision: string): string {
    if (!currentRevision) return 'A';

    const letters = currentRevision.split('');
    let carry = true;

    for (let i = letters.length - 1; i >= 0 && carry; i--) {
      if (letters[i] === 'Z') {
        letters[i] = 'A';
      } else {
        letters[i] = String.fromCharCode(letters[i].charCodeAt(0) + 1);
        carry = false;
      }
    }

    if (carry) {
      letters.unshift('A');
    }

    return letters.join('');
  }

  /**
   * Create new revision for document
   */
  async createRevision(
    documentId: string,
    fileUrl: string,
    fileSize: number,
    userId: string,
    changes?: string
  ): Promise<DocumentRevision> {
    // Get latest revision
    const { data: latestRevision } = await supabase
      .from('document_revisions')
      .select('*')
      .eq('document_id', documentId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const nextRevisionNumber = latestRevision
      ? this.generateNextRevision(latestRevision.revisionNumber)
      : 'A';

    const nextVersion = latestRevision ? latestRevision.version + 1 : 1;

    // Mark previous revision as superseded
    if (latestRevision) {
      await supabase
        .from('document_revisions')
        .update({ status: 'superseded' })
        .eq('id', latestRevision.id);
    }

    // Create new revision
    const revision: Omit<DocumentRevision, 'id'> = {
      documentId,
      revisionNumber: nextRevisionNumber,
      version: nextVersion,
      title: `Revision ${nextRevisionNumber}`,
      fileUrl,
      fileSize,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      status: 'draft',
      changes
    };

    const { data, error } = await supabase
      .from('document_revisions')
      .insert(revision)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get revision history for document
   */
  async getRevisionHistory(documentId: string): Promise<DocumentRevision[]> {
    const { data, error } = await supabase
      .from('document_revisions')
      .select('*, creator:users!created_by(full_name), approver:users!approved_by(full_name)')
      .eq('document_id', documentId)
      .order('version', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get specific revision
   */
  async getRevision(documentId: string, revisionNumber: string): Promise<DocumentRevision | null> {
    const { data, error } = await supabase
      .from('document_revisions')
      .select('*')
      .eq('document_id', documentId)
      .eq('revision_number', revisionNumber)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Approve revision
   */
  async approveRevision(revisionId: string, approverId: string): Promise<DocumentRevision> {
    const { data, error } = await supabase
      .from('document_revisions')
      .update({
        status: 'approved',
        approvedBy: approverId,
        approvedAt: new Date().toISOString()
      })
      .eq('id', revisionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Compare two revisions
   */
  async compareRevisions(
    documentId: string,
    oldRevisionNumber: string,
    newRevisionNumber: string
  ): Promise<RevisionComparison> {
    const oldRevision = await this.getRevision(documentId, oldRevisionNumber);
    const newRevision = await this.getRevision(documentId, newRevisionNumber);

    if (!oldRevision || !newRevision) {
      throw new Error('Revisions not found');
    }

    // Simple comparison - in real implementation, would do file comparison
    const changes = [
      `Revision ${oldRevisionNumber} → ${newRevisionNumber}`,
      newRevision.changes || 'No changes documented'
    ];

    return {
      oldRevision,
      newRevision,
      changes
    };
  }

  /**
   * Get current (latest approved) revision
   */
  async getCurrentRevision(documentId: string): Promise<DocumentRevision | null> {
    const { data, error } = await supabase
      .from('document_revisions')
      .select('*')
      .eq('document_id', documentId)
      .eq('status', 'approved')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error) return null;
    return data;
  }
}

export const revisionService = new RevisionService();
