import React from 'react';
import { Section } from './Section';

export const Monument: React.FC = () => {
  return (
    <Section className="min-h-screen flex items-center justify-center py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center text-electric">
            QXMR Is More Than a Token —<br />
            <span className="bg-gradient-to-r from-electric via-electricAccent to-cyan text-transparent bg-clip-text">
              It&apos;s a Monument
            </span>
          </h2>
          <div className="mt-8 space-y-6 text-lg text-electricLight text-center max-w-3xl mx-auto">
            <div className="space-y-4">
              <p className="text-xl font-medium">
                This isn't something you flip.<br />
                It's not something you trade away.
              </p>
              
              <p className="text-xl font-medium">
                This is something you hold.<br />
                You remember. You honor.
              </p>
              
              <p>
                Because you were there —<br />
                When excess power became purposeful.<br />
                When Qubic made history mining Monero.<br />
                When Epoch 161 marked a shift in what's possible.
              </p>
              
              <div className="my-6">
                <p className="text-2xl font-bold text-electric mb-4">
                  QXMR isn't just a token.
                </p>
                <p className="text-xl">
                  It's a badge of belief.<br />
                  A relic of revolution.<br />
                  A monument to the moment.
                </p>
              </div>
              
              <p className="text-xl font-medium">
                You don't sell a monument.<br />
                You cherish it.
              </p>

              <div className="text-2xl font-medium text-electric text-center py-4">
                <p className="mb-2">Because now it's undeniable.</p>
                <p className="mb-2">uPoW is Proven.</p>
                <p className="mb-4">QXMR</p>
                <div className="flex flex-col items-center my-8">
                  <img src="/assets/qxmr-meme-icon.png" alt="QXMR Meme Icon" className="h-18 w-18 md:h-24 md:w-24 object-contain" />
                  <div className="text-5xl md:text-7xl font-bold text-electric">ױ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};