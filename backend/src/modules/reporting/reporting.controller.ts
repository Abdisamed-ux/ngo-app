import { Response } from 'express';
import { prisma } from '../../shared/prisma/client.js';
import { AuthenticatedRequest } from '../../shared/middleware/rbac.middleware.js';
import { Parser } from 'json2csv';

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

    const donationStatusBreakdown = await prisma.donations.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const aidRequestStatusBreakdown = await prisma.aid_requests.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // Top 5 Donors
    const topDonorsAgg = await prisma.donations.groupBy({
      by: ['donor_id'],
      _sum: { amount: true },
      where: { status: 'CONFIRMED', donor_id: { not: null } },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    const topDonors = await Promise.all(
      topDonorsAgg.map(async (agg) => {
        const user = await prisma.users.findUnique({ where: { id: agg.donor_id! } });
        return {
          id: agg.donor_id,
          name: user?.full_name || 'Anonymous',
          amount: agg._sum.amount ? parseFloat(agg._sum.amount.toString()) : 0,
        };
      })
    );

    // Monthly Trends (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const recentDonations = await prisma.donations.findMany({
      where: { status: 'CONFIRMED', created_at: { gte: sixMonthsAgo } },
      select: { amount: true, created_at: true },
    });

    const recentDisbursements = await prisma.disbursements.findMany({
      where: { created_at: { gte: sixMonthsAgo } },
      select: { amount: true, created_at: true },
    });

    // Initialize months array
    const monthlyTrendsMap = new Map<string, { month: string, donations: number, disbursements: number }>();
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyTrendsMap.set(monthStr, { month: monthStr, donations: 0, disbursements: 0 });
    }

    recentDonations.forEach(d => {
      const monthStr = d.created_at.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyTrendsMap.has(monthStr)) {
        monthlyTrendsMap.get(monthStr)!.donations += parseFloat(d.amount.toString());
      }
    });

    recentDisbursements.forEach(d => {
      const monthStr = d.created_at.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyTrendsMap.has(monthStr)) {
        monthlyTrendsMap.get(monthStr)!.disbursements += parseFloat(d.amount.toString());
      }
    });

    const monthlyTrends = Array.from(monthlyTrendsMap.values()).reverse();

    return res.status(200).json({
      data: {
        totalDonations,
        activeCases: activeCasesCount,
        beneficiaries: beneficiaryCount,
        breakdowns: {
          donations: donationStatusBreakdown.map(b => ({ status: b.status, count: b._count.id })),
          aidRequests: aidRequestStatusBreakdown.map(b => ({ status: b.status, count: b._count.id })),
        },
        topDonors,
        monthlyTrends
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

    const data = donations.map(d => ({
      ID: d.id,
      Amount: d.amount.toString(),
      Currency: d.currency,
      Status: d.status,
      Date: d.donation_date.toISOString(),
      'Donor Email': d.donor?.email || 'Anonymous'
    }));

    const json2csvParser = new Parser();
    const csvContent = json2csvParser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="donations_export.csv"');
    
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export CSV Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const exportAidRequestsCsv = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const aidRequests = await prisma.aid_requests.findMany({
      orderBy: { created_at: 'desc' },
      include: { beneficiary: true, aid_type: true }
    });

    const data = aidRequests.map(req => ({
      ID: req.id,
      'Request Number': req.request_number,
      Beneficiary: req.beneficiary?.full_name || 'Unknown',
      'Aid Type': req.aid_type?.name || 'Unknown',
      Status: req.status,
      Urgency: req.urgency,
      Date: req.created_at.toISOString()
    }));

    const json2csvParser = new Parser();
    const csvContent = json2csvParser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="aid_requests_export.csv"');
    
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export Aid Requests CSV Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
