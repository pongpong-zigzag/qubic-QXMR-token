import React, { useState } from 'react';
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

  const handleConnect = () => {
    setIsModalOpen(true);
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
        <ConnectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleConnect}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-all duration-200 ${
          variant === 'outline'
            ? 'border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg hover:shadow-cyan-500/50'
        } ${size === 'sm' ? 'text-sm py-1.5 px-3' : size === 'lg' ? 'text-base py-2.5 px-5' : 'text-sm'}`}
      >
        <Wallet size={16} className="flex-shrink-0" />
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </button>
      <ConnectModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default ConnectWalletButton;
