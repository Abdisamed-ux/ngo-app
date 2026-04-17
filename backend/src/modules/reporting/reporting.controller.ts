import { Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';
import { AuthenticatedRequest } from '../../shared/middleware/rbac.middleware.js';

// In a real application, Redis should be used for caching this.
// For the sake of this iteration, we compute it live.

export const getDashboardKPIs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalDonationsObj = await prisma.donations.aggregate({
      _sum: { amount: true },
      where: { status: 'CONFIRMED' }
    });

    const activeCasesCount = await prisma.aid_requests.count({
      where: { status: { in: ['UNDER_REVIEW', 'SUBMITTED'] } }
    });

    const beneficiaryCount = await prisma.users.count({
      where: { role: 'BENEFICIARY' }
    });

    const totalDonations = totalDonationsObj._sum.amount ? parseFloat(totalDonationsObj._sum.amount.toString()) : 0;

    return res.status(200).json({
      data: {
        totalDonations,
        activeCases: activeCasesCount,
        beneficiaries: beneficiaryCount,
      }
    });
  } catch (error) {
    console.error('Get Dashboard KPIs Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const exportDonationsCsv = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const donations = await prisma.donations.findMany({
      orderBy: { donation_date: 'desc' },
      include: { donor: true, category: true }
    });

    // Simple CSV Stream mock mapping
    const csvLines = [
      ['ID', 'Amount', 'Currency', 'Status', 'Date', 'Donor Email']
    ];

    donations.forEach(d => {
      csvLines.push([
        d.id,
        d.amount.toString(),
        d.currency,
        d.status,
        d.donation_date.toISOString(),
        d.donor?.email || 'Anonymous'
      ]);
    });

    const csvContent = csvLines.map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="donations_export.csv"');
    
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export CSV Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
