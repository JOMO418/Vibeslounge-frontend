import React, { useState, useEffect } from 'react';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { formatKES } from '../utils/currency'; // adjust path if needed

const ProfitCard = ({ todaysProfit }) => {
  // Load saved visibility preference from localStorage
  const [showProfit, setShowProfit] = useState(
    localStorage.getItem('showProfit') !== 'false'
  );

  // Save preference when toggled
  const toggleProfit = () => {
    const newValue = !showProfit;
    setShowProfit(newValue);
    localStorage.setItem('showProfit', newValue);
  };

  return (
    <div className="flex items-center gap-4">
      <div 
        className="px-8 py-4 rounded-lg relative"
        style={{ 
          background: 'linear-gradient(to right, hsl(45 93% 47% / 0.2), hsl(45 93% 47% / 0.2))',
          border: '2px solid hsl(45 93% 47% / 0.5)'
        }}
      >
        {/* 👁 Toggle button */}
        <button
          onClick={toggleProfit}
          className="absolute top-2 right-2 text-gray-500 hover:text-yellow-500 transition"
          title={showProfit ? "Hide profit" : "Show profit"}
        >
          {showProfit ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <p 
          className="text-xs uppercase tracking-wide mb-1" 
          style={{ color: 'hsl(0 0% 54%)' }}
        >
          TODAY'S PROFIT
        </p>

        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" style={{ color: 'hsl(142 71% 45%)' }} />
          {showProfit ? (
            <p className="text-4xl md:text-5xl font-bold" style={{ color: 'hsl(45 93% 47%)' }}>
              {formatKES(todaysProfit)}
            </p>
          ) : (
            <p className="text-4xl md:text-5xl font-bold text-gray-400">••••••</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitCard;
