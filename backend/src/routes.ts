import { Router } from 'express';
import costsRoutes from './modules/costs/costs.routes';
import uploadRoutes from './modules/upload/upload.routes';

const router = Router();

router.use('/costs', costsRoutes);
router.use('/upload', uploadRoutes);
// Add other module routes here
// router.use('/planning', planningRoutes);
// router.use('/quality', qualityRoutes);
// router.use('/documents', documentsRoutes);
// router.use('/auth', authRoutes);

export default router;
