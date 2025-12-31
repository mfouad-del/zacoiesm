/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from './supabase/client';

const supabase = createClient();

// Helper to create a standard CRUD interface for a table
const createApi = (table: string) => ({
  list: async () => {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return [];
    }
    return data || [];
  },
  create: async (payload: any) => {
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
    return true;
  },
  get: async (id: string) => {
    const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }
});

export const api = {
  projects: createApi('projects'),
  contracts: createApi('contracts'),
  variations: createApi('variations'),
  planning: createApi('tasks'),
  reports: createApi('reports'),
  quality: createApi('ncrs'),
  documents: createApi('documents'),
  timesheets: createApi('timesheets'),
  safety: createApi('incidents'),
  resources: createApi('resources'),
  users: createApi('users'),
  sites: createApi('sites'),
  equipment: createApi('equipment'),
  suppliers: createApi('suppliers'),
  procurementOrders: createApi('procurement_orders'),
  procurementItems: createApi('procurement_items'),
  correspondence: createApi('correspondence'),
  bimModels: createApi('bim_models'),
  expenses: createApi('expenses'),
  resourceTransactions: createApi('resource_transactions'),
};

// Export individual fetchers if needed for backward compatibility or specific use cases
export const fetchProjects = api.projects.list;
export const fetchContracts = api.contracts.list;
// Other fetchers are handled in lib/services.ts with more specific logic
