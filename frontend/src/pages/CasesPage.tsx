import React, { useState } from 'react';
import { Briefcase, AlertCircle, CheckCircle, XCircle, ChevronDown, Search, Filter, FileText, Upload } from 'lucide-react';
import { Layout } from '../components/Layout.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { PageLoader } from '../components/LoadingSpinner.js';
import { useAllAidRequests, useUpdateCaseStatus, useCaseDocuments, useUploadCaseDocument } from '../hooks/useAidRequests.js';
import { useDisburseFunds } from '../hooks/useFunds.js';
import type { AidRequest, AidRequestStatus } from '../types/index.js';

const URGENCY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export const CasesPage: React.FC = () => {
  const { data, isLoading, isError } = useAllAidRequests(1, undefined, undefined);
  const { mutate: updateStatus, isPending: updating } = useUpdateCaseStatus();
  const { mutate: disburse, isPending: disbursing } = useDisburseFunds();
  
  const [selectedCase, setSelectedCase] = useState<AidRequest | null>(null);
  const [newStatus, setNewStatus] = useState<AidRequestStatus>('UNDER_REVIEW');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'DOCUMENTS'>('DETAILS');

  const { data: documents } = useCaseDocuments(selectedCase?.id || null);
  const { mutate: uploadDocument, isPending: uploading } = useUploadCaseDocument();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const cases = [...(data?.data || [])]
    .filter((req) => {
      const matchesSearch =
        searchTerm === '' ||
        req.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.beneficiary?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9));

  const openModal = (req: AidRequest) => {
    setSelectedCase(req);
    setNewStatus(req.status);
    setReason('');
    setAmount(req.estimated_value?.toString() || '');
    setReference('');
    setActiveTab('DETAILS');
    setShowModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedCase) {
      uploadDocument({ requestId: selectedCase.id, file: e.target.files[0] });
    }
  };

  const handleUpdate = () => {
    if (!selectedCase) return;

    if (newStatus === 'DISBURSED') {
      disburse(
        {
          requestId: selectedCase.id,
          amount: parseFloat(amount),
          paymentReference: reference,
          notes: reason,
        },
        {
          onSuccess: () => {
            setShowModal(false);
            setSelectedCase(null);
          },
        }
      );
    } else {
      updateStatus(
        { requestId: selectedCase.id, status: newStatus, reason: reason || undefined },
        {
          onSuccess: () => {
            setShowModal(false);
            setSelectedCase(null);
          },
        }
      );
    }
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
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Briefcase size={16} />
          <span>{cases.length} cases found</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search request # or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9 text-sm"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input pl-9 text-sm appearance-none pr-8"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="DISBURSED">Disbursed</option>
            </select>
          </div>
        </div>
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
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                {req.description}
              </p>
              
              {req.ai_summary && (
                <div className="mb-3 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-xs">
                  <div className="flex items-center gap-1 mb-1 text-indigo-700 dark:text-indigo-300 font-bold">
                    <span>🤖 AI Insights</span>
                    {req.ai_urgency_score && (
                      <span className="ml-auto text-[10px] bg-indigo-100 dark:bg-indigo-500/30 px-1.5 py-0.5 rounded-full">
                        {req.ai_urgency_score}% Match
                      </span>
                    )}
                  </div>
                  <p className="text-indigo-600 dark:text-indigo-400 line-clamp-2 leading-relaxed">
                    {req.ai_summary.replace('🤖 AI Summary: ', '')}
                  </p>
                </div>
              )}

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
          <div className="relative card p-0 w-full max-w-md shadow-2xl animate-in overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-5 pb-0 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-lg font-semibold mb-1">Case: {selectedCase.request_number}</h3>
              
              <div className="flex gap-4 mt-4">
                <button 
                  onClick={() => setActiveTab('DETAILS')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'DETAILS' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Details & Status
                </button>
                <button 
                  onClick={() => setActiveTab('DOCUMENTS')}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'DOCUMENTS' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  Documents
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {activeTab === 'DETAILS' ? (
                <div className="space-y-4">
                  {selectedCase.ai_summary && (
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                      <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                        <span>🤖 AI Insights & Triage</span>
                        {selectedCase.ai_urgency_score && (
                          <span className="ml-auto text-xs bg-indigo-100 dark:bg-indigo-500/30 px-2 py-0.5 rounded-full">
                            {selectedCase.ai_urgency_score}% Match Confidence
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 leading-relaxed">
                        {selectedCase.ai_summary.replace('🤖 AI Summary: ', '')}
                      </p>
                    </div>
                  )}

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

                  {newStatus === 'DISBURSED' && (
                    <>
                      <div>
                        <label className="label">Disbursement Amount <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount..."
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Payment Reference <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          placeholder="e.g. Transaction ID, Check #..."
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="label">Disbursement Notes</label>
                        <input
                          type="text"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Optional notes..."
                          className="input"
                        />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {documents && documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText size={20} className="text-brand-500 flex-shrink-0" />
                            <div className="truncate">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{doc.filename}</p>
                              <p className="text-xs text-slate-500">Uploaded by {doc.uploader?.full_name}</p>
                            </div>
                          </div>
                          <a href={`http://localhost:3000/${doc.file_path}`} target="_blank" rel="noreferrer" className="text-brand-500 hover:text-brand-600 text-sm font-medium px-2 py-1 bg-brand-500/10 rounded-md">
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-500 text-sm">
                      No documents attached to this case.
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="btn-secondary w-full flex justify-center items-center gap-2 cursor-pointer">
                      <Upload size={16} />
                      {uploading ? 'Uploading...' : 'Upload Document'}
                      <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex gap-3">
              <button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Close</button>
              {activeTab === 'DETAILS' && (
                <button
                  onClick={handleUpdate}
                  disabled={
                    updating || 
                    disbursing ||
                    (newStatus === 'REJECTED' && !reason) ||
                    (newStatus === 'DISBURSED' && (!amount || !reference))
                  }
                  className={newStatus === 'REJECTED' ? 'btn-danger flex-1' : 'btn-primary flex-1'}
                >
                  {updating || disbursing ? 'Processing…' : 'Save Details'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
