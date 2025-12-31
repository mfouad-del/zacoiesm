/**
 * Document Serial Number Generator
 * Generates unique serial numbers like: IEMS-DWG-001, IEMS-RFI-042, etc.
 */

import { createClient } from '../supabase/client';

const supabase = createClient();

export type DocumentCategory = 'DWG' | 'RFI' | 'SUB' | 'CNT' | 'RPT' | 'SPC' | 'TRN' | 'NCR' | 'DOC';

export interface SerialNumberConfig {
  category: DocumentCategory;
  prefix: string; // e.g., "IEMS"
  format: string; // e.g., "{PREFIX}-{CATEGORY}-{NUMBER}"
  paddingLength: number; // e.g., 3 for "001"
  startNumber: number;
}

const DEFAULT_CONFIGS: Record<DocumentCategory, SerialNumberConfig> = {
  DWG: { category: 'DWG', prefix: 'IEMS', format: '{PREFIX}-{CATEGORY}-{NUMBER}', paddingLength: 4, startNumber: 1 },
  RFI: { category: 'RFI', prefix: 'IEMS', format: '{PREFIX}-{CATEGORY}-{NUMBER}', paddingLength: 3, startNumber: 1 },
  SUB: { category: 'SUB', prefix: 'IEMS', format: '{PREFIX}-{CATEGORY}-{NUMBER}', paddingLength: 3, startNumber: 1 },
  CNT: { category: 'CNT', prefix: 'IEMS', format: '{PREFIX}-{CATEGORY}-{NUMBER}', paddingLength: 3, startNumber: 1 },
  RPT: { category: 'RPT', prefix: 'IEMS', format: '{PREFIX}-{CATEGORY}-{NUMBER}', paddingLength: 4, startNumber: 1 },
  SPC: { category: 'SPC', prefix: 'IEMS', format: '{PREFIX}-{CATEGORY}-{NUMBER}', paddingLength: 3, startNumber: 1 },
  TRN: { category: 'TRN', prefix: 'IEMS', format: '{PREFIX}-{CATEGORY}-{NUMBER}', paddingLength: 4, startNumber: 1 },
  NCR: { category: 'NCR', prefix: 'IEMS', format: '{PREFIX}-{CATEGORY}-{NUMBER}', paddingLength: 4, startNumber: 1 },
  DOC: { category: 'DOC', prefix: 'IEMS', format: '{PREFIX}-{CATEGORY}-{NUMBER}', paddingLength: 4, startNumber: 1 }
};

class SerialNumberGenerator {
  /**
   * Generate next serial number for category
   */
  async generateSerialNumber(
    category: DocumentCategory,
    projectCode?: string
  ): Promise<string> {
    const config = DEFAULT_CONFIGS[category];

    // Get last serial number from database
    const { data: lastDoc } = await supabase
      .from('document_serial_numbers')
      .select('serial_number, sequence_number')
      .eq('category', category)
      .order('sequence_number', { ascending: false })
      .limit(1)
      .single();

    const nextNumber = lastDoc ? lastDoc.sequence_number + 1 : config.startNumber;

    // Build serial number
    let serialNumber = config.format
      .replace('{PREFIX}', config.prefix)
      .replace('{CATEGORY}', category)
      .replace('{NUMBER}', this.padNumber(nextNumber, config.paddingLength));

    if (projectCode) {
      serialNumber = `${projectCode}-${serialNumber}`;
    }

    // Save to database
    await supabase.from('document_serial_numbers').insert({
      category,
      serial_number: serialNumber,
      sequence_number: nextNumber,
      project_code: projectCode,
      created_at: new Date().toISOString()
    });

    return serialNumber;
  }

  /**
   * Generate transmittal number
   */
  async generateTransmittalNumber(projectCode?: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    const prefix = projectCode || 'IEMS';

    // Get count for this month
    const { count } = await supabase
      .from('transmittals')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today.getFullYear()}-${month}-01`)
      .lt('created_at', `${today.getFullYear()}-${month + 1}-01`);

    const sequence = ((count || 0) + 1).toString().padStart(3, '0');

    return `${prefix}-TRN-${year}${month}-${sequence}`;
  }

  /**
   * Validate serial number format
   */
  validateSerialNumber(serialNumber: string, category: DocumentCategory): boolean {
    const config = DEFAULT_CONFIGS[category];
    const pattern = config.format
      .replace('{PREFIX}', config.prefix)
      .replace('{CATEGORY}', category)
      .replace('{NUMBER}', `\\d{${config.paddingLength}}`);

    const regex = new RegExp(`^${pattern}$`);
    return regex.test(serialNumber);
  }

  /**
   * Parse serial number
   */
  parseSerialNumber(serialNumber: string): {
    prefix: string;
    category: string;
    number: number;
    projectCode?: string;
  } | null {
    const parts = serialNumber.split('-');

    if (parts.length < 3) return null;

    const hasProjectCode = parts.length === 4;

    return {
      projectCode: hasProjectCode ? parts[0] : undefined,
      prefix: hasProjectCode ? parts[1] : parts[0],
      category: hasProjectCode ? parts[2] : parts[1],
      number: parseInt(hasProjectCode ? parts[3] : parts[2])
    };
  }

  private padNumber(num: number, length: number): string {
    return num.toString().padStart(length, '0');
  }

  /**
   * Get next available number for category
   */
  async getNextSequenceNumber(category: DocumentCategory): Promise<number> {
    const { data } = await supabase
      .from('document_serial_numbers')
      .select('sequence_number')
      .eq('category', category)
      .order('sequence_number', { ascending: false })
      .limit(1)
      .single();

    const config = DEFAULT_CONFIGS[category];
    return data ? data.sequence_number + 1 : config.startNumber;
  }

  /**
   * Reserve serial number (prevent duplicates in concurrent operations)
   */
  async reserveSerialNumber(
    category: DocumentCategory,
    userId: string
  ): Promise<{ serialNumber: string; reservationId: string }> {
    const serialNumber = await this.generateSerialNumber(category);
    const reservationId = `res_${Date.now()}`;

    await supabase.from('serial_number_reservations').insert({
      id: reservationId,
      serial_number: serialNumber,
      category,
      user_id: userId,
      expires_at: new Date(Date.now() + 300000).toISOString() // 5 minutes
    });

    return { serialNumber, reservationId };
  }
}

export const serialNumberGenerator = new SerialNumberGenerator();
