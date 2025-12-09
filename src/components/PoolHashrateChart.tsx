import React from 'react';
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
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PoolHashrateChartProps {
  data: number[];
  blockFoundHistory: number[];
}

export const PoolHashrateChart: React.FC<PoolHashrateChartProps> = ({ data, blockFoundHistory }) => {
  // Preload images
  const [imagesLoaded, setImagesLoaded] = React.useState(false);
  const pacmanImgRef = React.useRef<HTMLImageElement | null>(null);
  const xmrBlockImgRef = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    let loaded = 0;
    const pacmanImg = new window.Image(24, 24);
    const xmrBlockImg = new window.Image(20, 20);
    pacmanImg.src = '/qubic-pacman.png';
    xmrBlockImg.src = '/xmr-block.png';
    pacmanImg.onload = () => { loaded++; if (loaded === 2) setImagesLoaded(true); };
    xmrBlockImg.onload = () => { loaded++; if (loaded === 2) setImagesLoaded(true); };
    pacmanImgRef.current = pacmanImg;
    xmrBlockImgRef.current = xmrBlockImg;
  }, []);

  if (!imagesLoaded) return <div style={{height:60}} />; // Don't render until images loaded

  // Show last 5000 points, or all if less
  const displayData = data.slice(-5000);
  const blockData = blockFoundHistory.slice(-5000);
  const labels = displayData.map((_, i) => `${i + 1}`);

  // Identify block found points
  const blockFoundIndices: number[] = [];
  for (let i = 1; i < blockData.length; i++) {
    if (blockData[i] > blockData[i - 1]) {
      blockFoundIndices.push(i);
    }
  }

  // Prepare point styles and radii
  // Use Pacman size 24px and block size 20px for graph markers
  const PACMAN_SIZE = 24;
  const BLOCK_SIZE = 20;

  // Use preloaded images for pointStyle
  const pointStyles = displayData.map((_, i) => {
    if (i === displayData.length - 1 && pacmanImgRef.current) {
      return pacmanImgRef.current;
    } else if (blockFoundIndices.includes(i) && xmrBlockImgRef.current) {
      return xmrBlockImgRef.current;
    }
    return 'circle';
  });
  const pointRadii = displayData.map((_, i) => {
    if (i === displayData.length - 1) return PACMAN_SIZE / 2;
    if (blockFoundIndices.includes(i)) return BLOCK_SIZE / 2;
    return 0;
  });

  return (
    <div className="bg-navy/40 rounded-lg p-4 mb-6">
      <h4 className="text-sm font-bold text-electric/80 mb-2">Pool Hashrate</h4>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'Pool Hashrate',
              data: displayData,
              borderColor: '#4EE0FC',
              backgroundColor: 'rgba(78,224,252,0.2)',
              tension: 0.25,
              pointRadius: pointRadii,
              pointStyle: pointStyles,
              fill: true,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false },
          },
          scales: {
            x: {
              display: false,
            },
            y: {
              ticks: {
                color: '#4EE0FC',
                callback: (tickValue: string | number) => {
                  const value = Number(tickValue);
                  if (value >= 1e9) return (value / 1e9).toFixed(2) + ' GH/s';
                  if (value >= 1e6) return (value / 1e6).toFixed(2) + ' MH/s';
                  if (value >= 1e3) return (value / 1e3).toFixed(2) + ' kH/s';
                  return value + ' H/s';
                },
              },
              grid: { color: 'rgba(78,224,252,0.1)' },
            },
          },
        }}
        height={60}
      />
    </div>
  );
};
