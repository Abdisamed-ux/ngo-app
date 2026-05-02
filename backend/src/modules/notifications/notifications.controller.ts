import { Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';
import { AuthenticatedRequest } from '../../shared/middleware/rbac.middleware.js';

export const getMyNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const notifications = await prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    return res.status(200).json({ data: notifications });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    await prisma.notifications.update({
      where: { id, user_id: userId },
      data: { is_read: true },
    });

    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    await prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
