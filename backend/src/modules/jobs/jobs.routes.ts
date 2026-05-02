import { Router } from 'express';
import { triggerJob, getJobStatus } from './jobs.controller.js';
import { requireAuth, requireRole } from '../../shared/middleware/rbac.middleware.js';

const router = Router();

// Only Admins can trigger or view background jobs
router.post('/trigger', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN']), triggerJob);
router.get('/:id/status', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN']), getJobStatus);

export default router;
