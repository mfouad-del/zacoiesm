/**
 * Advanced Reports Generator Service
 * Generates PDF/Excel reports with professional formatting
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { createClient } from '../supabase/client';

const supabase = createClient();

export type ReportType = 
  | 'project_summary'
  | 'cost_analysis'
  | 'quality_report'
  | 'safety_report'
  | 'progress_report'
  | 'timesheet_summary'
  | 'ncr_summary'
  | 'evm_report';

export interface ReportConfig {
  type: ReportType;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  format: 'pdf' | 'excel' | 'csv';
  filters?: Record<string, unknown>;
}

export interface ReportData {
  title: string;
  subtitle?: string;
  data: unknown[];
  summary?: Record<string, unknown>;
  charts?: ChartData[];
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie';
  title: string;
  data: unknown[];
}

class ReportGeneratorService {
  /**
   * Generate report based on config
   */
  async generateReport(config: ReportConfig): Promise<Blob> {
    const reportData = await this.fetchReportData(config);

    if (config.format === 'pdf') {
      return this.generatePDF(reportData, config);
    } else if (config.format === 'csv') {
      return this.generateCSV(reportData);
    } else {
      return this.generateExcel(reportData);
    }
  }

  /**
   * Generate PDF Report
   */
  private async generatePDF(data: ReportData, config: ReportConfig): Promise<Blob> {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text(data.title, 105, 20, { align: 'center' });

    if (data.subtitle) {
      doc.setFontSize(12);
      doc.text(data.subtitle, 105, 30, { align: 'center' });
    }

    // Metadata
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 45);
    doc.text(`Report Type: ${config.type}`, 14, 50);

    // Summary Section
    if (data.summary) {
      doc.setFontSize(14);
      doc.text('Summary', 14, 65);
      
      let yPos = 75;
      Object.entries(data.summary).forEach(([key, value]) => {
        doc.setFontSize(10);
        doc.text(`${key}: ${value}`, 20, yPos);
        yPos += 7;
      });
    }

    // Data Table
    if (Array.isArray(data.data) && data.data.length > 0) {
      const startY = data.summary ? 110 : 65;
      
      autoTable(doc, {
        head: [Object.keys((data.data as any[])[0])],
        body: (data.data as any[]).map((row: any) => Object.values(row)),
        startY,
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175] },
        styles: { fontSize: 9 }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    return doc.output('blob');
  }

  /**
   * Generate CSV Report
   */
  private generateCSV(data: ReportData): Blob {
    const csv = Papa.unparse(data.data);
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Generate Excel Report (CSV format for now)
   */
  private generateExcel(data: ReportData): Blob {
    // For true Excel, would use libraries like exceljs or xlsx
    return this.generateCSV(data);
  }

  /**
   * Fetch report data based on type
   */
  private async fetchReportData(config: ReportConfig): Promise<ReportData> {
    switch (config.type) {
      case 'project_summary':
        return this.fetchProjectSummary(config);
      case 'cost_analysis':
        return this.fetchCostAnalysis(config);
      case 'quality_report':
        return this.fetchQualityReport(config);
      case 'safety_report':
        return this.fetchSafetyReport(config);
      case 'progress_report':
        return this.fetchProgressReport(config);
      case 'evm_report':
        return this.fetchEVMReport(config);
      default:
        throw new Error('Unsupported report type');
    }
  }

  private async fetchProjectSummary(config: ReportConfig): Promise<ReportData> {
    const { data: project } = await supabase
      .from('projects')
      .select('*, tasks(*), expenses(*)')
      .eq('id', config.projectId)
      .single();

    const tasksCompleted = project.tasks?.filter((t: { status: string }) => t.status === 'completed').length || 0;
    const totalTasks = project.tasks?.length || 0;
    const totalExpenses = project.expenses?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0;

    return {
      title: `Project Summary: ${project.name}`,
      subtitle: `Code: ${project.code}`,
      summary: {
        'Project Status': project.status,
        'Progress': `${project.progress}%`,
        'Tasks Completed': `${tasksCompleted}/${totalTasks}`,
        'Budget': `$${project.budget.toLocaleString()}`,
        'Actual Cost': `$${totalExpenses.toLocaleString()}`,
        'Variance': `$${(project.budget - totalExpenses).toLocaleString()}`
      },
      data: project.tasks || []
    };
  }

  private async fetchCostAnalysis(config: ReportConfig): Promise<ReportData> {
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('project_id', config.projectId)
      .gte('date', config.startDate || '2024-01-01')
      .lte('date', config.endDate || '2025-12-31');

    const total = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const byCategory = expenses?.reduce((acc: Record<string, number>, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    return {
      title: 'Cost Analysis Report',
      summary: {
        'Total Expenses': `$${total.toLocaleString()}`,
        'Number of Transactions': expenses?.length || 0,
        ...Object.entries(byCategory || {}).reduce((acc, [key, value]) => {
          acc[key] = `$${(value as number).toLocaleString()}`;
          return acc;
        }, {} as Record<string, string>)
      },
      data: expenses || []
    };
  }

  private async fetchQualityReport(config: ReportConfig): Promise<ReportData> {
    const { data: ncrs } = await supabase
      .from('ncr_reports')
      .select('*')
      .eq('project_id', config.projectId);

    const open = ncrs?.filter(n => n.status === 'open').length || 0;
    const closed = ncrs?.filter(n => n.status === 'closed').length || 0;

    return {
      title: 'Quality Control Report - NCRs',
      summary: {
        'Total NCRs': ncrs?.length || 0,
        'Open': open,
        'Closed': closed,
        'Closure Rate': `${ncrs?.length ? ((closed / ncrs.length) * 100).toFixed(1) : 0}%`
      },
      data: ncrs || []
    };
  }

  private async fetchSafetyReport(config: ReportConfig): Promise<ReportData> {
    const { data: incidents } = await supabase
      .from('incidents')
      .select('*')
      .eq('project_id', config.projectId);

    return {
      title: 'Safety Report - Incidents',
      summary: {
        'Total Incidents': incidents?.length || 0,
        'Critical': incidents?.filter(i => i.severity === 'Critical').length || 0,
        'High': incidents?.filter(i => i.severity === 'High').length || 0,
        'Medium': incidents?.filter(i => i.severity === 'Medium').length || 0
      },
      data: incidents || []
    };
  }

  private async fetchProgressReport(config: ReportConfig): Promise<ReportData> {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', config.projectId);

    const avgProgress = tasks?.reduce((sum, t) => sum + (t.progress || 0), 0) / (tasks?.length || 1);

    return {
      title: 'Project Progress Report',
      summary: {
        'Total Tasks': tasks?.length || 0,
        'Completed': tasks?.filter(t => t.status === 'completed').length || 0,
        'In Progress': tasks?.filter(t => t.status === 'in_progress').length || 0,
        'Average Progress': `${avgProgress.toFixed(1)}%`
      },
      data: tasks || []
    };
  }

  private async fetchEVMReport(config: ReportConfig): Promise<ReportData> {
    // Fetch EVM data (would integrate with logic.ts)
    const { data: project } = await supabase
      .from('projects')
      .select('*, tasks(*), expenses(*)')
      .eq('id', config.projectId)
      .single();

    // Simplified EVM calculations
    const budget = project.budget;
    const actualCost = project.expenses?.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0) || 0;
    const progress = project.progress || 0;
    const earnedValue = (budget * progress) / 100;

    const cpi = actualCost > 0 ? earnedValue / actualCost : 1;
    const spi = budget > 0 ? earnedValue / budget : 1;

    return {
      title: 'Earned Value Management Report',
      summary: {
        'Budget (BAC)': `$${budget.toLocaleString()}`,
        'Actual Cost (AC)': `$${actualCost.toLocaleString()}`,
        'Earned Value (EV)': `$${earnedValue.toLocaleString()}`,
        'CPI': cpi.toFixed(2),
        'SPI': spi.toFixed(2),
        'Cost Variance': `$${(earnedValue - actualCost).toLocaleString()}`,
        'Schedule Variance': `$${(earnedValue - budget).toLocaleString()}`
      },
      data: []
    };
  }

  /**
   * Schedule report generation
   */
  async scheduleReport(
    config: ReportConfig,
    schedule: 'daily' | 'weekly' | 'monthly',
    recipients: string[]
  ): Promise<string> {
    const scheduledReport = {
      config,
      schedule,
      recipients,
      next_run: this.calculateNextRun(schedule),
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert(scheduledReport)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  }

  private calculateNextRun(schedule: 'daily' | 'weekly' | 'monthly'): string {
    const now = new Date();
    switch (schedule) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now.toISOString();
  }
}

export const reportGeneratorService = new ReportGeneratorService();
