import { Request, Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          email: true,
          full_name: true,
          role: true,
          is_active: true,
          created_at: true,
        },
      }),
      prisma.users.count(),
    ]);

    return res.status(200).json({
      data: users,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { is_active: isActive },
    });

    return res.status(200).json({ message: 'User status updated', data: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.audit_logs.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.audit_logs.count(),
    ]);

    return res.status(200).json({
      data: logs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
