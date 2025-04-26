import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'blue' }) => {
  // Size classes
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-12 w-12 border-2',
    large: 'h-16 w-16 border-3'
  };
  
  // Color classes
  const colorClasses = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    gray: 'border-gray-500',
    white: 'border-white'
  };
  
  const spinnerSize = sizeClasses[size] || sizeClasses.medium;
  const spinnerColor = colorClasses[color] || colorClasses.blue;
  
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full ${spinnerSize} border-t-transparent ${spinnerColor}`}></div>
    </div>
  );
};

export default LoadingSpinner;
