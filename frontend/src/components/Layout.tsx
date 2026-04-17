import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  HeartHandshake,
  ClipboardList,
  Briefcase,
  BarChart3,
  LogOut,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { useLogout } from '../hooks/useAuth.js';
import { ThemeToggle } from './ThemeToggle.js';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/donations', icon: HeartHandshake, label: 'Donations' },
  { to: '/aid-requests', icon: ClipboardList, label: 'Aid Requests' },
  { to: '/cases', icon: Briefcase, label: 'Case Management' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-500/20 text-purple-400',
  NGO_ADMIN: 'bg-brand-500/20 text-brand-500',
  CASEWORKER: 'bg-blue-500/20 text-blue-400',
  DONOR: 'bg-amber-500/20 text-amber-400',
  BENEFICIARY: 'bg-teal-500/20 text-teal-400',
};

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user } = useAuthStore();
  const logout = useLogout();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-dark-bg overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar ────────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col
          bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-200 dark:border-dark-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-teal-400 flex items-center justify-center shadow-lg">
            <ShieldCheck className="text-white" size={18} />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">TrustVerify</p>
            <p className="text-[10px] text-slate-400">NGO Aid System</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-slate-200 dark:border-dark-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user?.fullName || 'User'}
              </p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${roleColors[user?.role || ''] || 'bg-slate-200 text-slate-500'}`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="w-full flex items-center gap-2 text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors py-2 px-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-dark-surface border-b border-slate-200 dark:border-dark-border flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden btn-ghost p-2"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          {title && (
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
          )}
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-in">
          {children}
        </main>
      </div>
    </div>
  );
};
