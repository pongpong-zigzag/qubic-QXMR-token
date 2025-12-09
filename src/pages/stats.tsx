import React from 'react';
import MiningStatsCharts from '../components/MiningStatsCharts';

const StatsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-navy/80 py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-center text-electric mb-8">QXMR Historical Mining Stats</h1>
        <MiningStatsCharts />
      </div>
    </div>
  );
};

export default StatsPage;
