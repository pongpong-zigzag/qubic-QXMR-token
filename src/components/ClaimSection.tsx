import React from 'react';
import { Section } from './Section';

export const ClaimSection: React.FC = () => {
  return (
    <Section id="claim" className="py-24 bg-midnight">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">

          
          <div className="mt-24">
            <div className="inline-flex flex-wrap justify-center gap-4 text-electricDark">
              {[
                "#QXMR", 
                "#QUBIC", 
                "#Epoch161", 
                "#QubicXMR",
                "#uPoWProven", 
                "#CrossChainPower", 
                "#ForTheBelieversAndBeyond"
              ].map((tag, index) => (
                <span 
                  key={index} 
                  className="px-4 py-2 bg-navy/60 backdrop-blur-sm border border-electric rounded-full hover:text-electricAccent transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};