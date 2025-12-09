import React from 'react';

type DividerProps = {
  className?: string;
};

export const Divider: React.FC<DividerProps> = ({ className = '' }) => {
  return (
    <div className={`container mx-auto px-4 ${className}`}>
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black rounded-full">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">⸻</span>
          </div>
        </div>
      </div>
    </div>
  );
};