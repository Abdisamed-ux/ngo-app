import React from 'react';
import type { AidRequestStatus, DonationStatus, UrgencyLevel } from '../types/index.js';

const aidStatusStyles: Record<AidRequestStatus, string> = {
  SUBMITTED: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  APPROVED: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  DISBURSED: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

const donationStatusStyles: Record<DonationStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED: 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400',
  ALLOCATED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  REFUNDED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const urgencyStyles: Record<UrgencyLevel, string> = {
  CRITICAL: 'bg-red-500 text-white',
  HIGH: 'bg-amber-500 text-white',
  MEDIUM: 'bg-blue-500 text-white',
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
