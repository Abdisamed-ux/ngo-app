import React, { useState } from 'react';
import { Plus, X, AlertCircle, Filter } from 'lucide-react';
import { Layout } from '../components/Layout.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { SkeletonRow } from '../components/LoadingSpinner.js';
import { useAllAidRequests } from '../hooks/useAidRequests.js';
import type { AidRequestStatus, UrgencyLevel } from '../types/index.js';

const STATUS_FILTERS: Array<{ label: string; value: '' | AidRequestStatus }> = [
  { label: 'All', value: '' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Disbursed', value: 'DISBURSED' },
];

export const AidRequestsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'' | AidRequestStatus>('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAllAidRequests(
    page,
    statusFilter || undefined
  );

  return (
    <Layout title="Aid Requests">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`px-4 py-1.5 text-sm rounded-xl font-medium transition-all ${
              statusFilter === f.value
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-dark-border hover:border-brand-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 dark:border-dark-border">
              <tr>
                {['Request #', 'Beneficiary', 'Aid Type', 'Urgency', 'Status', 'Region', 'Date'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-5"><SkeletonRow /></td></tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <AlertCircle size={36} className="mx-auto mb-2 opacity-40" />
                    <p>Failed to load aid requests</p>
                  </td>
                </tr>
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Filter size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No aid requests match your filter</p>
                  </td>
                </tr>
              ) : (
                data.data.map((req) => (
                  <tr key={req.id} className="table-row-hover">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                      {req.request_number}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      {req.beneficiary?.full_name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {req.aid_type?.name || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge type="urgency" value={req.urgency} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge type="aidRequest" value={req.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {req.region?.name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-dark-border">
            <p className="text-sm text-slate-500">
              Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total)
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm py-1.5">
                Previous
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= data.meta.totalPages} className="btn-ghost text-sm py-1.5">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
