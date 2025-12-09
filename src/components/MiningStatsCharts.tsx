import React, { useEffect, useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface XmrStatsHistoryPoint {
  timestamp: number;
  pool_hashrate: number;
  network_hashrate: number;
  blocks: number;
}

const API_URL = 'https://explorer.jetskipool.ai/api/xmr-stats.json';

const formatHashrate = (hashrate: number): string => {
  if (hashrate >= 1e9) return (hashrate / 1e9).toFixed(2) + ' GH/s';
  if (hashrate >= 1e6) return (hashrate / 1e6).toFixed(2) + ' MH/s';
  if (hashrate >= 1e3) return (hashrate / 1e3).toFixed(2) + ' kH/s';
  return hashrate + ' H/s';
};

const timeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = Math.floor((now - timestamp * 1000) / 1000);
  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const MiningStatsCharts: React.FC = () => {
  const [history, setHistory] = useState<XmrStatsHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(API_URL);
        if (Array.isArray(res.data.history)) {
          setHistory(res.data.history);
        } else {
          setError('Unexpected data format');
        }
      } catch (err: any) {
        setError('Failed to fetch mining stats');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Data prep
  const labels = useMemo(() => history.map((point) => point.timestamp * 1000), [history]);
  const hashrateData = useMemo(() => history.map((point) => point.pool_hashrate), [history]);

  // ATH and current
  const ath = useMemo(() => {
    let max = 0;
    let idx = 0;
    history.forEach((pt, i) => {
      if (pt.pool_hashrate > max) {
        max = pt.pool_hashrate;
        idx = i;
      }
    });
    return { value: max, index: idx };
  }, [history]);

  const athTime = history[ath.index]?.timestamp || 0;
  const latest = history[history.length - 1];

  // Chart data
  const chartData = {
    labels,
    datasets: [
      {
        label: '',
        data: hashrateData,
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.15)',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.25,
        fill: false,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#222',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        callbacks: {
          label: (ctx: any) => ` ${formatHashrate(ctx.parsed.y)}`,
        },
      },
      annotation: {
        annotations: {},
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        grid: { display: false },
        ticks: {
          color: '#fff',
          font: { family: 'monospace', size: 14 },
          callback: function(_tickValue: any, idx: number) {
            // Show only some ticks for clarity
            if (labels.length > 10 && idx % Math.ceil(labels.length / 10) !== 0) return '';
            const ts = labels[idx];
            if (!ts) return '';
            const date = new Date(ts);
            return date.getUTCDate();
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#444', borderDash: [4, 4] },
        ticks: {
          color: '#fff',
          font: { family: 'monospace', size: 14 },
          callback: function(tickValue: string | number) {
            if (typeof tickValue !== 'number') return '';
            if (tickValue >= 1e9) return (tickValue / 1e9).toFixed(1) + ' GH/s';
            if (tickValue >= 1e6) return (tickValue / 1e6).toFixed(1) + ' MH/s';
            if (tickValue >= 1e3) return (tickValue / 1e3).toFixed(1) + ' kH/s';
            return tickValue + ' H/s';
          },
        },
      },
    },
    elements: {
      point: {
        radius: 4,
        backgroundColor: '#fff',
      },
      line: {
        borderColor: '#fff',
        borderWidth: 2,
      },
    },
    layout: {
      padding: 16,
    },
  };

  return (
    <div
      className="w-full max-w-xl mx-auto p-6 bg-[#101114] border border-[#333] rounded-2xl"
      style={{ fontFamily: 'monospace', color: '#fff', boxShadow: '0 2px 12px #0004' }}
    >
      <div className="flex flex-col gap-2 mb-6">
        <div className="text-lg font-bold tracking-wide text-white/90">Monero Mining Hashrate</div>
        <div className="text-3xl md:text-4xl font-extrabold mt-2 mb-2" style={{fontFamily:'monospace'}}>AGI Training</div>
        <div className="flex items-end gap-6 mt-2">
          <div>
            <div className="text-4xl md:text-5xl font-extrabold leading-tight" style={{fontFamily:'monospace'}}>
              {ath.value ? formatHashrate(ath.value) : '--'}
            </div>
            <div className="text-base text-white/70 mt-1" style={{fontFamily:'monospace'}}>
              ATH • {athTime ? timeAgo(athTime) : '--'}
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold leading-tight" style={{fontFamily:'monospace'}}>
              {latest ? formatHashrate(latest.network_hashrate) : '0 H/s'}
            </div>
            <div className="text-base text-white/70 mt-1" style={{fontFamily:'monospace'}}>
              Monero Network Hashrate
            </div>
          </div>
        </div>
      </div>
      <div className="w-full" style={{minHeight:220}}>
        {loading ? (
          <div className="text-center text-white/60 py-12">Loading…</div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">{error}</div>
        ) : (
          <Line data={chartData} options={chartOptions} height={80} />
        )}
      </div>
    </div>
  );
};

export default MiningStatsCharts;
