import { Router } from 'express';
import { getAssignedTasks, updateCaseStatus } from './case-mgmt.controller.js';
import { requireAuth, requireRole } from '../../shared/middleware/rbac.middleware.js';

const router = Router();

// Caseworker & Admin actions
router.get('/assigned', requireAuth, requireRole(['CASEWORKER', 'NGO_ADMIN']), getAssignedTasks);
router.patch('/:requestId/status', requireAuth, requireRole(['CASEWORKER', 'NGO_ADMIN', 'SUPER_ADMIN']), updateCaseStatus);

export default router;
