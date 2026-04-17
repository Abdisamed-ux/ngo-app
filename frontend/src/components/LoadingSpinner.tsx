import React from 'react';

export const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <div className={`flex items-center justify-center ${className}`}>
    <svg
      className="animate-spin text-brand-500"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  </div>
);

export const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size={40} />
  </div>
);

export const SkeletonRow: React.FC = () => (
  <div className="animate-pulse flex gap-4 py-3">
    <div className="h-4 bg-slate-200 dark:bg-dark-border rounded w-1/4" />
    <div className="h-4 bg-slate-200 dark:bg-dark-border rounded w-1/3" />
    <div className="h-4 bg-slate-200 dark:bg-dark-border rounded w-1/5" />
    <div className="h-4 bg-slate-200 dark:bg-dark-border rounded w-1/6" />
  </div>
);
