import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

declare global {
  namespace Express {
    interface Request {
      supabaseUser?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

export const authenticateSupabase = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  if (!config.supabaseUrl || !config.supabaseKey) {
    return res.status(500).json({ message: 'Supabase is not configured on the server' });
  }

  try {
    const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: { persistSession: false }
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.supabaseUser = {
      id: data.user.id,
      email: data.user.email,
      role: (data.user.user_metadata as any)?.role
    };

    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
