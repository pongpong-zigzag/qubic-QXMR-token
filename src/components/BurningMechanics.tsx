import React from 'react';
import { Section } from './Section';
import MiningStatsCharts from './MiningStatsCharts';

export const BurningMechanics: React.FC = () => {
  return (
    <Section className="py-16 bg-navy/50">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-electric mb-4">Mining stats from Codedonqubic</h3>
          <iframe
            src="https://xmr-stats.qubic.org/embed"
            title="XMR Mining Stats"
            width="100%"
            height="600"
            frameBorder="0"
            style={{ borderRadius: '16px', background: '#101b2a', boxShadow: '0 4px 24px #0006' }}
            allowFullScreen
          ></iframe>
        </div>
        <div>
          {/* Burning Mechanics */}
          <div className="bg-gradient-to-br from-navy/80 to-navy/60 backdrop-blur-sm border border-electric/30 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-electric mb-6">Burn Mechanics</h3>
            <div className="space-y-4">
              <p className="text-electricLight">
                QXMR implements a dynamic burn mechanism that triggers at key network milestones:
              </p>
              <ul className="space-y-3">
                {[
                  { threshold: '100 Mh/s ✅', burn: '1% 🔥' },
                  { threshold: '200 Mh/s ✅', burn: '1% 🔥' },
                  { threshold: '300 Mh/s ✅', burn: '1% 🔥' },
                  { threshold: '400 Mh/s ✅', burn: '1% 🔥' },
                  { threshold: '500 Mh/s ✅', burn: '3% 🔥🔥🔥' },
                  { threshold: '600 Mh/s ✅', burn: '1% 🔥' },
                  { threshold: '600 Mh/s ✅', burn: '1% 🔥' },
                  { threshold: '700 Mh/s ✅', burn: '1% 🔥' },
                  { threshold: '800 Mh/s ✅', burn: '1% 🔥' },
                  { threshold: '900 Mh/s ✅', burn: '1% 🔥' },
                  { threshold: '1 Gh/s ✅', burn: '5% 🔥🔥🔥🔥🔥' },
                  { threshold: '1.5 Gh/s ✅', burn: '1% 🔥' },
                  { threshold: '2 Gh/s ', burn: '1% 🔥' },
                  { threshold: '(51%) Gh/s ', burn: '1.9% 🔥' },
                ].map((item, index) => (
                  <li key={index} className="flex justify-between items-center py-2 border-b border-electric/10">
                    <span className="text-electricLight">{item.threshold}</span>
                    <span className="text-electric font-mono font-medium">{item.burn}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          
        </div>
      </div>
    </Section>
  );
};
