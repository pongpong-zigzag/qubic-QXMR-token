import React from 'react';
import { Section } from './Section';

export const HistoricFirst: React.FC = () => {
  return (
    <Section id="history" className="py-24 bg-midnight">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center text-electric">
          A Historic First in Crypto
        </h2>
        
        <div className="max-w-3xl mx-auto text-lg space-y-6 text-center text-electricLight">
          <p>
            In Epoch 161, Qubic didn't just make a move — it made history.
          </p>
          
          <p>
            Qubic reached beyond itself.<br />
            Instead of letting excess power sit idle,<br />
            it unleashed <strong>half</strong> of its surplus to <strong>mine Monero</strong>. 
          </p>
          
          <p className="text-2xl font-medium text-electric py-4">
            But this wasn't just about mining.<br />
            It was about purpose.<br />
            About vision.<br />
            <i>uPoW</i>. <br />
            Proven.
          </p>
          
          <p>
            Epoch 161 wasn't a milestone.<br />
            It was a <strong>monument</strong> to what's possible when power is used with purpose.<br />
            And Qubic led the way.
          </p>
        </div>
        
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-electric/20 via-electricAccent/20 to-cyan/20 rounded-xl blur-lg"></div>
          <div className="relative bg-navy/80 backdrop-blur-sm rounded-xl overflow-hidden border border-electric">
            <div className="grid md:grid-cols-3 divide-x divide-electric/30">
              {[
                {
                  title: "@c___f___b",
                  description: "There is a point at which mining #Monero via #Qubic is more profitable than mining it directly..."
                },
                {
                  title: "@c___f___b",
                  description: "Somebody told it would be impossible to run XMR mining on #Qubic, we decided to verify the claim."
                },
                {
                  title: "@c___f___b",
                  description: "Hey, #Monero community, what pool would you recommend to an operator of 100'000 CPU cores?"
                }
              ].map((item, index) => (
                <div key={index} className="p-8 flex flex-col items-center text-center">
                  <h3 className="text-xl font-bold mb-4 text-electricDark">{item.title}</h3>
                  <p className="text-electricLight">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      

    </Section>
  );
};