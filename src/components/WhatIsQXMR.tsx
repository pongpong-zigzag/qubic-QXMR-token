import React from 'react';
import QxmrCpuImg from '../assets/qxmr-cpu.png';
import { Section } from './Section';
import { CheckCircle } from 'lucide-react';

export const WhatIsQXMR: React.FC = () => {
  return (
    <Section id="token" className="py-24 bg-midnight">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-electric">
                What Is QXMR?
              </h2>
              
              <p className="text-lg text-electricLight mb-8">
                QXMR is the commemorative token minted to celebrate this breakthrough in Epoch 161.
                A symbol of innovation, perseverance, and the pioneering spirit of the Qubic community.
              </p>
              
              <ul className="space-y-6">
                {[
                  {
                    title: "Tokenomics",
                    description: (
                      <>
                        <span className="block mb-2 text-electric">161,000,000,000 total supply</span>
                        <ul className="list-disc ml-6 text-electricLight">
                          <li><b>50%</b> airdropped for Qubicans on June 4th</li>
                          <li><b>16.1%</b> to be burned</li>
                          <li><b>16.1%</b> allocated for liquidity pools</li>
                          <li><b>9%</b> for team</li>
                          <li><b>8.8%</b> for rewards/giveaways</li>
                        </ul>
                      </>
                    )
                  },
                  {
                    title: "Airdrop Details",
                    description: (
                      <>
                        <ul className="list-disc ml-6 text-electricLight">
                          <li><b>35%</b> for Qearn hodlers locked in Epoch 138 - 161</li>
                          <li><b>10%</b> for wallets</li>
                          <li><b>5%</b> for Smart Contract Shareholders</li>
                        </ul>
                      </>
                    )
                  },
                  {
                    title: "Epoch 161 Tribute",
                    description: "Marks the exact moment when Qubic's uPoW stepped on stage and showed the world what Qubic is all about."
                  },
                ].map((item, index) => (
                  <li key={index} className="flex">
                    <CheckCircle className="h-6 w-6 text-electricAccent mr-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-electricDark">{item.title}</h3>
                      <div className="text-electricLight">{item.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              {/* Neon circuit board visual */}
              <div className="flex items-center justify-center aspect-square w-full h-full">
                <div className="relative w-full h-full flex items-center justify-center">
  {/* Soft dark overlay for blending */}
  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-navy/60 via-navy/30 to-transparent blur-sm z-0" />
  {/* Enhanced glow and border for the image */}
  <img
    src={QxmrCpuImg}
    alt="QXMR CPU"
    className="relative z-10 w-full h-full object-contain rounded-2xl shadow-[0_0_60px_20px_rgba(78,224,252,0.40)] border-2 border-cyan-400/40 backdrop-blur-[2px] bg-gradient-to-br from-navy/60 via-navy/10 to-transparent"
    style={{mixBlendMode:'screen'}}
  />
</div>
              </div>

              </div>
            </div>
          </div>
        </div>
      </Section>
  );
};