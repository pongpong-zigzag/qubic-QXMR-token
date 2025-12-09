import React from 'react';
import GameSection from '../components/GameSection';
import { ConnectWalletSection } from '../components/ConnectWalletSection';

const GamePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <GameSection />
      <ConnectWalletSection />
    </div>
  );
};

export default GamePage;

