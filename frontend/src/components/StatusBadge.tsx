import React from 'react';
import type { AidRequestStatus, DonationStatus, UrgencyLevel } from '../types/index.js';

const aidStatusStyles: Record<AidRequestStatus, string> = {
  SUBMITTED: 'bg-slate-100/70 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:border dark:border-slate-700/50',
  UNDER_REVIEW: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border dark:border-indigo-500/20',
  APPROVED: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 dark:border dark:border-brand-500/20',
  REJECTED: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border dark:border-red-500/20',
  DISBURSED: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 dark:border dark:border-teal-500/20',
};

const donationStatusStyles: Record<DonationStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border dark:border-amber-500/20',
  CONFIRMED: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 dark:border dark:border-brand-500/20',
  ALLOCATED: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border dark:border-indigo-500/20',
  REFUNDED: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 dark:border dark:border-red-500/20',
};

const urgencyStyles: Record<UrgencyLevel, string> = {
  CRITICAL: 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]',
  HIGH: 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]',
  MEDIUM: 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]',
  LOW: 'bg-slate-400 text-white',
};

interface StatusBadgeProps {
  type: 'aidRequest' | 'donation' | 'urgency';
  value: AidRequestStatus | DonationStatus | UrgencyLevel;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  let className = '';
  if (type === 'aidRequest') className = aidStatusStyles[value as AidRequestStatus] || '';
  else if (type === 'donation') className = donationStatusStyles[value as DonationStatus] || '';
  else if (type === 'urgency') className = urgencyStyles[value as UrgencyLevel] || '';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {value.replace('_', ' ')}
    </span>
  );
};
