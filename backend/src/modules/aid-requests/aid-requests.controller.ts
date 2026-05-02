import { Request, Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';
import { aidRequestSchema } from '../../shared/validators/aid-requests.validators.js';
import { AuthenticatedRequest } from '../../shared/middleware/rbac.middleware.js';
import { analyzeAidRequest } from '../../shared/services/ai.service.js';

/**
 * Utility to generate sequential aid request numbers
 * Format: AID-YYYYNNN (e.g., AID-2026001)
 */
const generateAidRequestNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const latestRequest = await prisma.aid_requests.findFirst({
    where: { request_number: { startsWith: `AID-${currentYear}` } },
    orderBy: { request_number: 'desc' },
  });

  if (!latestRequest) {
    return `AID-${currentYear}001`;
  }

  const sequenceStr = latestRequest.request_number.slice(-3);
  const nextSequence = parseInt(sequenceStr, 10) + 1;
  return `AID-${currentYear}${nextSequence.toString().padStart(3, '0')}`;
};

export const submitAidRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const beneficiaryId = req.user?.userId;
    if (!beneficiaryId) return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });

    const validatedData = aidRequestSchema.parse(req.body);
    const requestNumber = await generateAidRequestNumber();

    const aiAnalysis = await analyzeAidRequest(validatedData.description);

    const newRequest = await prisma.aid_requests.create({
      data: {
        request_number: requestNumber,
        beneficiary_id: beneficiaryId,
        aid_type_id: validatedData.aidTypeId,
        urgency: validatedData.urgency,
        status: 'SUBMITTED',
        estimated_value: validatedData.estimatedValue,
        region_id: validatedData.regionId,
        dependants: validatedData.dependants,
        description: validatedData.description,
        ai_urgency_score: aiAnalysis.urgencyScore,
        ai_summary: aiAnalysis.summary,
      },
    });

    await prisma.audit_logs.create({
      data: {
        entity_type: 'aid_requests',
        entity_id: newRequest.id,
        changed_by: beneficiaryId,
        action: 'CREATE',
        timestamp: new Date(),
        new_value: { status: newRequest.status, request_number: newRequest.request_number },
      },
    });

    return res.status(201).json({
      message: 'Aid request submitted successfully',
      requestId: newRequest.id,
      requestNumber: newRequest.request_number,
      status: newRequest.status,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', message: error.errors });
    }
    console.error('Submit Aid Request Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMyRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const beneficiaryId = req.user?.userId;
    if (!beneficiaryId) return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.aid_requests.findMany({
        where: { beneficiary_id: beneficiaryId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          aid_type: { select: { id: true, name: true } },
          region: { select: { id: true, name: true } },
        },
      }),
      prisma.aid_requests.count({ where: { beneficiary_id: beneficiaryId } }),
    ]);

    return res.status(200).json({
      data: requests,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get My Requests Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllAidRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const urgency = req.query.urgency as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (urgency) where.urgency = urgency;

    const [requests, total] = await Promise.all([
      prisma.aid_requests.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ urgency: 'asc' }, { created_at: 'desc' }],
        include: {
          beneficiary: { select: { id: true, full_name: true, email: true } },
          caseworker: { select: { id: true, full_name: true, email: true } },
          aid_type: { select: { id: true, name: true } },
          region: { select: { id: true, name: true } },
        },
      }),
      prisma.aid_requests.count({ where }),
    ]);

    return res.status(200).json({
      data: requests,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get All Aid Requests Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const getAidTypes = async (req: Request, res: Response) => {
  try {
    const types = await prisma.aid_types.findMany({ orderBy: { name: 'asc' } });
    return res.status(200).json({ data: types });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getRegions = async (req: Request, res: Response) => {
  try {
    const regions = await prisma.regions.findMany({ orderBy: { name: 'asc' } });
    return res.status(200).json({ data: regions });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
