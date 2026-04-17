import React, { useState } from 'react';
import { Briefcase, AlertCircle, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { Layout } from '../components/Layout.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { PageLoader } from '../components/LoadingSpinner.js';
import { useAllAidRequests, useUpdateCaseStatus } from '../hooks/useAidRequests.js';
import type { AidRequest, AidRequestStatus } from '../types/index.js';

const URGENCY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export const CasesPage: React.FC = () => {
  const { data, isLoading, isError } = useAllAidRequests(1, undefined, undefined);
  const { mutate: updateStatus, isPending: updating } = useUpdateCaseStatus();
  const [selectedCase, setSelectedCase] = useState<AidRequest | null>(null);
  const [newStatus, setNewStatus] = useState<AidRequestStatus>('UNDER_REVIEW');
  const [reason, setReason] = useState('');
  const [showModal, setShowModal] = useState(false);

  const cases = [...(data?.data || [])].sort(
    (a, b) => (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9)
  );

  const openModal = (req: AidRequest) => {
    setSelectedCase(req);
    setNewStatus(req.status);
    setReason('');
    setShowModal(true);
  };

  const handleUpdate = () => {
    if (!selectedCase) return;
    updateStatus(
      { requestId: selectedCase.id, status: newStatus, reason: reason || undefined },
      {
        onSuccess: () => {
          setShowModal(false);
          setSelectedCase(null);
        },
      }
    );
  };

  const urgencyBorder: Record<string, string> = {
    CRITICAL: 'border-l-red-500',
    HIGH: 'border-l-amber-500',
    MEDIUM: 'border-l-blue-500',
    LOW: 'border-l-slate-400',
  };

  if (isLoading) return <Layout title="Case Management"><PageLoader /></Layout>;

  if (isError)
    return (
      <Layout title="Case Management">
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <AlertCircle size={40} className="mb-3 opacity-40" />
          <p>Failed to load cases</p>
        </div>
      </Layout>
    );

  return (
    <Layout title="Case Management">
      <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Briefcase size={16} />
        <span>{cases.length} cases — sorted by urgency</span>
      </div>

      {cases.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-slate-400">
          <Briefcase size={48} className="mb-3 opacity-30" />
          <p className="font-medium">No cases to display</p>
          <p className="text-sm mt-1">Aid requests will appear here once submitted</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cases.map((req) => (
            <div
              key={req.id}
              className={`card border-l-4 ${urgencyBorder[req.urgency] || 'border-l-slate-300'} p-5 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="font-mono text-xs text-slate-400">{req.request_number}</span>
                <StatusBadge type="urgency" value={req.urgency} />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
                {req.description}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Beneficiary: {req.beneficiary?.full_name || '—'}
              </p>
              <div className="flex items-center justify-between">
                <StatusBadge type="aidRequest" value={req.status} />
                <button
                  onClick={() => openModal(req)}
                  className="text-xs font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1"
                >
                  Update <ChevronDown size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      {showModal && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative card p-6 w-full max-w-md shadow-2xl animate-in">
            <h3 className="text-lg font-semibold mb-1">Update Case Status</h3>
            <p className="text-sm text-slate-500 mb-5 font-mono">{selectedCase.request_number}</p>

            <div className="space-y-4">
              <div>
                <label className="label">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AidRequestStatus)}
                  className="input"
                >
                  {(['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISBURSED'] as AidRequestStatus[]).map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              {newStatus === 'REJECTED' && (
                <div>
                  <label className="label">Rejection Reason <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why this request is rejected…"
                    required
                    className="input"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button>
                <button
                  onClick={handleUpdate}
                  disabled={updating || (newStatus === 'REJECTED' && !reason)}
                  className={newStatus === 'REJECTED' ? 'btn-danger flex-1' : 'btn-primary flex-1'}
                >
                  {updating ? 'Updating…' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
