
import React from 'react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      {text && <p className="text-purple-300">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
