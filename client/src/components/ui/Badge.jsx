import React from 'react';

const Badge = ({ status = 'pending', text, className = '' }) => {
  const statusConfig = {
    confirmed: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      dot: 'bg-emerald-400',
      label: 'Confirmed',
    },
    approved: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      dot: 'bg-emerald-400',
      label: 'Approved',
    },
    pending: {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      dot: 'bg-amber-400',
      label: 'Pending',
    },
    completed: {
      bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300',
      dot: 'bg-indigo-400',
      label: 'Completed',
    },
    cancelled: {
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      dot: 'bg-rose-400',
      label: 'Cancelled',
    },
    rejected: {
      bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      dot: 'bg-rose-400',
      label: 'Rejected',
    },
    active: {
      bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      dot: 'bg-emerald-400',
      label: 'Active',
    },
    inactive: {
      bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
      dot: 'bg-slate-400',
      label: 'Inactive',
    },
  };

  const key = (status || '').toLowerCase();
  const config = statusConfig[key] || {
    bg: 'bg-slate-500/15 border-slate-500/30 text-slate-300',
    dot: 'bg-slate-400',
    label: status,
  };

  const displayLabel = text || config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md transition-all duration-200 capitalize ${config.bg} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      {displayLabel}
    </span>
  );
};

export default Badge;
