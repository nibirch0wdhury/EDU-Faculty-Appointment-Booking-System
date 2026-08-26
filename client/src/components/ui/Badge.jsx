import React from 'react';

const Badge = ({ status = 'pending', text, className = '' }) => {
  const statusConfig = {
    confirmed: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Confirmed',
    },
    approved: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Approved',
    },
    pending: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      dot: 'bg-amber-500',
      label: 'Pending',
    },
    completed: {
      bg: 'bg-primary-50 border-primary-200 text-primary-700',
      dot: 'bg-primary-500',
      label: 'Completed',
    },
    cancelled: {
      bg: 'bg-red-50 border-red-200 text-red-700',
      dot: 'bg-red-500',
      label: 'Cancelled',
    },
    rejected: {
      bg: 'bg-red-50 border-red-200 text-red-700',
      dot: 'bg-red-500',
      label: 'Rejected',
    },
    active: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Active',
    },
    inactive: {
      bg: 'bg-slate-100 border-slate-200 text-slate-600',
      dot: 'bg-slate-400',
      label: 'Inactive',
    },
    read: {
      bg: 'bg-slate-100 border-slate-200 text-slate-600',
      dot: 'bg-slate-400',
      label: 'Read',
    },
    unread: {
      bg: 'bg-primary-50 border-primary-200 text-primary-700',
      dot: 'bg-primary-500',
      label: 'Unread',
    },
    replied: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Replied',
    },
  };

  const key = (status || '').toLowerCase();
  const config = statusConfig[key] || {
    bg: 'bg-slate-100 border-slate-200 text-slate-600',
    dot: 'bg-slate-400',
    label: status,
  };

  const displayLabel = text || config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-200 capitalize ${config.bg} ${className}`}
    >
      <span className={`relative flex h-2 w-2 ${config.dot} rounded-full`}>
        <span className={`absolute inline-flex h-full w-full rounded-full animate-ping opacity-75 ${config.dot}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      {displayLabel}
    </span>
  );
};

export default Badge;