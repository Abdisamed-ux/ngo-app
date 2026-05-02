import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/rbac.middleware.js';
import * as messagesController from './messages.controller.js';

const router = Router();

// All message routes require authentication
router.use(requireAuth);

router.post('/send', messagesController.sendMessage);
router.get('/inbox', messagesController.getInbox);
router.get('/sent', messagesController.getSentMessages);
router.patch('/:id/read', messagesController.markAsRead);

export default router;
