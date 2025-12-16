import React, { useEffect, useState } from 'react';
import { Wallet, LogOut } from 'lucide-react';
import { useQubicConnect } from './connect/QubicConnectContext';
import ConnectModal from './connect/ConnectModal';

interface ConnectWalletButtonProps {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ 
  variant = 'default', 
  size = 'md' 
}) => {
  const { connected, wallet, toggleConnectModal, showConnectModal, disconnect } = useQubicConnect();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const shouldResume = localStorage.getItem('connectModalOpen') === '1';
      if (shouldResume) {
        setIsModalOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleConnect = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    try {
      localStorage.removeItem('connectModalOpen');
      localStorage.removeItem('connectModalResumeMode');
      localStorage.removeItem('walletConnectPending');
    } catch {
      // ignore
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  if (connected && wallet) {
    return (
      <>
        <button
          onClick={handleDisconnect}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-all duration-200 ${
            variant === 'outline'
              ? 'border border-green-500/50 text-green-400 hover:bg-green-500/10'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-400 hover:to-emerald-500'
          } ${size === 'sm' ? 'text-sm py-1.5 px-2' : size === 'lg' ? 'text-base py-2.5 px-5' : 'text-sm'}`}
        >
          <LogOut size={14} className="flex-shrink-0" />
          <span className="hidden sm:inline">{truncateAddress(wallet.publicKey)}</span>
          <span className="sm:hidden">Connected</span>
        </button>
        <ConnectModal open={isModalOpen} onClose={handleCloseModal} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleConnect}
        className={`w-full h-10 px-6 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-3 ${
          variant === 'outline'
            ? 'border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
            : 'bg-[#7CF8FF] hover:bg-[#9CFCFF] text-slate-900'
        } ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-sm'}`}
      >
        <Wallet size={16} className="flex-shrink-0" />
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </button>
      <ConnectModal open={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default ConnectWalletButton;
