import { Router } from 'express';
import { getDashboardKPIs, exportDonationsCsv } from './reporting.controller.js';
import { requireAuth, requireRole } from '../../shared/middleware/rbac.middleware.js';

const router = Router();

// Only NGO Admins and Super Admins can access analytics
router.get('/dashboard', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN']), getDashboardKPIs);
router.get('/export/donations', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN']), exportDonationsCsv);

export default router;
