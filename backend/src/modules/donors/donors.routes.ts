import { Router } from 'express';
import { createDonation, getDonorDonations, getAllDonations } from './donations.controller.js';
import { requireAuth, requireRole } from '../../shared/middleware/rbac.middleware.js';

const router = Router();

// Public / Semi-public
router.post('/', requireAuth, createDonation);

// Donor only
router.get('/my-history', requireAuth, requireRole(['DONOR']), getDonorDonations);

// Admin only
router.get('/', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN']), getAllDonations);

export default router;

