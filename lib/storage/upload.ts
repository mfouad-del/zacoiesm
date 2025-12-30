/**
 * File Upload System - Cloudflare R2 (S3-Compatible)
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// Initialize R2 Client
const r2Client = new S3Client({
  region: import.meta.env.VITE_CF_R2_REGION || 'auto',
  endpoint: import.meta.env.VITE_CF_R2_ENDPOINT,
  credentials: {
    accessKeyId: import.meta.env.VITE_CF_R2_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_CF_R2_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = import.meta.env.VITE_CF_R2_BUCKET || 'zaco';
const BASE_FOLDER = import.meta.env.VITE_CF_R2_FOLDER || 'zacoengineer';

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
):// Validate file
  const validation = validateFile(file, options);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const originalName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9_-]/g, '_'); // Sanitize
    const filename = `${sanitizedName}_${timestamp}_${randomStr}.${extension}`;
    
    // Build path: zacoengineer/uploads/2025/12/filename.pdf
    const folder = options.folder || 'uploads';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const path = `${BASE_FOLDER}/${folder}/${year}/${month}/${filename}`;
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload to Cloudflare R2
    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: path,
        Body: new Uint8Array(arrayBuffer),
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadDate: now.toISOString()
        }
      }
    });
    
    await upload.done();
    
    // Build public URL
    const publicUrl = `${import.meta.env.VITE_CF_R2_ENDPOINT}/${BUCKET_NAME}/${path}`;
    
    return {
      path,
      url: th,
      url: urlData.publicUrl): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: path
    });
    
    await r2Client.send(command)async (path: string, bucket: string = 'documents'): Promise<boolean> => {
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
  const supabase = createClient(); = 'uploads'): Promise<any[]> => {
  try {
    const prefix = `${BASE_FOLDER}/${folder}/`;
    
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 100
    });
    
    const response = await r2Client.send(command);
    
    if (!response.Contents) return [];
    
    return response.Contents.map(item => ({
      name: item.Key?.split('/').pop() || '',
      path: item.Key || '',
      size: item.Size || 0,
      lastModified: item.LastModified,
      url: `${import.meta.env.VITE_CF_R2_ENDPOINT}/${BUCKET_NAME}/${item.Key}`
    }));
  } catch (error) {
    console.error('List files failed:', error);
    return [];
  }
};

export const getFileUrl = (path: string): string => {
  return `${import.meta.env.VITE_CF_R2_ENDPOINT}/${BUCKET_NAME}/${path}`
