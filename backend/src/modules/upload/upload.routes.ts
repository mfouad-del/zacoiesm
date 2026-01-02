import { Router } from 'express';
import { getPresignedUrl } from './upload.controller';
import { authenticateSupabase } from '../../middlewares/supabase-auth.middleware';

const router = Router();

router.post('/presigned-url', authenticateSupabase, getPresignedUrl);

export default router;
