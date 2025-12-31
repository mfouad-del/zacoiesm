/**
 * Document Transmittal Tracking System
 */

import { createClient } from '../supabase/client';
import { serialNumberGenerator } from './numbering.service';

const supabase = createClient();

export interface Transmittal {
  id: string;
  transmittalNumber: string;
  projectId: string;
  subject: string;
  sender: string;
  senderOrganization: string;
  recipient: string;
  recipientOrganization: string;
  transmittalDate: string;
  dueDate?: string;
  status: 'draft' | 'sent' | 'received' | 'acknowledged' | 'rejected';
  type: 'drawing' | 'document' | 'material' | 'sample' | 'other';
  documents: TransmittalDocument[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransmittalDocument {
  id: string;
  documentId: string;
  documentNumber: string;
  title: string;
  revision: string;
  copies: number;
  format: 'pdf' | 'dwg' | 'excel' | 'word' | 'other';
  action: 'for_approval' | 'for_review' | 'for_information' | 'for_construction';
}

export interface TransmittalHistory {
  id: string;
  transmittalId: string;
  action: 'created' | 'sent' | 'received' | 'acknowledged' | 'rejected' | 'updated';
  performedBy: string;
  performedAt: string;
  comment?: string;
}

class TransmittalService {
  /**
   * Create new transmittal
   */
  async createTransmittal(
    transmittal: Omit<Transmittal, 'id' | 'transmittalNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<Transmittal> {
    // Generate transmittal number
    const transmittalNumber = await serialNumberGenerator.generateTransmittalNumber(
      transmittal.projectId
    );

    const newTransmittal: Omit<Transmittal, 'id'> = {
      ...transmittal,
      transmittalNumber,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('transmittals')
      .insert(newTransmittal)
      .select()
      .single();

    if (error) throw error;

    // Create history entry
    await this.addHistoryEntry(data.id, 'created', transmittal.createdBy);

    return data;
  }

  /**
   * Send transmittal
   */
  async sendTransmittal(transmittalId: string, userId: string): Promise<Transmittal> {
    const { data, error } = await supabase
      .from('transmittals')
      .update({
        status: 'sent',
        transmittalDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('id', transmittalId)
      .select()
      .single();

    if (error) throw error;

    await this.addHistoryEntry(transmittalId, 'sent', userId);

    return data;
  }

  /**
   * Acknowledge transmittal receipt
   */
  async acknowledgeTransmittal(
    transmittalId: string,
    userId: string,
    comment?: string
  ): Promise<Transmittal> {
    const { data, error } = await supabase
      .from('transmittals')
      .update({
        status: 'acknowledged',
        updatedAt: new Date().toISOString()
      })
      .eq('id', transmittalId)
      .select()
      .single();

    if (error) throw error;

    await this.addHistoryEntry(transmittalId, 'acknowledged', userId, comment);

    return data;
  }

  /**
   * Get transmittal history
   */
  async getTransmittalHistory(transmittalId: string): Promise<TransmittalHistory[]> {
    const { data, error } = await supabase
      .from('transmittal_history')
      .select('*, user:users!performed_by(full_name)')
      .eq('transmittal_id', transmittalId)
      .order('performed_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get transmittals for project
   */
  async getProjectTransmittals(projectId: string): Promise<Transmittal[]> {
    const { data, error } = await supabase
      .from('transmittals')
      .select('*')
      .eq('project_id', projectId)
      .order('transmittal_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get pending transmittals for user
   */
  async getPendingTransmittals(userId: string): Promise<Transmittal[]> {
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (!user) return [];

    const { data, error } = await supabase
      .from('transmittals')
      .select('*')
      .eq('recipient', user.email)
      .in('status', ['sent', 'received'])
      .order('transmittal_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Add documents to transmittal
   */
  async addDocumentsToTransmittal(
    transmittalId: string,
    documents: TransmittalDocument[]
  ): Promise<void> {
    const { error } = await supabase.from('transmittal_documents').insert(
      documents.map((doc) => ({
        ...doc,
        transmittal_id: transmittalId
      }))
    );

    if (error) throw error;
  }

  /**
   * Generate transmittal cover sheet (PDF)
   */
  async generateCoverSheet(transmittalId: string): Promise<Blob> {
    const { data: transmittal } = await supabase
      .from('transmittals')
      .select('*, documents:transmittal_documents(*)')
      .eq('id', transmittalId)
      .single();

    if (!transmittal) throw new Error('Transmittal not found');

    // Use jsPDF to generate cover sheet
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('TRANSMITTAL COVER SHEET', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Transmittal No: ${transmittal.transmittalNumber}`, 20, 40);
    doc.text(`Date: ${new Date(transmittal.transmittalDate).toLocaleDateString()}`, 20, 50);
    doc.text(`To: ${transmittal.recipient}`, 20, 60);
    doc.text(`From: ${transmittal.sender}`, 20, 70);
    doc.text(`Subject: ${transmittal.subject}`, 20, 80);

    doc.text('Documents:', 20, 100);

    let yPos = 110;
    transmittal.documents?.forEach((docItem: TransmittalDocument, index: number) => {
      doc.text(
        `${index + 1}. ${docItem.documentNumber} - ${docItem.title} (Rev ${docItem.revision})`,
        25,
        yPos
      );
      yPos += 10;
    });

    return doc.output('blob');
  }

  private async addHistoryEntry(
    transmittalId: string,
    action: TransmittalHistory['action'],
    userId: string,
    comment?: string
  ): Promise<void> {
    await supabase.from('transmittal_history').insert({
      transmittal_id: transmittalId,
      action,
      performed_by: userId,
      performed_at: new Date().toISOString(),
      comment
    });
  }
}

export const transmittalService = new TransmittalService();
