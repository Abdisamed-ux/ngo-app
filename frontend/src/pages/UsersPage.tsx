import React, { useState } from 'react';
import { Users, Shield, UserX, UserCheck, Search } from 'lucide-react';
import { Layout } from '../components/Layout.js';
import { SkeletonRow } from '../components/LoadingSpinner.js';
import { useAllUsers, useUpdateUserStatus } from '../hooks/useAdmin.js';

export const UsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAllUsers(page);
  const { mutate: toggleStatus, isPending: toggling } = useUpdateUserStatus();

  return (
    <Layout title="User Management">
      <div className="mb-6 flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            className="input pl-10"
          />
        </div>
        <p className="text-sm text-slate-500">
          Total Users: {data?.meta?.total || 0}
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-dark-border/50 border-b border-slate-100 dark:border-dark-border">
              <tr>
                <th className="text-left px-5 py-4 font-semibold text-slate-600 dark:text-slate-400">User</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600 dark:text-slate-400">Role</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                <th className="text-left px-5 py-4 font-semibold text-slate-600 dark:text-slate-400">Joined</th>
                <th className="text-right px-5 py-4 font-semibold text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5"><SkeletonRow /></td></tr>
                ))
              ) : (
                data?.data?.map((u) => (
                  <tr key={u.id} className="table-row-hover">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center font-bold">
                          {u.full_name?.[0] || u.email[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{u.full_name || '—'}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-dark-border text-slate-600 dark:text-slate-400">
                        <Shield size={12} />
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        u.is_active 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => toggleStatus({ userId: u.id, isActive: !u.is_active })}
                        disabled={toggling}
                        className={`btn-ghost p-1.5 rounded-lg transition-colors ${
                          u.is_active ? 'hover:text-red-500' : 'hover:text-emerald-500'
                        }`}
                        title={u.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {u.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
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
