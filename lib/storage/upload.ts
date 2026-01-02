/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * File Upload System - Cloudflare R2 (via Backend Presigned URLs)
 */

import { createClient } from '../supabase/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface UploadOptions {
  folder?: string;
  maxSize?: number; // MB
  allowedTypes?: string[];
}

const DEFAULT_OPTIONS: UploadOptions = {
  folder: 'uploads',
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
    'image/gif',
    'application/zip',
    'application/x-rar-compressed'
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
  // Validate file
  const validation = validateFile(file, options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // 1. Get Presigned URL from Backend
    const response = await fetch(`${API_URL}/upload/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        folder: options.folder
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, publicUrl, path } = await response.json();

    // 2. Upload to R2 using Presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to storage');
    }
    
    return {
      path,
      url: publicUrl
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Note: Delete and List operations should also be moved to backend
export const deleteFile = async (_path: string): Promise<boolean> => {
  console.warn('Delete operation requires backend implementation');
  return false; 
};

export const listFiles = async (_folder: string = 'uploads'): Promise<any[]> => {
  console.warn('List operation requires backend implementation');
  return [];
};

export const getFileUrl = (path: string): string => {
  // This might need adjustment based on how you serve files
  return `${import.meta.env.VITE_CF_R2_ENDPOINT}/${import.meta.env.VITE_CF_R2_BUCKET}/${path}`;
};

