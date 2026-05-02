import { Router } from 'express';
import { submitAidRequest, getMyRequests, getAllAidRequests, getAidTypes, getRegions } from './aid-requests.controller.js';
import { requireAuth, requireRole } from '../../shared/middleware/rbac.middleware.js';

const router = Router();

// Metadata
router.get('/types', getAidTypes);
router.get('/regions', getRegions);

// Admin / Caseworker — get all requests
router.get('/', requireAuth, requireRole(['NGO_ADMIN', 'SUPER_ADMIN', 'CASEWORKER']), getAllAidRequests);

// Beneficiary only
router.post('/', requireAuth, requireRole(['BENEFICIARY']), submitAidRequest);
router.get('/my', requireAuth, requireRole(['BENEFICIARY']), getMyRequests);

export default router;
