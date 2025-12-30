import { Router } from 'express';
import { CostsController } from './costs.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/evm/calculate', authenticate, authorize('read:costs'), CostsController.calculateEVM);

export default router;
