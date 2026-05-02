import { Router } from 'express';
import { getMyNotifications, markAsRead, markAllAsRead } from './notifications.controller.js';
import { requireAuth } from '../../shared/middleware/rbac.middleware.js';

const router = Router();

router.get('/', requireAuth, getMyNotifications);
router.patch('/:id/read', requireAuth, markAsRead);
router.patch('/read-all', requireAuth, markAllAsRead);

export default router;
