import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import MagneticButton from './MagneticButton';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  loading = false,
  variant = 'danger', // 'danger' | 'warning' | 'info'
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop with Glassmorphism Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={loading ? undefined : onClose}
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 shadow-2xl shadow-slate-900/20 dark:shadow-slate-950/50 space-y-6 text-left overflow-hidden z-10"
          >
            {/* Ambient Background Glow */}
            <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
              variant === 'danger' ? 'bg-red-500' : 'bg-amber-500'
            }`} />

            {/* Header / Icon */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-2xl flex items-center justify-center ${
                  variant === 'danger' 
                    ? 'bg-red-100/80 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200/50 dark:border-red-800/40 shadow-sm shadow-red-500/10' 
                    : 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40 shadow-sm shadow-amber-500/10'
                }`}>
                  {variant === 'danger' ? (
                    <Trash2 className="w-6 h-6" />
                  ) : (
                    <AlertTriangle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Action requires confirmation
                  </p>
                </div>
              </div>

              {!loading && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Message Body */}
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {message}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>

              <MagneticButton
                type="button"
                onClick={onConfirm}
                disabled={loading}
                variant={variant === 'danger' ? 'danger' : 'primary'}
                className={`px-5 py-2.5 text-xs font-semibold rounded-xl ${
                  variant === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20' 
                    : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  <span>{confirmText}</span>
                )}
              </MagneticButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
