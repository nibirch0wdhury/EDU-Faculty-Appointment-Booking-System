import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const AnimatedBackground = () => {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Red Orb 1 */}
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
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] transition-colors duration-500 ${
          isDark ? 'bg-primary-500/15' : 'bg-primary-500/10'
        }`}
      />

      {/* Red Orb 2 */}
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
        className={`absolute top-1/3 -right-32 w-96 h-96 rounded-full blur-[130px] transition-colors duration-500 ${
          isDark ? 'bg-primary-600/20' : 'bg-primary-600/10'
        }`}
      />

      {/* Red Orb 3 */}
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
        className={`absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] rounded-full blur-[140px] transition-colors duration-500 ${
          isDark ? 'bg-primary-700/15' : 'bg-primary-700/8'
        }`}
      />

      {/* Subtle Mesh Grid */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(153,0,0,0.3) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;