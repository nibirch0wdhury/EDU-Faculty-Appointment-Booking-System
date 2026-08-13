import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false, 
  text = 'Loading...',
  color = 'primary' 
}) => {
  // Size variants
  const sizes = {
    sm: 'h-8 w-8 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4',
    xl: 'h-24 w-24 border-4',
  };

  // Color variants
  const colors = {
    primary: 'border-primary-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
    green: 'border-green-500 border-t-transparent',
    blue: 'border-blue-500 border-t-transparent',
  };

  const spinnerSize = sizes[size] || sizes.md;
  const spinnerColor = colors[color] || colors.primary;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className={`animate-spin rounded-full ${spinnerSize} ${spinnerColor}`}></div>
        {text && (
          <p className="mt-4 text-gray-600 font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className={`animate-spin rounded-full ${spinnerSize} ${spinnerColor}`}></div>
      {text && (
        <p className="mt-4 text-gray-600 font-medium">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;