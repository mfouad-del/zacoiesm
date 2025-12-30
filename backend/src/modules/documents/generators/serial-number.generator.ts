/**
 * Serial Number Generator
 * Generates unique serial numbers for documents based on project, type, and sequence.
 * Format: PROJ-TYPE-YEAR-SEQ (e.g., PRJ001-NCR-2024-0001)
 */

export class SerialNumberGenerator {
  static generate(projectCode: string, docType: string, sequence: number, year: number = new Date().getFullYear()): string {
    const paddedSequence = sequence.toString().padStart(4, '0');
    return `${projectCode}-${docType}-${year}-${paddedSequence}`;
  }
}
