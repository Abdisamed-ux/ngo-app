import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useRegister } from '../hooks/useAuth.js';
import type { Role } from '../types/index.js';

const ROLES: { value: Role; label: string }[] = [
  { value: 'NGO_ADMIN', label: 'NGO Admin' },
  { value: 'CASEWORKER', label: 'Caseworker' },
  { value: 'DONOR', label: 'Donor' },
  { value: 'BENEFICIARY', label: 'Beneficiary' },
];

export const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'DONOR' as Role });
  const { mutate: register, isPending, error } = useRegister();
  const errorMsg = (error as any)?.response?.data?.message || (error as any)?.message;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      <div className="gradient-blob-1 w-[600px] h-[600px] top-[-20%] right-[-15%] opacity-40" />
      <div className="gradient-blob-2 w-[500px] h-[500px] bottom-[-20%] left-[-15%] opacity-30" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-400 flex items-center justify-center shadow-2xl mb-4">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">TrustVerify</h1>
          <p className="text-slate-400 text-sm mt-1">Create your account</p>
        </div>

        <div className="glass-dark rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Get started</h2>
          <p className="text-slate-400 text-sm mb-6">Fill in your details to register</p>

          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{typeof errorMsg === 'string' ? errorMsg : 'Registration failed'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="label text-slate-300">Full name</label>
              <input
                id="fullName"
                type="text"
                value={form.fullName}
                onChange={set('fullName')}
                placeholder="Jane Doe"
                required
                minLength={2}
                className="input bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="label text-slate-300">Email address</label>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                required
                className="input bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="label text-slate-300">Password</label>
              <input
                id="reg-password"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="input bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label htmlFor="role" className="label text-slate-300">Role</label>
              <select
                id="role"
                value={form.role}
                onChange={set('role')}
                className="input bg-white/5 border-white/10 text-white focus:border-brand-500"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value} className="bg-dark-surface">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <button id="register-btn" type="submit" disabled={isPending} className="btn-primary w-full mt-2">
              {isPending ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
