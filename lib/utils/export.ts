/**
 * Export Utilities - Excel & PDF
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Excel Export
export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Auto-fit columns
    const maxWidth = data.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => String(v).length)), 10);
    ws['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }));
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Excel export failed:', error);
    return false;
  }
};

// PDF Export
export const exportToPDF = (
  data: any[], 
  columns: string[], 
  filename: string,
  title: string = 'Report'
) => {
  try {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString('ar-SA')}`, 14, 22);
    
    // Add table
    autoTable(doc, {
      head: [columns],
      body: data.map(row => columns.map(col => row[col] || '')),
      startY: 30,
      styles: {
        font: 'helvetica',
        fontSize: 9
      },
      headStyles: {
        fillColor: [2, 113, 199],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      }
    });
    
    doc.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF export failed:', error);
    return false;
  }
};

// CSV Export
export const exportToCSV = (data: any[], filename: string) => {
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
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsBinaryString(file);
  });
};
