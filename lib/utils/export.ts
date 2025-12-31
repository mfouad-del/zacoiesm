/**
 * Export Utilities - Excel & PDF
 */

import * as XLSX from 'xlsx';
/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Load Arabic Font
const loadArabicFont = async (doc: jsPDF) => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/amiri/Amiri-Regular.ttf');
    const blob = await response.blob();
    const reader = new FileReader();
    
    return new Promise<void>((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const fontData = base64data.split(',')[1];
        doc.addFileToVFS('Amiri-Regular.ttf', fontData);
        doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
        doc.setFont('Amiri');
        resolve();
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load Arabic font:', error);
  }
};

// Excel Export
export const exportToExcel = (data: Record<string, any>[], filename: string, sheetName: string = 'Sheet1') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    
    // Set RTL direction for the sheet
    ws['!dir'] = 'rtl';
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Auto-fit columns
    const maxWidth = data.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => String(v).length)), 10);
    ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: Math.min(maxWidth + 5, 50) })); // Cap width at 50
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Excel export failed:', error);
    return false;
  }
};

// PDF Export
export const exportToPDF = async (
  data: Record<string, any>[], 
  columns: string[], 
  filename: string,
  title: string = 'Report'
) => {
  try {
    const doc = new jsPDF();
    
    // Try to load Arabic font
    await loadArabicFont(doc);
    
    // Add title
    doc.setFontSize(18);
    doc.text(title, doc.internal.pageSize.width - 20, 20, { align: 'right', lang: 'ar' });
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString('ar-SA')}`, 14, 28);
    
    // Add table
    autoTable(doc, {
      head: [columns.reverse()], // Reverse columns for RTL
      body: data.map(row => columns.map(col => row[col] || '').reverse()), // Reverse data for RTL
      startY: 35,
      styles: {
        font: 'Amiri', // Use the loaded font
        fontSize: 10,
        halign: 'right', // Right align text
      },
      headStyles: {
        fillColor: [2, 113, 199],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'right'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      theme: 'grid'
    });
    
    doc.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    return false;
  }
};

// CSV Export
export const exportToCSV = (data: Record<string, any>[], filename: string) => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('CSV export failed:', error);
    return false;
  }
};

// Import from CSV
export const importFromCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
