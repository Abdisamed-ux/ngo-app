import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useLogin } from '../hooks/useAuth.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { mutate: login, isPending, error } = useLogin();

  const errorMsg = (error as any)?.response?.data?.message || (error as any)?.message;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
      {/* Background blobs */}
      <div className="gradient-blob-1 w-[600px] h-[600px] top-[-20%] left-[-15%] opacity-40" />
      <div className="gradient-blob-2 w-[500px] h-[500px] bottom-[-20%] right-[-15%] opacity-30" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-400 flex items-center justify-center shadow-2xl mb-4">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">TrustVerify</h1>
          <p className="text-slate-400 text-sm mt-1">NGO Donation & Aid Tracking</p>
        </div>

        {/* Card */}
        <div className="glass-dark rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-6">Sign in to your account to continue</p>

          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label text-slate-300">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ngo.org"
                required
                className="input bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="label text-slate-300">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-brand-500 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={isPending}
              className="btn-primary w-full mt-2"
            >
              {isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
