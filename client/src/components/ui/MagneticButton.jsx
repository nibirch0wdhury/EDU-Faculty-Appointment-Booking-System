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
    primary: "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30",
    secondary: "bg-slate-800/80 text-slate-200 border border-slate-700/80 hover:border-slate-600 hover:text-white",
    danger: "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-500/25 border border-rose-400/30",
    emerald: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/30",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white",
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
      <span className="relative z-10 flex items-center justify-center gap-2 px-5 py-2.5">
        {children}
      </span>
      {/* Light sheen on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-shimmer" />
    </motion.button>
  );
};

export default MagneticButton;
