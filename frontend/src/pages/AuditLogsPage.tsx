import React, { useState } from 'react';
import { History, Activity, Database, Key, Info } from 'lucide-react';
import { Layout } from '../components/Layout.js';
import { SkeletonRow } from '../components/LoadingSpinner.js';
import { useAuditLogs } from '../hooks/useAdmin.js';

export const AuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAuditLogs(page);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <Database className="text-emerald-500" size={16} />;
      case 'UPDATE': return <Activity className="text-blue-500" size={16} />;
      case 'DELETE': return <UserX className="text-red-500" size={16} />;
      case 'LOGIN': return <Key className="text-amber-500" size={16} />;
      default: return <Info className="text-slate-400" size={16} />;
    }
  };

  return (
    <Layout title="System Audit Logs">
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-dark-border/50 border-b border-slate-100 dark:border-dark-border">
              <tr>
                <th className="text-left px-5 py-4 font-semibold text-slate-600 dark:text-slate-400">Timestamp</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600 dark:text-slate-400">Action</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600 dark:text-slate-400">Entity</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600 dark:text-slate-400">Performed By</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600 dark:text-slate-400">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5"><SkeletonRow /></td></tr>
                ))
              ) : (
                data?.data?.map((log: any) => (
                  <tr key={log.id} className="table-row-hover">
                    <td className="px-5 py-4 whitespace-nowrap text-slate-500 text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="font-medium text-slate-700 dark:text-slate-300">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="capitalize text-slate-500">{log.entity_type}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-400">
                      {log.changed_by.split('-')[0]}...
                    </td>
                    <td className="px-5 py-4">
                      <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-400">
                        {JSON.stringify(log.new_value || log.old_value)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-dark-border flex items-center justify-between">
            <span className="text-xs text-slate-500">Page {page} of {data.meta.totalPages}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="btn-ghost text-xs"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => p + 1)} 
                disabled={page >= data.meta.totalPages}
                className="btn-ghost text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Missing imports fix
import { UserX } from 'lucide-react';
