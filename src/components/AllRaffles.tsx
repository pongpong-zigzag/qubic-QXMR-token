import { useState, useEffect } from 'react';
import axios from 'axios';
import Raffle from './Raffle';

// Define the type for a single raffle
interface RaffleData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  raffleAddress: string;
  prizeType: string;
  prizeValue: number;
  selectedToken: string;
  entryAmount: number;
  status: string;
  entries: any[]; // You might want to define a more specific type for entries
  selectedQubicAsset?: string;
  actualItemDescription?: string;
}

export default function AllRaffles() {
  const [raffles, setRaffles] = useState<RaffleData[]>([]);

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const response = await axios.get('/.netlify/functions/raffles');
        setRaffles(response.data);
      } catch (error) {
        console.error("Error fetching raffles:", error);
      }
    };

    fetchRaffles();
  }, []);

  return (
    <div className="flex flex-col items-center gap-12 mt-24">
      {/* 2x2 grid for first 4 raffles */}
      <div className="grid grid-cols-2 gap-16 items-start">
        {raffles.slice(0, 4).map(r => (
          <div key={r.id} className="border-2 border-white rounded-6xl overflow-hidden scale-100">
            <Raffle raffle={r} />
          </div>
        ))}
      </div>
      {/* 1 row of 2 raffles */}
      <div className="grid grid-cols-2 gap-16 items-start">
        {raffles.slice(4, 6).map(r => (
          <div key={r.id} className="border-2 border-white rounded-6xl overflow-hidden scale-100">
            <Raffle raffle={r} />
          </div>
        ))}
      </div>
    </div>
  );
}
