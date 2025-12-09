import React, { useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';

interface PacmanGameIframeProps {
  isOpen: boolean;
  onClose: () => void;
}

const PacmanGameIframe: React.FC<PacmanGameIframeProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    // Prevent body scrolling when iframe is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 backdrop-blur-sm" style={{ paddingTop: '80px', paddingBottom: '20px' }}>
      {/* Ensure navbar is above with z-index */}
      <div className="w-full h-full flex flex-col items-center justify-center px-4 py-8">
        {/* Back button - top left */}
        <button
          onClick={onClose}
          className="absolute top-20 left-4 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200 shadow-lg font-medium"
          aria-label="Back to site"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute top-20 right-4 z-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 transition-all duration-200 shadow-lg"
          aria-label="Close game"
        >
          <X size={24} />
        </button>

        {/* Game iframe container */}
        <div className="w-full max-w-[1200px] aspect-square max-h-[80vh] bg-black rounded-lg overflow-hidden shadow-2xl border border-cyan-500/30">
          <iframe
            src="/pacman-master/index.html"
            title="Pacman Game"
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-white">
          <p className="text-sm text-gray-300">Use arrow keys to play Pacman!</p>
          <p className="text-xs text-gray-400 mt-1">Click Back or X button or press ESC to close</p>
        </div>
      </div>
    </div>
  );
};

export default PacmanGameIframe;

