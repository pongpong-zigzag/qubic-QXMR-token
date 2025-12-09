import React from 'react';

interface QxmrIconTextProps {
  text: string;
  className?: string;
}

export const QxmrIconText: React.FC<QxmrIconTextProps> = ({ text, className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="/assets/qxmr-meme-icon.png" 
        alt="QXMR Icon" 
        className="w-16 h-16 mr-4"
      />
      <span className="electric-text">{text}</span>
      <img 
        src="/assets/qxmr-meme-icon.png" 
        alt="QXMR Icon" 
        className="w-16 h-16 ml-4"
      />
    </div>
  );
};
