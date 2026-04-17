import React, { useState } from 'react';
import { Plus, X, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { PageLoader, SkeletonRow } from '../components/LoadingSpinner.js';
import { useAllDonations, useCreateDonation } from '../hooks/useDonations.js';
import type { DonationStatus, PaymentMethod } from '../types/index.js';

const STATUS_FILTERS: Array<{ label: string; value: '' | DonationStatus }> = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Allocated', value: 'ALLOCATED' },
  { label: 'Refunded', value: 'REFUNDED' },
];

const PAYMENT_METHODS: PaymentMethod[] = ['BANK', 'CARD', 'CASH', 'CHEQUE', 'CRYPTO', 'MOBILE'];

export const DonationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'' | DonationStatus>('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, isError } = useAllDonations(page, filter || undefined);
  const { mutate: createDonation, isPending: creating, error: createError } = useCreateDonation();

  const [form, setForm] = useState({
    amount: '',
    paymentMethod: 'BANK' as PaymentMethod,
    donationDate: new Date().toISOString().split('T')[0],
    isAnonymous: false,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDonation(
      {
        amount: parseFloat(form.amount),
        paymentMethod: form.paymentMethod,
        donationDate: new Date(form.donationDate).toISOString(),
        isAnonymous: form.isAnonymous,
        notes: form.notes || undefined,
      },
      { onSuccess: () => setShowModal(false) }
    );
  };

  return (
    <Layout title="Donations">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              className={`px-4 py-1.5 text-sm rounded-xl font-medium transition-all ${
                filter === f.value
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-dark-border hover:border-brand-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          id="new-donation-btn"
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Record Donation
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 dark:border-dark-border">
              <tr>
                {['Donor', 'Amount', 'Method', 'Status', 'Date', 'Receipt #'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5"><SkeletonRow /></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <AlertCircle size={36} className="mx-auto mb-2 opacity-40" />
                    <p>Failed to load donations</p>
                  </td>
                </tr>
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <p className="text-sm">No donations found</p>
                  </td>
                </tr>
              ) : (
                data.data.map((d) => (
                  <tr key={d.id} className="table-row-hover">
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      {d.is_anonymous ? (
                        <span className="italic text-slate-400">Anonymous</span>
                      ) : (
                        d.donor?.full_name || '—'
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {parseFloat(String(d.amount)).toLocaleString('en-US', {
                        style: 'currency',
                        currency: d.currency,
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">{d.payment_method}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge type="donation" value={d.status} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(d.donation_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                      {d.receipt_number || '—'}
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

      {/* New Donation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative card p-6 w-full max-w-md shadow-2xl animate-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Record Donation</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1.5">
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-4">
                {(createError as any)?.response?.data?.message || 'Failed to create donation'}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Amount (USD)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  placeholder="500.00"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as PaymentMethod }))}
                  className="input"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Donation Date</label>
                <input
                  type="date"
                  required
                  value={form.donationDate}
                  onChange={(e) => setForm((f) => ({ ...f, donationDate: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Any notes…"
                  className="input"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={(e) => setForm((f) => ({ ...f, isAnonymous: e.target.checked }))}
                  className="w-4 h-4 rounded accent-brand-500"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Anonymous donation</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary flex-1">
                  {creating ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
