import React from 'react';
import { DollarSign, Twitter, Github, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-electric py-12 bg-navy/90">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-6 md:mb-0">
            <DollarSign className="h-5 w-5 text-electricAccent" />
            <span className="font-bold text-lg text-electric">QXMR</span>
            <span className="text-sm text-electricLight ml-2">
              This Is Crypto History — Written in Real Compute
            </span>
          </div>
          
          <div className="flex gap-6">
            <a href="https://x.com/_qxmr_token_" className="text-gray-400 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="https://qubic.org" className="text-electricLight hover:text-electricAccent transition-colors flex items-center gap-1">
              <span>Qubic.org</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-electric/30 text-center text-electricDark text-sm">
          <p>© 2025 QXMR. All rights reserved.</p>
          <p className="mt-2">
            QXMR is a commemorative token celebrating Epoch 161. 
            Not affiliated with or endorsed by Monero.
          </p>
        </div>
      </div>
    </footer>
  );
};