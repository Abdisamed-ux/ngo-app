import { Router } from 'express';
import { register, login, refresh, logout, updateProfile, changePassword } from './auth.controller.js';
import { requireAuth } from '../../shared/middleware/rbac.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Profile Management
router.patch('/profile', requireAuth, updateProfile);
router.patch('/change-password', requireAuth, changePassword);

export default router;
