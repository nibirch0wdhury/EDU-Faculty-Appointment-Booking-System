import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false, 
  text = 'Loading...',
}) => {
  const sizes = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4',
    xl: 'h-24 w-24 border-4',
  };

  const spinnerSize = sizes[size] || sizes.md;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center z-50">
        <div className={`animate-spin rounded-full ${spinnerSize} border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/30`}></div>
        {text && (
          <p className="mt-4 text-xs font-semibold text-slate-300 tracking-wider uppercase animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <div className={`animate-spin rounded-full ${spinnerSize} border-indigo-500 border-t-transparent shadow-lg shadow-indigo-500/30`}></div>
      {text && (
        <p className="mt-4 text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;