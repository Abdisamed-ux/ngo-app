import { Router } from 'express';
import { disburseFunds } from './funds.controller.js';
import { requireAuth, requireRole } from '../../shared/middleware/rbac.middleware.js';

const router = Router();

// Only NGO Admins and Super Admins can disburse funds
router.post('/disburse/:requestId', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN']), disburseFunds);

export default router;
