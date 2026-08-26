import React from 'react';
import { motion } from 'framer-motion';

const MagneticButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden";
  
  const variants = {
    primary: "bg-primary-500 text-white shadow-md shadow-primary-500/25 border border-primary-500/30 hover:shadow-primary-500/40",
    secondary: "bg-white text-primary-500 border-2 border-primary-500/30 hover:bg-primary-50 hover:border-primary-500/60 dark:bg-slate-900/90 dark:text-primary-400 dark:border-primary-500/30 dark:hover:bg-primary-950/40",
    danger: "bg-red-600 text-white shadow-md shadow-red-500/25 border border-red-500/30 hover:shadow-red-500/40",
    emerald: "bg-emerald-600 text-white shadow-md shadow-emerald-500/25 border border-emerald-500/30 hover:shadow-emerald-500/40",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-primary-500",
    outline: "bg-transparent text-slate-700 border-2 border-slate-200 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium">
        {children}
      </span>
      {/* Shimmer effect for primary */}
      {variant === 'primary' && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shimmer" />
      )}
    </motion.button>
  );
};

export default MagneticButton;