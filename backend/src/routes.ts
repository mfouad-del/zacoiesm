import { Router } from 'express';
import costsRoutes from './modules/costs/costs.routes';

const router = Router();

router.use('/costs', costsRoutes);
// Add other module routes here
// router.use('/planning', planningRoutes);
// router.use('/quality', qualityRoutes);
// router.use('/documents', documentsRoutes);
// router.use('/auth', authRoutes);

export default router;
