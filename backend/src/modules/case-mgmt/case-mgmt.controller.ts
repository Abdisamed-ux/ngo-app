import { Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';
import { AuthenticatedRequest } from '../../shared/middleware/rbac.middleware.js';

export const getAssignedTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const caseworkerId = req.user?.userId;
    if (!caseworkerId) return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });

    const tasks = await prisma.aid_requests.findMany({
      where: { caseworker_id: caseworkerId },
      orderBy: [
        { urgency: 'asc' }, // Ensure Enum ordering logic is applied properly by DB or sort in TS if postgres enum sort is off
        { created_at: 'asc' }
      ]
    });

    return res.status(200).json({ data: tasks });
  } catch (error) {
    console.error('Get Assigned Tasks Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateCaseStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const caseworkerId = req.user?.userId;
    const { requestId } = req.params;
    const { status, urgency, reason } = req.body;

    if (!caseworkerId) return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });

    const aidRequest = await prisma.aid_requests.findUnique({ where: { id: requestId } });

    if (!aidRequest) {
      return res.status(404).json({ error: 'Not Found', message: 'Aid request not found' });
    }

    if (aidRequest.caseworker_id !== caseworkerId && req.user?.role !== 'SUPER_ADMIN' && req.user?.role !== 'NGO_ADMIN') {
      return res.status(403).json({ error: 'Forbidden', message: 'Not authorized to manage this case' });
    }

    if (status === 'REJECTED' && !reason) {
       return res.status(400).json({ error: 'Bad Request', message: 'Rejection requires a reason' });
    }

    const updatedRequest = await prisma.aid_requests.update({
      where: { id: requestId },
      data: {
        status: status || aidRequest.status,
        urgency: urgency || aidRequest.urgency,
        reviewed_at: (status === 'APPROVED' || status === 'REJECTED') ? new Date() : undefined
      }
    });

    await prisma.audit_logs.create({
      data: {
        entity_type: 'aid_requests',
        entity_id: updatedRequest.id,
        changed_by: caseworkerId,
        action: 'STATUS_CHANGE',
        timestamp: new Date(),
        old_value: { status: aidRequest.status, urgency: aidRequest.urgency },
        new_value: { status: updatedRequest.status, urgency: updatedRequest.urgency, reason }, 
      },
    });

    return res.status(200).json({ message: 'Case updated successfully', data: updatedRequest });
  } catch (error) {
    console.error('Update Case Status Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
