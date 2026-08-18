import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const AnimatedBackground = () => {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dark mode background overlay */}
      {isDark && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950/90" />
      )}
      
      {/* Red Orb 1 - Enhanced */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[150px] transition-colors duration-500 ${
          isDark ? 'bg-primary-500/20' : 'bg-primary-500/10'
        }`}
      />

      {/* Red Orb 2 - Enhanced */}
      <motion.div
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 80, -30, 0],
          scale: [1, 1.15, 0.85, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full blur-[160px] transition-colors duration-500 ${
          isDark ? 'bg-primary-600/30' : 'bg-primary-600/10'
        }`}
      />

      {/* Red Orb 3 - Enhanced */}
      <motion.div
        animate={{
          x: [0, 60, -80, 0],
          y: [0, -40, 60, 0],
          scale: [1, 1.25, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute -bottom-32 left-1/3 w-[600px] h-[600px] rounded-full blur-[180px] transition-colors duration-500 ${
          isDark ? 'bg-primary-700/25' : 'bg-primary-700/8'
        }`}
      />

      {/* Dark Mode - Extra Red Glow */}
      {isDark && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary-500/10 via-primary-500/15 to-primary-500/10 rounded-full blur-[120px]"
        />
      )}

      {/* Subtle Mesh Grid - Enhanced in Dark Mode */}
      <div 
        className={`absolute inset-0 ${isDark ? 'opacity-[0.06]' : 'opacity-[0.02]'}`}
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(153,0,0,${isDark ? '0.4' : '0.3'}) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;