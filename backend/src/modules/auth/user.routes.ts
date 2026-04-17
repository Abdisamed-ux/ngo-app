import { Router } from 'express';
import { getMe } from './user.controller.js';
import { requireAuth } from '../../shared/middleware/rbac.middleware.js';

const router = Router();

// Retrieve authenticated user
router.get('/me', requireAuth, getMe);

export default router;
