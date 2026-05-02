import { Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';
import { AuthenticatedRequest } from '../../shared/middleware/rbac.middleware.js';

export const disburseFunds = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const { requestId } = req.params;
    const { amount, paymentReference, notes } = req.body;

    if (!adminId) return res.status(401).json({ error: 'Unauthorized' });

    // Execute within a safe Prisma transaction block
    const disbursementResult = await prisma.$transaction(async (tx) => {
      const aidRequest = await tx.aid_requests.findUnique({
        where: { id: requestId },
      });

      if (!aidRequest) throw new Error('Aid request not found');
      if (aidRequest.status !== 'APPROVED') {
        throw new Error('Only APPROVED requests can be disbursed');
      }

      // Record disbursement
      const disbursement = await tx.disbursements.create({
        data: {
          aid_request_id: requestId,
          authorised_by: adminId,
          amount,
          payment_reference: paymentReference,
          disbursed_at: new Date(),
          notes,
        },
      });

      // Close the aid request
      const updatedRequest = await tx.aid_requests.update({
        where: { id: requestId },
        data: { status: 'DISBURSED' }
      });

      // Audit Log
      await tx.audit_logs.create({
        data: {
          entity_type: 'disbursements',
          entity_id: disbursement.id,
          changed_by: adminId,
          action: 'CREATE',
          timestamp: new Date(),
          new_value: { amount, aid_request_id: requestId },
        }
      });

      // Notify Beneficiary
      await tx.notifications.create({
        data: {
          user_id: aidRequest.beneficiary_id,
          type: 'FUNDS_DISBURSED',
          message: `Funds of ${amount} have been disbursed for your request ${aidRequest.request_number}. Ref: ${paymentReference}`,
        }
      });

      return { disbursement, updatedRequest };
    });

    return res.status(201).json({
      message: 'Disbursement executed successfully',
      data: disbursementResult,
    });
  } catch (error: any) {
    console.error('Disburse Funds Error:', error);
    if (error.message === 'Aid request not found' || error.message === 'Only APPROVED requests can be disbursed') {
      return res.status(400).json({ error: 'Bad Request', message: error.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
