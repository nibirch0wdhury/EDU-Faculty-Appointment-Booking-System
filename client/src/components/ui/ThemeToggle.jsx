import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = ({ variant = 'default', className = '' }) => {
  const { theme, toggleTheme, isDark, isLight } = useTheme();

  const variants = {
    default: {
      button: 'p-2 rounded-xl transition-all duration-300',
      icon: 'w-5 h-5',
      container: 'flex items-center gap-2',
    },
    navbar: {
      button: 'p-2 rounded-xl transition-all duration-300 hover:bg-primary-50 dark:hover:bg-primary-950/30',
      icon: 'w-5 h-5',
      container: 'flex items-center gap-2',
    },
    sidebar: {
      button: 'p-3 rounded-xl transition-all duration-300 w-full flex items-center justify-center hover:bg-primary-50 dark:hover:bg-primary-950/30',
      icon: 'w-5 h-5',
      container: 'w-full',
    },
    floating: {
      button: 'p-3 rounded-full shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 border border-primary-500/20 hover:shadow-primary-500/20 dark:hover:shadow-primary-500/40',
      icon: 'w-6 h-6',
      container: 'fixed bottom-6 right-6 z-50',
    },
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div className={currentVariant.container}>
      <motion.button
        onClick={toggleTheme}
        className={`${currentVariant.button} ${className} relative overflow-hidden group`}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        aria-label="Toggle theme"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        
        <div className="relative z-10 flex items-center gap-2">
          {isLight ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <Sun className={`${currentVariant.icon} text-amber-500 dark:text-amber-400`} />
              {variant !== 'floating' && variant !== 'sidebar' && (
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 hidden sm:inline">
                  Light
                </span>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <Moon className={`${currentVariant.icon} text-indigo-400 dark:text-indigo-300`} />
              {variant !== 'floating' && variant !== 'sidebar' && (
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 hidden sm:inline">
                  Dark
                </span>
              )}
            </motion.div>
          )}
        </div>

        {variant === 'navbar' && (
          <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full transition-all duration-300 ${isDark ? 'bg-indigo-400 dark:bg-indigo-300 w-6' : 'bg-amber-500 dark:bg-amber-400 w-4'}`} />
        )}
      </motion.button>

      {variant === 'sidebar' && (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 text-center block">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;