import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout.js';
import { PageLoader } from '../components/LoadingSpinner.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { Download, Heart, FileText } from 'lucide-react';
import api from '../lib/api.js';
import { useAuthStore } from '../stores/authStore.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const fetchMyDonations = async () => {
  const { data } = await api.get('/donations/my-history');
  return data;
};

export const DonorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['my-donations'],
    queryFn: fetchMyDonations,
  });

  const donations = data?.data || [];

  const generateTaxReceipt = (donation: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // brand-900 roughly
    doc.text('TrustVerify NGO', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('Tax Deductible Receipt', 105, 30, { align: 'center' });
    doc.text('Tax ID: 12345678', 105, 38, { align: 'center' });
    
    // Line separator
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 45, 190, 45);
    
    // Donor Info
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Receipt #: ${donation.receipt_number || donation.id.slice(0, 8).toUpperCase()}`, 20, 60);
    doc.text(`Date: ${new Date(donation.donation_date).toLocaleDateString()}`, 20, 68);
    doc.text(`Donor Name: ${user?.fullName || 'Anonymous'}`, 20, 76);
    doc.text(`Donor Email: ${user?.email}`, 20, 84);

    // Donation Details Table
    (doc as any).autoTable({
      startY: 100,
      headStyles: { fillColor: [99, 102, 241] }, // brand-500
      head: [['Description', 'Amount']],
      body: [
        ['Charitable Donation', `$${parseFloat(donation.amount).toFixed(2)} ${donation.currency}`],
      ],
      foot: [['Total', `$${parseFloat(donation.amount).toFixed(2)} ${donation.currency}`]],
      footStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42] }
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Thank you for your generous support!', 105, 200, { align: 'center' });
    doc.text('No goods or services were provided in exchange for this contribution.', 105, 206, { align: 'center' });

    doc.save(`Tax_Receipt_${donation.id.slice(0, 8)}.pdf`);
  };

  if (isLoading) return <Layout title="My Donations"><PageLoader /></Layout>;

  return (
    <Layout title="My Impact">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 md:col-span-2 bg-gradient-to-br from-brand-500 to-brand-700 text-white border-transparent">
          <Heart size={32} className="mb-4 text-white/80" />
          <h2 className="text-2xl font-bold mb-2">Thank you, {user?.fullName}!</h2>
          <p className="text-white/80 max-w-md">Your contributions are making a real difference. Track your donation history and download your tax receipts below.</p>
        </div>
        <div className="card p-6 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Lifetime Giving</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">
            ${donations.filter((d: any) => d.status === 'CONFIRMED').reduce((acc: number, d: any) => acc + parseFloat(d.amount), 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-white/5">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Donation History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">You haven't made any donations yet.</td>
                </tr>
              ) : (
                donations.map((donation: any) => (
                  <tr key={donation.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-slate-900 dark:text-slate-300">
                      {new Date(donation.donation_date).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">
                      ${parseFloat(donation.amount).toLocaleString()} {donation.currency}
                    </td>
                    <td className="p-4">
                      <StatusBadge type="donation" value={donation.status} />
                    </td>
                    <td className="p-4 text-right">
                      {donation.status === 'CONFIRMED' ? (
                        <button 
                          onClick={() => generateTaxReceipt(donation)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <FileText size={14} />
                          Tax Receipt
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Not Available</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
