/**
 * File Upload System - Supabase Storage
 */

import { createClient } from '../supabase/client';

export interface UploadOptions {
  bucket: string;
  folder?: string;
  maxSize?: number; // MB
  allowedTypes?: string[];
}

const DEFAULT_OPTIONS: UploadOptions = {
  bucket: 'documents',
  maxSize: 50, // 50MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/zip'
  ]
};

export const validateFile = (file: File, options: UploadOptions = DEFAULT_OPTIONS): { valid: boolean; error?: string } => {
  // Check size
  const maxBytes = (options.maxSize || 50) * 1024 * 1024;
  if (file.size > maxBytes) {
    return { valid: false, error: `حجم الملف يجب أن يكون أقل من ${options.maxSize}MB` };
  }
  
  // Check type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return { valid: false, error: 'نوع الملف غير مدعوم' };
  }
  
  return { valid: true };
};

export const uploadFile = async (
  file: File, 
  options: UploadOptions = DEFAULT_OPTIONS
): Promise<{ path: string; url: string } | null> => {
  const supabase = createClient();
  
  // Validate file
  const validation = validateFile(file, options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomStr}.${extension}`;
    
    // Build path
    const folder = options.folder || 'uploads';
    const path = `${folder}/${user.id}/${filename}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(options.bucket)
      .getPublicUrl(path);
    
    return {
      path: data.path,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

export const deleteFile = async (path: string, bucket: string = 'documents'): Promise<boolean> => {
  const supabase = createClient();
  
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
};

export const listFiles = async (folder: string, bucket: string = 'documents'): Promise<any[]> => {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(`${folder}/${user.id}`, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('List files failed:', error);
    return [];
  }
};

export const getFileUrl = (path: string, bucket: string = 'documents'): string => {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};
