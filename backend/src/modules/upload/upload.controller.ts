import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../../config/env';

export const getPresignedUrl = async (req: Request, res: Response) => {
  try {
    const { filename, contentType, folder } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Filename and contentType are required' });
    }

    if (!config.r2.endpoint || !config.r2.bucket || !config.r2.accessKeyId || !config.r2.secretAccessKey) {
      return res.status(500).json({ error: 'Upload service is not configured' });
    }

    const r2Client = new S3Client({
      region: 'auto',
      endpoint: config.r2.endpoint,
      credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey
      }
    });

    if (typeof filename !== 'string' || filename.length > 255) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    if (typeof contentType !== 'string' || contentType.length > 255) {
      return res.status(400).json({ error: 'Invalid contentType' });
    }

    if (!/^[\w.+-]+\/[\w.+-]+$/.test(contentType)) {
      return res.status(400).json({ error: 'Invalid contentType format' });
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const hasExtension = filename.includes('.') && !filename.endsWith('.');
    const extension = hasExtension ? filename.split('.').pop() : undefined;
    const originalName = filename.replace(/\.[^/.]+$/, '');
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalFilename = extension
      ? `${sanitizedName}_${timestamp}_${randomStr}.${extension}`
      : `${sanitizedName}_${timestamp}_${randomStr}`;
    
    const rawFolder = typeof folder === 'string' ? folder : undefined;
    const targetFolder = (rawFolder || 'uploads').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64) || 'uploads';
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const key = `zacoengineer/${targetFolder}/${year}/${month}/${finalFilename}`;

    const command = new PutObjectCommand({
      Bucket: config.r2.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    const publicUrl = `${config.r2.endpoint}/${config.r2.bucket}/${key}`;

    res.json({
      uploadUrl: url,
      publicUrl: publicUrl,
      path: key
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};
