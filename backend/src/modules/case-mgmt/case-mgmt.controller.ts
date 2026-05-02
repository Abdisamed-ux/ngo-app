import { Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';
import { AuthenticatedRequest } from '../../shared/middleware/rbac.middleware.js';
import { io } from '../../server.js';
import { addEmailJob } from '../../shared/jobs/queue.js';
import { templates } from '../../shared/services/email.service.js';

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

    // Notify Beneficiary
    if (status && status !== aidRequest.status) {
      const notification = await prisma.notifications.create({
        data: {
          user_id: aidRequest.beneficiary_id,
          type: 'STATUS_UPDATE',
          message: `Your aid request ${aidRequest.request_number} status has been updated to ${status}.`,
        }
      });

      // Emit live notification
      io.to(aidRequest.beneficiary_id).emit('notification', notification);

      // Queue Email Notification
      const beneficiary = await prisma.users.findUnique({ where: { id: aidRequest.beneficiary_id } });
      if (beneficiary?.email) {
        await addEmailJob({
          to: beneficiary.email,
          subject: `Aid Request Status Update - ${aidRequest.request_number}`,
          html: templates.statusUpdate(aidRequest.request_number, status, reason)
        });
      }
    }

    return res.status(200).json({ message: 'Case updated successfully', data: updatedRequest });
  } catch (error) {
    console.error('Update Case Status Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCaseDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const documents = await prisma.documents.findMany({
      where: { aid_request_id: requestId },
      orderBy: { created_at: 'desc' },
      include: { uploader: { select: { id: true, full_name: true, email: true } } }
    });

    return res.status(200).json({ data: documents });
  } catch (error) {
    console.error('Get Case Documents Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const uploadCaseDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
    
    const aidRequest = await prisma.aid_requests.findUnique({ where: { id: requestId } });
    if (!aidRequest) return res.status(404).json({ error: 'Not Found', message: 'Aid request not found' });

    if (!req.file) {
      return res.status(400).json({ error: 'Bad Request', message: 'No file uploaded' });
    }

    const file = req.file;
    const document = await prisma.documents.create({
      data: {
        aid_request_id: requestId,
        filename: file.originalname,
        file_path: file.path, // stored locally in uploads/
        content_type: file.mimetype,
        uploaded_by: userId,
      }
    });

    return res.status(201).json({ message: 'Document uploaded successfully', data: document });
  } catch (error) {
    console.error('Upload Document Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
