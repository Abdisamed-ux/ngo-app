import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import {
  LayoutDashboard,
  HeartHandshake,
  ClipboardList,
  Briefcase,
  BarChart3,
  LogOut,
  ShieldCheck,
  Users as UsersIcon,
  History,
  User as UserIcon,
  Bell,
  Menu,
  Mail,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { useLogout } from '../hooks/useAuth.js';
import { ThemeToggle } from './ThemeToggle.js';
import { NotificationBell } from './NotificationBell.js';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/donations', icon: HeartHandshake, label: 'Donations', roles: ['NGO_ADMIN', 'SUPER_ADMIN'] },
  { to: '/donor-dashboard', icon: HeartHandshake, label: 'My Impact', roles: ['DONOR'] },
  { to: '/aid-requests', icon: ClipboardList, label: 'Aid Requests' },
  { to: '/cases', icon: Briefcase, label: 'Case Management', roles: ['NGO_ADMIN', 'SUPER_ADMIN', 'CASEWORKER'] },
  { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['NGO_ADMIN', 'SUPER_ADMIN'] },
  { to: '/users', icon: UsersIcon, label: 'Users', roles: ['NGO_ADMIN', 'SUPER_ADMIN'] },
  { to: '/audit-logs', icon: History, label: 'Audit Logs', roles: ['NGO_ADMIN', 'SUPER_ADMIN'] },
  { to: '/messages', icon: Mail, label: 'Messages' },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string, visible: boolean } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000', {
      withCredentials: true
    });

    socket.emit('join_user_room', user.id);

    socket.on('notification', (notif) => {
      // Show toast
      setToast({ message: notif.message, visible: true });
      // Invalidate queries to update bell
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Hide toast after 4s
      setTimeout(() => {
        setToast(prev => prev ? { ...prev, visible: false } : null);
      }, 4000);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, queryClient]);

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
          {navItems
            .filter((item) => !item.roles || (user?.role && item.roles.includes(user.role)))
            .map(({ to, icon: Icon, label }) => (
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
          <NavLink
            to="/profile"
            className={({ isActive }) => `flex items-center gap-2 text-sm text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 transition-colors py-2 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-border/50 mb-1 ${isActive ? 'text-brand-500 bg-slate-50 dark:bg-dark-border/50' : ''}`}
          >
            <UserIcon size={15} />
            <span>Profile Settings</span>
          </NavLink>
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
          <div className="ml-auto flex items-center gap-4">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <AnimatePresence mode="wait">
          <motion.main
            key={title || 'page'}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex-1 overflow-y-auto p-6 relative"
          >
            {children}
          </motion.main>
        </AnimatePresence>

        {/* Live Toast Notification */}
        <AnimatePresence>
          {toast?.visible && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-brand-500 shadow-2xl rounded-2xl p-4 flex items-center gap-3 max-w-sm"
            >
              <div className="w-8 h-8 rounded-full bg-brand-500 dark:bg-white/20 flex items-center justify-center flex-shrink-0">
                <Bell size={16} />
              </div>
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
