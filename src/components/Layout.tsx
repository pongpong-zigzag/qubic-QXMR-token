import React, { useEffect, useState } from 'react';
import { Header } from './Header';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-space text-white/80">
      <div className="fixed top-0 left-0 w-full h-full starfield opacity-20 pointer-events-none z-[-1]"></div>
      <div className="fixed top-0 left-0 w-full h-full space-gradient pointer-events-none z-[-2]"></div>
      <Header scrolled={scrolled} />
      <main>{children}</main>
    </div>
  );
};