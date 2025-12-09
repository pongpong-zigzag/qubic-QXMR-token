import React from 'react';

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export const Section: React.FC<SectionProps> = ({ children, className = '', id }) => {
  return (
    <section id={id} className={`relative ${className}`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-600/5 top-1/4 -left-[250px] blur-3xl"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full bg-blue-600/5 top-1/2 -right-[300px] blur-3xl"></div>
      </div>
      {children}
    </section>
  );
};