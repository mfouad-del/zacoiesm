/**
 * Global Search Service
 * Full-text search across all modules
 */

import { createClient } from '../supabase/client';

const supabase = createClient();

export type SearchableEntity =
  | 'projects'
  | 'tasks'
  | 'documents'
  | 'ncrs'
  | 'expenses'
  | 'users'
  | 'contracts';

export interface SearchResult {
  id: string;
  entityType: SearchableEntity;
  title: string;
  description?: string;
  url: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

export interface SearchFilters {
  entityTypes?: SearchableEntity[];
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

class GlobalSearchService {
  /**
   * Search across all entities
   */
  async search(query: string, filters?: SearchFilters, limit = 50): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    const entityTypes = filters?.entityTypes || [
      'projects',
      'tasks',
      'documents',
      'ncrs',
      'expenses',
      'contracts'
    ];

    // Search in parallel
    const searches = entityTypes.map((type) => this.searchEntity(type, query, filters, limit));
    const allResults = await Promise.all(searches);

    // Combine and sort by relevance
    allResults.forEach((entityResults) => {
      results.push(...entityResults);
    });

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
  }

  /**
   * Search specific entity type
   */
  private async searchEntity(
    entityType: SearchableEntity,
    query: string,
    filters?: SearchFilters,
    limit = 20
  ): Promise<SearchResult[]> {
    const searchQuery = `%${query.toLowerCase()}%`;

    switch (entityType) {
      case 'projects':
        return this.searchProjects(searchQuery, filters, limit);
      case 'tasks':
        return this.searchTasks(searchQuery, filters, limit);
      case 'documents':
        return this.searchDocuments(searchQuery, filters, limit);
      case 'ncrs':
        return this.searchNCRs(searchQuery, filters, limit);
      case 'expenses':
        return this.searchExpenses(searchQuery, filters, limit);
      case 'contracts':
        return this.searchContracts(searchQuery, filters, limit);
      default:
        return [];
    }
  }

  private async searchProjects(
    query: string,
    filters?: SearchFilters,
    limit = 20
  ): Promise<SearchResult[]> {
    let dbQuery = supabase
      .from('projects')
      .select('*')
      .or(`name.ilike.${query},code.ilike.${query},description.ilike.${query}`)
      .limit(limit);

    if (filters?.status) {
      dbQuery = dbQuery.eq('status', filters.status);
    }

    const { data, error } = await dbQuery;

    if (error || !data) return [];

    return data.map((project) => ({
      id: project.id,
      entityType: 'projects' as const,
      title: project.name,
      description: project.code,
      url: `/dashboard/projects/${project.id}`,
      relevance: this.calculateRelevance(query, project.name + ' ' + project.code),
      metadata: { status: project.status, budget: project.budget }
    }));
  }

  private async searchTasks(
    query: string,
    filters?: SearchFilters,
    limit = 20
  ): Promise<SearchResult[]> {
    let dbQuery = supabase
      .from('tasks')
      .select('*')
      .or(`title.ilike.${query},description.ilike.${query}`)
      .limit(limit);

    if (filters?.projectId) {
      dbQuery = dbQuery.eq('project_id', filters.projectId);
    }

    const { data, error } = await dbQuery;

    if (error || !data) return [];

    return data.map((task) => ({
      id: task.id,
      entityType: 'tasks' as const,
      title: task.title,
      description: task.description,
      url: `/dashboard/planning?task=${task.id}`,
      relevance: this.calculateRelevance(query, task.title),
      metadata: { status: task.status, progress: task.progress }
    }));
  }

  private async searchDocuments(
    query: string,
    filters?: SearchFilters,
    limit = 20
  ): Promise<SearchResult[]> {
    let dbQuery = supabase
      .from('documents')
      .select('*')
      .or(`title.ilike.${query},code.ilike.${query},description.ilike.${query}`)
      .limit(limit);

    if (filters?.projectId) {
      dbQuery = dbQuery.eq('project_id', filters.projectId);
    }

    const { data, error } = await dbQuery;

    if (error || !data) return [];

    return data.map((doc) => ({
      id: doc.id,
      entityType: 'documents' as const,
      title: doc.title,
      description: doc.code,
      url: `/dashboard/documents?doc=${doc.id}`,
      relevance: this.calculateRelevance(query, doc.title + ' ' + doc.code),
      metadata: { status: doc.status, category: doc.category }
    }));
  }

  private async searchNCRs(
    query: string,
    filters?: SearchFilters,
    limit = 20
  ): Promise<SearchResult[]> {
    let dbQuery = supabase
      .from('ncr_reports')
      .select('*')
      .or(`title.ilike.${query},description.ilike.${query}`)
      .limit(limit);

    if (filters?.projectId) {
      dbQuery = dbQuery.eq('project_id', filters.projectId);
    }

    const { data, error } = await dbQuery;

    if (error || !data) return [];

    return data.map((ncr) => ({
      id: ncr.id,
      entityType: 'ncrs' as const,
      title: ncr.title,
      description: ncr.description,
      url: `/dashboard/quality?ncr=${ncr.id}`,
      relevance: this.calculateRelevance(query, ncr.title),
      metadata: { severity: ncr.severity, status: ncr.status }
    }));
  }

  private async searchExpenses(
    query: string,
    filters?: SearchFilters,
    limit = 20
  ): Promise<SearchResult[]> {
    let dbQuery = supabase
      .from('expenses')
      .select('*')
      .or(`description.ilike.${query},vendor.ilike.${query}`)
      .limit(limit);

    if (filters?.projectId) {
      dbQuery = dbQuery.eq('project_id', filters.projectId);
    }

    const { data, error } = await dbQuery;

    if (error || !data) return [];

    return data.map((expense) => ({
      id: expense.id,
      entityType: 'expenses' as const,
      title: expense.description,
      description: `$${expense.amount}`,
      url: `/dashboard/costs?expense=${expense.id}`,
      relevance: this.calculateRelevance(query, expense.description),
      metadata: { amount: expense.amount, status: expense.status }
    }));
  }

  private async searchContracts(
    query: string,
    filters?: SearchFilters,
    limit = 20
  ): Promise<SearchResult[]> {
    const dbQuery = supabase
      .from('contracts')
      .select('*')
      .or(`title.ilike.${query},vendor.ilike.${query}`)
      .limit(limit);

    const { data, error } = await dbQuery;

    if (error || !data) return [];

    return data.map((contract) => ({
      id: contract.id,
      entityType: 'contracts' as const,
      title: contract.title,
      description: contract.vendor,
      url: `/dashboard/contracts?contract=${contract.id}`,
      relevance: this.calculateRelevance(query, contract.title),
      metadata: { value: contract.value, status: contract.status }
    }));
  }

  /**
   * Calculate search relevance score
   */
  private calculateRelevance(query: string, text: string): number {
    const q = query.toLowerCase().replace(/%/g, '');
    const t = text.toLowerCase();

    // Exact match
    if (t === q) return 100;

    // Starts with
    if (t.startsWith(q)) return 90;

    // Contains
    if (t.includes(q)) return 70;

    // Word match
    const words = q.split(' ');
    const matchedWords = words.filter((word) => t.includes(word)).length;
    return (matchedWords / words.length) * 50;
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, limit = 10): Promise<string[]> {
    if (query.length < 2) return [];

    const results = await this.search(query, undefined, limit);
    return [...new Set(results.map((r) => r.title))];
  }
}

export const globalSearchService = new GlobalSearchService();
