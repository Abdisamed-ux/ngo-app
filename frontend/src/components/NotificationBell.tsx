import React, { useState, useRef } from 'react';
import { Bell, Check, Mail } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications.js';

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const { mutate: markRead } = useMarkAsRead();
  const { mutate: markAllRead } = useMarkAllAsRead();
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  // Close when clicking outside
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-dark-border rounded-xl transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-dark-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-[400px] flex flex-col bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in">
          <div className="p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-[11px] font-semibold text-brand-500 hover:text-brand-600 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {!notifications?.length ? (
              <div className="p-10 text-center">
                <Mail size={32} className="mx-auto mb-2 text-slate-200" />
                <p className="text-xs text-slate-400">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-dark-border/50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-dark-border/30 transition-colors cursor-default ${
                      !n.is_read ? 'bg-brand-50/30 dark:bg-brand-500/5' : ''
                    }`}
                  >
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-brand-500' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${!n.is_read ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="p-1 text-slate-300 hover:text-brand-500 transition-colors"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
