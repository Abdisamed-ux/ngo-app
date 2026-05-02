import { Router } from 'express';
import { getDashboardKPIs, exportDonationsCsv, exportAidRequestsCsv } from './reporting.controller.js';
import { getAllUsers, updateUserStatus, getAuditLogs } from './admin.controller.js';
import { requireAuth, requireRole } from '../../shared/middleware/rbac.middleware.js';

const router = Router();

// Only NGO Admins and Super Admins can access analytics and management
router.get('/dashboard', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN']), getDashboardKPIs);
router.get('/export/donations', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN']), exportDonationsCsv);
router.get('/export/aid-requests', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN']), exportAidRequestsCsv);

// Administration
router.get('/users', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN']), getAllUsers);
router.patch('/users/:userId/status', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN']), updateUserStatus);
router.get('/audit-logs', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN']), getAuditLogs);

export default router;
