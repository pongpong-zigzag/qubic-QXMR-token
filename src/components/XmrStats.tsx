import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './XmrStats.module.css';
import './XmrStatsGlobal.css';
import axios from 'axios';
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
  ChartData,
  ChartOptions,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
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

// Format timestamp for display (exported for potential use elsewhere)
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface HistoricalDataPoint {
  timestamp: number;
  pool_hashrate: number;
  network_hashrate: number;
  total_miners: number;
  total_workers: number;
  [key: string]: number; // Allow dynamic properties
}

interface HistoricalData {
  data: HistoricalDataPoint[];
  lastUpdated: number;
  peakHashrate: number;
}

interface XmrStatsData {
  pool_hashrate: number;
  network_hashrate: number;
  last_block_found: string;
  last_block_found_timestamp: number;
  last_block_hash: string;
  total_miners: number;
  connected_miners: number;
  worker_count: number;
  total_workers: number;
  last_block_time: number;
  total_blocks_found: number;
  total_payments: number;
  total_paid: number;
  total_hashes: number;
  
  // Optional stats with proper typing
  [key: string]: any;
  
  // Additional stats that might be used
  total_rounds_hashed?: number;
  total_rounds_shared?: number;
  total_rounds_won?: number;
  total_rounds_lost?: number;
  total_rounds_orphaned?: number;
  total_rounds_uncle?: number;
  total_rounds_uncle_lost?: number;
  total_rounds_uncle_orphaned?: number;
  total_shares?: number;
  total_shares_stale?: number;
  total_shares_invalid?: number;
  total_shares_late?: number;
  total_shares_duplicate?: number;
  total_shares_donated?: number;
  total_shares_self?: number;
  total_shares_others?: number;
  total_shares_blocks?: number;
  total_shares_payments?: number;
  total_shares_paid?: number;
  total_shares_unpaid?: number;
  total_shares_orphaned?: number;
  total_shares_uncle?: number;
  total_shares_uncle_orphaned?: number;
  total_shares_uncle_lost?: number;
  total_shares_uncle_orphaned_lost?: number;
  total_shares_uncle_orphaned_orphaned?: number;
  total_shares_uncle_orphaned_uncle?: number;
  total_shares_uncle_orphaned_uncle_orphaned?: number;
  total_shares_uncle_orphaned_uncle_lost?: number;
  total_shares_uncle_orphaned_uncle_orphaned_lost?: number;
  total_shares_uncle_orphaned_uncle_orphaned_orphaned?: number;
  total_shares_zero_diff_stale?: number;
  total_shares_zero_diff_valid?: number;
  total_shares_zero_diff_invalid?: number;
  total_shares_zero_diff_duplicate?: number;
  total_shares_zero_diff_low_diff?: number;
}


// Format hashrate to human readable format
const formatHashrate = (hashes: number): string => {
  if (isNaN(hashes) || !isFinite(hashes)) return '0 H/s';
  if (hashes < 1000) return `${Math.round(hashes)} H/s`;
  const kilo = hashes / 1000;
  if (kilo < 1000) return `${kilo.toFixed(2)} kH/s`;
  const mega = kilo / 1000;
  if (mega < 1000) return `${mega.toFixed(2)} MH/s`;
  const giga = mega / 1000;
  if (giga < 1000) return `${giga.toFixed(2)} GH/s`;
  const tera = giga / 1000;
  return `${tera.toFixed(2)} TH/s`;
};

// Format time difference to relative time
const formatTimeAgo = (timestamp: number): string => {
  try {
    const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 ? `${interval} ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    return 'just now';
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'unknown time ago';
  }
};

// Load historical data from localStorage
const loadHistoricalData = (): HistoricalData => {
  try {
    const savedData = localStorage.getItem('xmrHistoricalData');
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Failed to load historical data:', error);
  }
  // Initialize with 1.77 GH/s as the peak hashrate (1,770,000,000 H/s)
  return { data: [], lastUpdated: 0, peakHashrate: 1770000000 };
};

// Save historical data to localStorage
const saveHistoricalData = (data: HistoricalData): void => {
  try {
    localStorage.setItem('xmrHistoricalData', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save historical data:', error);
  }
};

// Add a new data point to historical data
const addHistoricalDataPoint = (currentData: HistoricalData, stats: XmrStatsData): HistoricalData => {
  const now = Date.now();
  const newDataPoint: HistoricalDataPoint = {
    timestamp: now,
    pool_hashrate: stats.pool_hashrate,
    network_hashrate: stats.network_hashrate,
    total_miners: stats.total_miners,
    total_workers: stats.total_workers,
  };

  return {
    data: [...currentData.data, newDataPoint],
    lastUpdated: now,
    peakHashrate: Math.max(currentData.peakHashrate, stats.pool_hashrate),
  };
};

const XmrStats: React.FC<{ className?: string }> = ({ className }) => {
  // State management
  // Track which tab is active
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<XmrStatsData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [historicalData, setHistoricalData] = useState<HistoricalData>(() => loadHistoricalData());

  // Load saved data on component mount
  useEffect(() => {
    const savedData = loadHistoricalData();
    setHistoricalData(savedData);
    setLastUpdated(savedData.lastUpdated);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get('/.netlify/functions/proxy-xmr-stats');
      const data = response.data as XmrStatsData;
      console.log('[XmrStats] Fetched mining stats:', data);

      setStats(data);
      setLastUpdated(Date.now());

      setHistoricalData(prevData => {
        const newData = addHistoricalDataPoint(prevData, data);
        saveHistoricalData(newData);
        return newData;
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching XMR stats:', err);
      setError('Failed to fetch stats. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [fetchStats]); // Add fetchStats as a dependency

  // Chart data and options
  const chartData = useMemo<ChartData<'line', number[], string>>(() => {
    // If no historical data, return empty chart data
    if (!historicalData || !historicalData.data.length) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Pool Hashrate (H/s)',
            data: [],
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            yAxisID: 'y',
            tension: 0.1
          },
          {
            label: 'Network Hashrate (H/s)',
            data: [],
            borderColor: 'rgb(236, 72, 153)',
            backgroundColor: 'rgba(236, 72, 153, 0.5)',
            yAxisID: 'y1',
            tension: 0.1
          }
        ]
      };
    }

    const labels = historicalData.data.map(d => new Date(d.timestamp).toISOString());
    
    return {
      labels,
      datasets: [
        {
          label: 'Pool Hashrate (H/s)',
          data: historicalData.data.map(d => d.pool_hashrate),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          yAxisID: 'y',
          tension: 0.1
        },
        {
          label: 'Network Hashrate (H/s)',
          data: historicalData.data.map(d => d.network_hashrate),
          borderColor: 'rgb(236, 72, 153)',
          backgroundColor: 'rgba(236, 72, 153, 0.5)',
          yAxisID: 'y1',
          tension: 0.1
        }
      ]
    };
  }, [historicalData]);

  const chartOptions: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: 'Mining Statistics History',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatHashrate(context.parsed.y);
            }
            return label;
          },
          title: function(context: any[]) {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          tooltipFormat: 'MMM d, yyyy HH:mm',
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM d',
            week: 'MMM d',
            month: 'MMM yyyy',
          },
        },
        title: {
          display: true,
          text: 'Time'
        },
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 35
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Pool Hashrate (H/s)'
        },
        grid: {
          drawOnChartArea: false
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Network Hashrate (H/s)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }), []);

  // Render the stats cards with proper null checks
  const renderStatsCards = useCallback(() => {
    if (!stats) {
      return (
        <div className="col-span-full text-center py-8">
          <div className="animate-pulse">Loading stats...</div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {/* Removed StatCard components */}
      </div>
    );
  }, [stats]);

  // Render the hashrate chart with proper error handling
  const renderRecentHashrateChart = useCallback(() => {
    if (!chartData || !chartData.labels?.length) {
      return (
        <div className="mt-4 p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          No historical data available yet. Data will appear after the first successful update.
        </div>
      );
    }
    
    return (
      <div className="mt-4">
        <div className="bg-white rounded-lg shadow p-4">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    );
  }, [chartData, chartOptions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="mb-6 text-2xl text-center text-electricDark font-bold flex flex-col items-center gap-2">
  <span>
    Mining stats provided by Codedonqubic
    <a
      href="https://www.codedonqubic.com/analytics/compute"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block ml-3 px-3 py-1 rounded-lg border border-electricDark bg-navy/70 text-electricAccent text-base font-semibold shadow hover:bg-electricAccent hover:text-navy transition-colors duration-150"
      style={{ verticalAlign: 'middle' }}
    >
      ↗️
    </a>
  </span>
</div>
      </div>

      {/* Tab Content */}
      <div className="pt-2">
  {error && (
    <div className="text-red-600 bg-red-100 border border-red-300 rounded p-4 mb-4">
      <strong>Error loading mining stats:</strong> {error}
    </div>
  )}
  {/* Embed external Qubic Analytics iframe below stats/cards */}
  <div className="mt-8">
    <iframe
      src="https://www.codedonqubic.com/analytics/compute"
      title="Qubic Analytics Compute"
      className={`w-full rounded-xl border border-gray-200 shadow ${styles['hide-scrollbar']}`}
      style={{ height: 800, background: 'white', scrollbarWidth: 'none' }}
      allowFullScreen
    />
  </div>
</div>
    </div> 
  );
}

export default XmrStats;
