import { Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';
import { donationSchema } from '../../shared/validators/donor.validators.js';
import { AuthenticatedRequest } from '../../shared/middleware/rbac.middleware.js';
import { addEmailJob } from '../../shared/jobs/queue.js';
import { templates } from '../../shared/services/email.service.js';

export const createDonation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = donationSchema.parse(req.body);
    const donorId = req.user?.userId;
    if (!donorId) return res.status(401).json({ error: 'Unauthorized', message: 'User must be authenticated' });

    const newDonation = await prisma.donations.create({
      data: {
        donor_id: req.user?.role === 'DONOR' ? donorId : null,
        amount: validatedData.amount,
        currency: validatedData.currency,
        payment_method: validatedData.paymentMethod,
        category_id: validatedData.categoryId || null,
        region_id: validatedData.regionId || null,
        is_anonymous: validatedData.isAnonymous,
        status: 'PENDING',
        donation_date: new Date(validatedData.donationDate),
        notes: validatedData.notes,
      },
    });

    await prisma.audit_logs.create({
      data: {
        entity_type: 'donations',
        entity_id: newDonation.id,
        changed_by: donorId,
        action: 'CREATE',
        timestamp: new Date(),
        new_value: { amount: newDonation.amount, status: newDonation.status },
      },
    });

    // Enqueue BullMQ Background Job to generate email receipt
    if (req.user?.role === 'DONOR') {
      const donor = await prisma.users.findUnique({ where: { id: donorId } });
      if (donor && donor.email) {
        await addEmailJob({
          to: donor.email,
          subject: 'Thank You For Your Donation',
          html: templates.donationReceipt(
            donor.full_name || 'Generous Donor',
            newDonation.amount.toString(),
            newDonation.currency,
            newDonation.receipt_number || 'PENDING-CONFIRMATION'
          )
        });
      }
    }

    return res.status(201).json({
      message: 'Donation submitted successfully',
      donationId: newDonation.id,
      status: newDonation.status,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', message: error.errors });
    }
    console.error('Create Donation Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getDonorDonations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const donorId = req.user?.userId;
    if (!donorId) return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });

    // Cursor-based pagination logic
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 20;

    const donations = await prisma.donations.findMany({
      where: { donor_id: donorId },
      take: limit + 1, // Fetch an extra one to check if there are more
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { donation_date: 'desc' },
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        donation_date: true,
        receipt_number: true,
      }
    });

    const hasMore = donations.length > limit;
    const data = hasMore ? donations.slice(0, -1) : donations;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return res.status(200).json({
      data,
      meta: {
        limit,
        nextCursor,
        hasMore,
      }
    });
  } catch (error) {
    console.error('Get Donations Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllDonations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const skip = (page - 1) * limit;

    const where = status ? { status: status as any } : {};

    const [donations, total] = await Promise.all([
      prisma.donations.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          donor: { select: { id: true, full_name: true, email: true } },
          category: { select: { id: true, name: true } },
          region: { select: { id: true, name: true } },
        },
      }),
      prisma.donations.count({ where }),
    ]);

    return res.status(200).json({
      data: donations,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get All Donations Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

