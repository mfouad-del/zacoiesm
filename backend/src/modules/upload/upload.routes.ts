import { Router } from 'express';
import { getPresignedUrl } from './upload.controller';

const router = Router();

router.post('/presigned-url', getPresignedUrl);

export default router;
