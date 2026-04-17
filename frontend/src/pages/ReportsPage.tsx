import React from 'react';
import { Download, BarChart3, AlertCircle, TrendingUp } from 'lucide-react';
import { Layout } from '../components/Layout.js';
import { PageLoader } from '../components/LoadingSpinner.js';
import { useDashboardKPIs } from '../hooks/useReporting.js';
import { useAllDonations } from '../hooks/useDonations.js';
import api from '../lib/api.js';

const fmt = (n: number, currency = false) =>
  currency
    ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : n.toLocaleString();

export const ReportsPage: React.FC = () => {
  const { data: kpis, isLoading } = useDashboardKPIs();
  const { data: donations } = useAllDonations(1);

  const handleExport = async () => {
    try {
      const response = await api.get('/reporting/export/donations', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `donations_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Please try again.');
    }
  };

  // Compute donation status breakdown
  const statusCounts = (donations?.data || []).reduce<Record<string, number>>((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});

  const totalDonationsCount = donations?.meta?.total || 0;

  const statusColors: Record<string, string> = {
    CONFIRMED: 'bg-brand-500',
    PENDING: 'bg-amber-500',
    ALLOCATED: 'bg-blue-500',
    REFUNDED: 'bg-red-500',
  };

  if (isLoading) return <Layout title="Reports"><PageLoader /></Layout>;

  return (
    <Layout title="Reports & Analytics">
      <div className="flex justify-end mb-6">
        <button
          id="export-csv-btn"
          onClick={handleExport}
          className="btn-primary flex items-center gap-2"
        >
          <Download size={16} />
          Export Donations CSV
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard
          label="Total Confirmed"
          value={fmt(kpis?.totalDonations ?? 0, true)}
          icon={<TrendingUp className="text-brand-500" size={22} />}
          sub="Confirmed donations"
        />
        <StatCard
          label="Active Cases"
          value={fmt(kpis?.activeCases ?? 0)}
          icon={<AlertCircle className="text-amber-500" size={22} />}
          sub="Submitted + Under review"
        />
        <StatCard
          label="Beneficiaries"
          value={fmt(kpis?.beneficiaries ?? 0)}
          icon={<BarChart3 className="text-blue-500" size={22} />}
          sub="Registered users"
        />
      </div>

      {/* Donation Status Breakdown */}
      <div className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5">
          Donation Status Breakdown
        </h2>
        {totalDonationsCount === 0 ? (
          <p className="text-sm text-slate-400">No donation data available</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = totalDonationsCount > 0 ? Math.round((count / totalDonationsCount) * 100) : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{status}</span>
                    <span className="text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-dark-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${statusColors[status] || 'bg-slate-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info notice */}
      <div className="card p-5 bg-brand-50 dark:bg-brand-500/5 border-brand-200 dark:border-brand-500/20">
        <div className="flex items-start gap-3">
          <BarChart3 className="text-brand-500 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="text-sm font-medium text-brand-700 dark:text-brand-400">About Reports</p>
            <p className="text-sm text-brand-600/70 dark:text-brand-400/60 mt-1">
              The CSV export includes all donations with donor details, amounts, dates, and statuses.
              Advanced chart analytics with monthly trends are planned for a future release.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ label, value, icon, sub }: { label: string; value: string; icon: React.ReactNode; sub: string }) => (
  <div className="card p-5 flex items-start justify-between">
    <div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-1.5">{sub}</p>
    </div>
    <div className="p-3 bg-slate-50 dark:bg-dark-border rounded-xl">{icon}</div>
  </div>
);
