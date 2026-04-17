import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { JwtService } from '../../modules/auth/jwt.service.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const payload = JwtService.verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to perform this action' });
    }

    next();
  };
};
