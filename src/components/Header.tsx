import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { Menu, X } from 'lucide-react';
import ConnectWalletButton from './ConnectWalletButton';

type HeaderProps = {
  scrolled: boolean;
};

export const Header: React.FC<HeaderProps> = ({ scrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Only show scroll links on home page
  const isHomePage = location.pathname === '/';

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('header')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);


  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/20 backdrop-blur-sm py-3 shadow-lg border-b border-electricAccent/20'
          : 'bg-transparent backdrop-blur-sm py-5 border-b border-electricAccent/20'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center gap-4">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="font-bold text-2xl bg-gradient-to-r from-electric via-electricAccent to-cyan bg-clip-text text-transparent"
            onClick={closeMobileMenu}
          >
            QXMR
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8">
            {isHomePage ? (
              <>
                <ScrollLink
                  key="history-link"
                  to="history"
                  smooth={true}
                  duration={500}
                  offset={-80}
                  className="hover:text-electricAccent transition-colors cursor-pointer"
                  activeClass="text-electricAccent"
                  spy={true}
                  hashSpy={false}
                >
                  History
                </ScrollLink>
                <ScrollLink
                  key="token-link"
                  to="token"
                  smooth={true}
                  duration={500}
                  offset={-80}
                  className="hover:text-electricAccent transition-colors cursor-pointer"
                  activeClass="text-electricAccent"
                  spy={true}
                  hashSpy={false}
                >
                  Token
                </ScrollLink>
              </>
            ) : (
              <>
                <Link to="/" className="hover:text-electricAccent transition-colors">
                  Home
                </Link>
              </>
            )}

            <button
              onClick={() => navigate('/game')}
              className="hover:text-electricAccent transition-colors bg-transparent border-none cursor-pointer text-inherit"
            >
              P2E Game
            </button>

            <Link to="/power-players" className="hover:text-electricAccent transition-colors">
              Power Players
            </Link>
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-electricAccent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Wallet Button */}
          <div className="hidden md:block">
            <ConnectWalletButton variant="default" size="md" />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-electric/20 shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {isHomePage ? (
              <>
                <ScrollLink
                  key="mobile-history-link"
                  to="history"
                  smooth={true}
                  duration={500}
                  offset={-80}
                  className="hover:text-electricAccent transition-colors cursor-pointer py-2"
                  activeClass="text-electricAccent"
                  spy={true}
                  hashSpy={false}
                  onClick={closeMobileMenu}
                >
                  History
                </ScrollLink>
                <ScrollLink
                  key="mobile-token-link"
                  to="token"
                  smooth={true}
                  duration={500}
                  offset={-80}
                  className="hover:text-electricAccent transition-colors cursor-pointer py-2"
                  activeClass="text-electricAccent"
                  spy={true}
                  hashSpy={false}
                  onClick={closeMobileMenu}
                >
                  Token
                </ScrollLink>
              </>
            ) : (
              <Link 
                to="/" 
                className="hover:text-electricAccent transition-colors py-2"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
            )}

            <button
              onClick={() => {
                closeMobileMenu();
                navigate('/game');
              }}
              className="hover:text-electricAccent transition-colors py-2 text-left bg-transparent border-none cursor-pointer text-inherit w-full"
            >
              P2E Game
            </button>

            <Link 
              to="/power-players" 
              className="hover:text-electricAccent transition-colors py-2"
              onClick={closeMobileMenu}
            >
              Power Players
            </Link>

            {/* Mobile Wallet Button */}
            <div className="pt-2 border border-electricAccent/20">
              <ConnectWalletButton variant="default" size="md" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};