import React, { useState } from 'react';
import { User, Key, Save, AlertCircle } from 'lucide-react';
import { Layout } from '../components/Layout.js';
import { useAuthStore } from '../stores/authStore.js';
import api from '../lib/api.js';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.patch('/auth/profile', { fullName });
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      await api.patch('/auth/change-password', { currentPassword, newPassword });
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Your Profile">
      <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6 text-brand-500">
            <User size={20} />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Personal Details</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="text" value={user?.email} disabled className="input bg-slate-50 opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="input"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <Save size={16} />
              Save Changes
            </button>
          </form>
        </div>

        {/* Security */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6 text-brand-500">
            <Key size={20} />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Security & Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="input"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-ghost w-full flex items-center justify-center gap-2 text-brand-500">
              <Key size={16} />
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-8">
        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center gap-3 animate-in">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl flex items-center gap-3 animate-in">
            <AlertCircle size={18} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </div>
    </Layout>
  );
};
