import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET || (isProd ? undefined : 'dev_secret_change_me');

if (isProd && !jwtSecret) {
  throw new Error('JWT_SECRET is required in production');
}

export const config = {
  port: process.env.PORT || 3000,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  r2: {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET || 'zaco',
    endpoint: process.env.R2_ENDPOINT
  }
};
