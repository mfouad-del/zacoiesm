import { createClient } from './supabase/client';
import { Expense, Supplier, ProcurementOrder, Correspondence, BIMModel } from '../types';

const supabase = createClient();

// --- Expenses ---
export async function fetchExpenses(projectId?: string) {
  let query = supabase.from('expenses').select('*').order('date', { ascending: false });
  if (projectId) query = query.eq('project_id', projectId);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createExpense(expense: Partial<Expense>) {
  const { data, error } = await supabase.from('expenses').insert(expense).select().single();
  if (error) throw error;
  return data;
}

// --- Suppliers ---
export async function fetchSuppliers() {
  const { data, error } = await supabase.from('suppliers').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function createSupplier(supplier: Partial<Supplier>) {
  const { data, error } = await supabase.from('suppliers').insert(supplier).select().single();
  if (error) throw error;
  return data;
}

// --- Procurement ---
export async function fetchProcurementOrders(projectId?: string) {
  let query = supabase.from('procurement_orders').select('*, items:procurement_items(*), supplier:suppliers(name)').order('created_at', { ascending: false });
  if (projectId) query = query.eq('project_id', projectId);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createProcurementOrder(order: Partial<ProcurementOrder>, items: Record<string, unknown>[]) {
  const { data: orderData, error: orderError } = await supabase
    .from('procurement_orders')
    .insert(order)
    .select()
    .single();
  
  if (orderError) throw orderError;

  if (items && items.length > 0) {
    const itemsWithOrderId = items.map(item => ({ ...item, order_id: orderData.id }));
    const { error: itemsError } = await supabase.from('procurement_items').insert(itemsWithOrderId);
    if (itemsError) throw itemsError;
  }

  return orderData;
}

export async function updateProcurementOrder(id: string, updates: Partial<ProcurementOrder>) {
  const { data, error } = await supabase.from('procurement_orders').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function updateSupplier(id: string, updates: Partial<Supplier>) {
  const { data, error } = await supabase.from('suppliers').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProcurementOrder(id: string) {
  const { error } = await supabase.from('procurement_orders').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// --- Inventory (Resources) ---
export async function fetchInventory(siteId?: string) {
  let query = supabase.from('resources').select('*').order('name');
  if (siteId) query = query.eq('site_id', siteId);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function updateInventoryQuantity(id: string, quantity: number) {
  const { data, error } = await supabase.from('resources').update({ quantity }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function createInventoryItem(item: Record<string, unknown>) {
  const { data, error } = await supabase.from('resources').insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function createResourceTransaction(transaction: Record<string, unknown>) {
  const { data, error } = await supabase.from('resource_transactions').insert(transaction).select().single();
  if (error) throw error;
  return data;
}

export async function fetchResourceTransactions(resourceId?: string) {
  let query = supabase.from('resource_transactions').select('*, resource:resources(name, unit), user:users(full_name)').order('transaction_date', { ascending: false });
  if (resourceId) query = query.eq('resource_id', resourceId);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// --- Correspondence ---
export async function fetchCorrespondence(projectId?: string) {
  let query = supabase.from('correspondence').select('*').order('date', { ascending: false });
  if (projectId) query = query.eq('project_id', projectId);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createCorrespondence(item: Partial<Correspondence>) {
  const { data, error } = await supabase.from('correspondence').insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateCorrespondence(id: string, updates: Partial<Correspondence>) {
  const { data, error } = await supabase.from('correspondence').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCorrespondence(id: string) {
  const { error } = await supabase.from('correspondence').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// --- BIM ---
export async function fetchBIMModels(projectId?: string) {
  let query = supabase.from('bim_models').select('*').order('created_at', { ascending: false });
  if (projectId) query = query.eq('project_id', projectId);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createBIMModel(model: Partial<BIMModel>) {
  const { data, error } = await supabase.from('bim_models').insert(model).select().single();
  if (error) throw error;
  return data;
}

export async function updateBIMModel(id: string, updates: Partial<BIMModel>) {
  const { data, error } = await supabase.from('bim_models').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBIMModel(id: string) {
  const { error } = await supabase.from('bim_models').delete().eq('id', id);
  if (error) throw error;
  return true;
}

// --- Audit Logs ---
export async function fetchAuditLogs(filters?: { action?: string; entityType?: string }) {
  let query = supabase.from('activity_logs').select('*, user:users(full_name)').order('created_at', { ascending: false }).limit(100);
  
  if (filters?.action && filters.action !== 'ALL') {
    query = query.eq('action', filters.action);
  }
  if (filters?.entityType && filters.entityType !== 'ALL') {
    query = query.eq('entity_type', filters.entityType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function logActivity(action: string, entityType: string, entityId?: string, details?: Record<string, unknown>) {
  const { error } = await supabase.from('activity_logs').insert({
    action,
    entity_type: entityType,
    entity_id: entityId,
    details
  });
  if (error) console.error('Failed to log activity:', error);
}

// --- Auth & Users ---
export async function changePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return true;
}

export async function fetchUsers() {
  const { data, error } = await supabase.from('users').select('*').order('full_name');
  if (error) throw error;
  return data;
}

export async function createUser(user: Record<string, unknown>) {
  const { data, error } = await supabase.from('users').insert(user).select().single();
  if (error) throw error;
  return data;
}

export async function deleteUser(id: string) {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
  return true;
}
