import React, { useState, useEffect } from 'react';
import { Download, BarChart3, AlertCircle, TrendingUp, Award, Play } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Layout } from '../components/Layout.js';
import { PageLoader } from '../components/LoadingSpinner.js';
import { useDashboardKPIs } from '../hooks/useReporting.js';
import api from '../lib/api.js';

const fmt = (n: number, currency = false) =>
  currency
    ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : n.toLocaleString();

export const ReportsPage: React.FC = () => {
  const { data: kpis, isLoading } = useDashboardKPIs();

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

  const handleExportAidRequests = async () => {
    try {
      const response = await api.get('/reporting/export/aid-requests', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `aid_requests_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Please try again.');
    }
  };

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<number>(0);

  const handleTriggerJob = async () => {
    try {
      const response = await api.post('/jobs/trigger', { jobType: 'GenerateYearEndTaxReport' });
      setJobId(response.data.jobId);
      setJobStatus('QUEUED');
      setJobProgress(0);
    } catch {
      alert('Failed to trigger job');
    }
  };

  useEffect(() => {
    let interval: any;
    if (jobId && jobStatus !== 'SUCCESS' && jobStatus !== 'FAILED') {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/jobs/${jobId}/status`);
          if (res.data.state === 'completed') {
            setJobStatus('SUCCESS');
            setJobProgress(100);
            clearInterval(interval);
          } else if (res.data.state === 'failed') {
            setJobStatus('FAILED');
            clearInterval(interval);
          } else {
            setJobStatus('PROCESSING');
            setJobProgress(res.data.progress || 0);
          }
        } catch (e) {
          console.error(e);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [jobId, jobStatus]);

  const totalDonationsCount = kpis?.breakdowns?.donations?.reduce((acc, d) => acc + d.count, 0) || 0;

  const statusColors: Record<string, string> = {
    CONFIRMED: 'bg-brand-500',
    PENDING: 'bg-amber-500',
    ALLOCATED: 'bg-blue-500',
    REFUNDED: 'bg-red-500',
  };

  if (isLoading) return <Layout title="Reports"><PageLoader /></Layout>;

  return (
    <Layout title="Reports & Analytics">
      <div className="flex flex-col sm:flex-row justify-end gap-3 mb-6">
        {jobId && (
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-dark-border/40 rounded-xl text-sm mr-auto">
            <span className="font-medium">Job Status:</span> 
            <span className={jobStatus === 'SUCCESS' ? 'text-green-500 font-bold' : jobStatus === 'FAILED' ? 'text-red-500 font-bold' : 'text-brand-500'}>
              {jobStatus} {jobStatus === 'PROCESSING' ? `(${jobProgress}%)` : ''}
            </span>
          </div>
        )}
        <button
          onClick={handleTriggerJob}
          disabled={jobStatus === 'PROCESSING' || jobStatus === 'QUEUED'}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <Play size={16} />
          Trigger Background Job
        </button>
        <button
          onClick={handleExportAidRequests}
          className="btn-ghost flex items-center justify-center gap-2"
        >
          <Download size={16} />
          Export Aid Requests
        </button>
        <button
          id="export-csv-btn"
          onClick={handleExport}
          className="btn-primary flex items-center justify-center gap-2"
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

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* Monthly Trend Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Donations vs Disbursements (Last 6 Months)</h2>
          </div>
          <div className="h-[300px] w-full">
            {kpis?.monthlyTrends && kpis.monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpis.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDisbursements" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                    itemStyle={{ color: '#e2e8f0' }}
                    formatter={(value: any) => [fmt(value, true), '']}
                  />
                  <Area type="monotone" name="Donations" dataKey="donations" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDonations)" />
                  <Area type="monotone" name="Disbursements" dataKey="disbursements" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorDisbursements)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No trend data available</div>
            )}
          </div>
        </div>

        {/* Top Donors Leaderboard */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Award size={18} className="text-brand-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Top Donors</h2>
          </div>
          <div className="space-y-4">
            {kpis?.topDonors && kpis.topDonors.length > 0 ? (
              kpis.topDonors.map((donor, idx) => (
                <div key={donor.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-border/40 border border-slate-100 dark:border-white/5 transition-all hover:scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${idx === 0 ? 'bg-amber-500 shadow-amber-500/30' : idx === 1 ? 'bg-slate-400 shadow-slate-400/30' : idx === 2 ? 'bg-amber-700 shadow-amber-700/30' : 'bg-brand-500 shadow-brand-500/30'}`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">{donor.name}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{fmt(donor.amount, true)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No donor data available</p>
            )}
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
