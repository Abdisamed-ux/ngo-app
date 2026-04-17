import React from 'react';
import { HeartHandshake, Users, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { Layout } from '../components/Layout.js';
import { LoadingSpinner } from '../components/LoadingSpinner.js';
import { useDashboardKPIs } from '../hooks/useReporting.js';
import { useAllAidRequests } from '../hooks/useAidRequests.js';
import { StatusBadge } from '../components/StatusBadge.js';

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n.toFixed(0)}`;

export const Dashboard: React.FC = () => {
  const { data: kpis, isLoading: kpiLoading } = useDashboardKPIs();
  const { data: requestsData, isLoading: reqLoading } = useAllAidRequests(1);

  const recentRequests = requestsData?.data?.slice(0, 5) || [];

  return (
    <Layout title="Dashboard">
      {/* Decorative blobs */}
      <div className="gradient-blob-1 w-96 h-96 top-0 right-0 opacity-20 fixed" />
      <div className="gradient-blob-2 w-72 h-72 bottom-10 left-10 opacity-10 fixed" />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <KPICard
          title="Total Donations"
          value={kpiLoading ? null : fmt(kpis?.totalDonations ?? 0)}
          icon={<HeartHandshake className="text-brand-500" size={24} />}
          accent="brand"
          sub="Confirmed donations"
        />
        <KPICard
          title="Active Cases"
          value={kpiLoading ? null : String(kpis?.activeCases ?? 0)}
          icon={<AlertCircle className="text-amber-500" size={24} />}
          accent="amber"
          sub="Awaiting review"
        />
        <KPICard
          title="Beneficiaries"
          value={kpiLoading ? null : String(kpis?.beneficiaries ?? 0)}
          icon={<Users className="text-blue-500" size={24} />}
          accent="blue"
          sub="Registered in system"
        />
      </div>

      {/* Recent Aid Requests */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-brand-500" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Aid Requests</h2>
          </div>
          <a href="/aid-requests" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
            View all →
          </a>
        </div>

        {reqLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size={32} />
          </div>
        ) : recentRequests.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <AlertCircle size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No aid requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-border">
                  <th className="text-left pb-3 font-medium text-slate-500 dark:text-slate-400">Request #</th>
                  <th className="text-left pb-3 font-medium text-slate-500 dark:text-slate-400">Beneficiary</th>
                  <th className="text-left pb-3 font-medium text-slate-500 dark:text-slate-400">Urgency</th>
                  <th className="text-left pb-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="text-left pb-3 font-medium text-slate-500 dark:text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="table-row-hover">
                    <td className="py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {req.request_number}
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">
                      {req.beneficiary?.full_name || '—'}
                    </td>
                    <td className="py-3">
                      <StatusBadge type="urgency" value={req.urgency} />
                    </td>
                    <td className="py-3">
                      <StatusBadge type="aidRequest" value={req.status} />
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

const accentRing: Record<string, string> = {
  brand: 'ring-brand-500/30 bg-brand-50 dark:bg-brand-500/10',
  amber: 'ring-amber-500/30 bg-amber-50 dark:bg-amber-500/10',
  blue: 'ring-blue-500/30 bg-blue-50 dark:bg-blue-500/10',
};

const KPICard = ({
  title,
  value,
  icon,
  accent,
  sub,
}: {
  title: string;
  value: string | null;
  icon: React.ReactNode;
  accent: string;
  sub: string;
}) => (
  <div className="card p-6 flex items-start justify-between hover:shadow-md transition-shadow duration-300">
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
        {value === null ? (
          <span className="inline-block h-8 w-24 bg-slate-200 dark:bg-dark-border rounded animate-pulse" />
        ) : (
          value
        )}
      </p>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{sub}</p>
    </div>
    <div className={`p-3 rounded-2xl ring-1 ${accentRing[accent]}`}>{icon}</div>
  </div>
);
