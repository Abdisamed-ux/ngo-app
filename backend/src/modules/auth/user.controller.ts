import { Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';
import { AuthenticatedRequest } from '../../shared/middleware/rbac.middleware.js';

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        full_name: true,
        phone: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Get Me Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
