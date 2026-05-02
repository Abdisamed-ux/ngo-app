import React, { useState } from 'react';
import { Plus, X, AlertCircle, Filter } from 'lucide-react';
import { Layout } from '../components/Layout.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { SkeletonRow } from '../components/LoadingSpinner.js';
import { useAllAidRequests, useSubmitAidRequest, useAidTypes, useRegions } from '../hooks/useAidRequests.js';
import { useAuthStore } from '../stores/authStore.js';
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
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();

  const { data, isLoading, isError } = useAllAidRequests(page, statusFilter || undefined);
  const { mutate: submitRequest, isPending: submitting, error: submitError } = useSubmitAidRequest();
  const { data: aidTypes } = useAidTypes();
  const { data: regions } = useRegions();

  const [form, setForm] = useState({
    aidTypeId: '',
    regionId: '',
    urgency: 'MEDIUM' as UrgencyLevel,
    description: '',
    dependants: 0,
    estimatedValue: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRequest(
      {
        aidTypeId: form.aidTypeId,
        regionId: form.regionId,
        urgency: form.urgency,
        description: form.description,
        dependants: form.dependants,
        estimatedValue: form.estimatedValue ? parseFloat(form.estimatedValue) : undefined,
      },
      {
        onSuccess: () => {
          setShowModal(false);
          setForm({ aidTypeId: '', regionId: '', urgency: 'MEDIUM', description: '', dependants: 0, estimatedValue: '' });
        },
      }
    );
  };

  return (
    <Layout title="Aid Requests">
      <div className="flex items-center justify-between mb-6">
        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
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

        {user?.role === 'BENEFICIARY' && (
          <button
            id="new-request-btn"
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            New Request
          </button>
        )}
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

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative card p-6 w-full max-w-md shadow-2xl animate-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Submit Aid Request</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5">
                <X size={18} />
              </button>
            </div>

            {submitError && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-4">
                {(submitError as any)?.response?.data?.message || 'Failed to submit request'}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Aid Type</label>
                <select
                  required
                  value={form.aidTypeId}
                  onChange={(e) => setForm((f) => ({ ...f, aidTypeId: e.target.value }))}
                  className="input"
                >
                  <option value="">Select aid type...</option>
                  {aidTypes?.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Region</label>
                <select
                  required
                  value={form.regionId}
                  onChange={(e) => setForm((f) => ({ ...f, regionId: e.target.value }))}
                  className="input"
                >
                  <option value="">Select region...</option>
                  {regions?.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Urgency</label>
                <select
                  value={form.urgency}
                  onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value as UrgencyLevel }))}
                  className="input"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="label">Dependants</label>
                <input
                  type="number"
                  min="0"
                  value={form.dependants}
                  onChange={(e) => setForm((f) => ({ ...f, dependants: parseInt(e.target.value) || 0 }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  required
                  minLength={10}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Tell us about your situation..."
                  className="input min-h-[100px]"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

