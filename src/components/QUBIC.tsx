import React, { ReactNode } from 'react';

interface QUBICProps {
  children: ReactNode;
  className?: string;
}

export const QUBIC: React.FC<QUBICProps> = ({ children, className = '' }) => {
  return (
    <span className={`font-bold bg-gradient-to-r from-electric via-electricAccent to-cyan text-transparent bg-clip-text ${className}`}>
      {children}
    </span>
  );
};
