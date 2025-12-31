
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const projectsApi = {
  list: async () => {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    return data;
  },
  get: async (id: string) => {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },
  create: async (project: any) => {
    const { data, error } = await supabase.from('projects').insert(project).select().single();
    if (error) throw error;
    return data;
  },
  update: async (id: string, updates: any) => {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  delete: async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  }
};
