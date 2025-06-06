import React, { useEffect, useState } from 'react';

interface PlayerStatsProps {
  onVirtuePointsChange: (virtues: { grace: number; spirit: number; courage: number }) => void;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ onVirtuePointsChange }) => {
  const [masteryRank, setMasteryRank] = useState(0);
  
  // Calculate total available virtue points based on mastery rank
  const totalPoints = 4 + masteryRank;
  
  // Track allocated points for each virtue
  const [virtuePoints, setVirtuePoints] = useState({
    grace: 0,
    spirit: 0,
    courage: 0
  });
  
  // Calculate remaining points
  const usedPoints = virtuePoints.grace + virtuePoints.spirit + virtuePoints.courage;
  const remainingPoints = totalPoints - usedPoints;
  
  // Effect to notify parent component of virtue point changes
  useEffect(() => {
    onVirtuePointsChange(virtuePoints);
  }, [virtuePoints, onVirtuePointsChange]);
  
  // Handle mastery rank change
  const handleMasteryRankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newRank = Math.max(0, Math.min(254, parseInt(e.target.value) || 0));
    
    setMasteryRank(newRank);
    
    // If reducing mastery rank would result in negative remaining points,
    // auto-adjust the virtue allocations
    const newTotal = 4 + newRank;
    if (usedPoints > newTotal) {
      // Simple strategy: reduce highest virtue first
      const sorted = Object.entries(virtuePoints).sort(([,a], [,b]) => b - a);
      const newPoints = {...virtuePoints};
      
      let pointsToRemove = usedPoints - newTotal;
      for (const [virtue, value] of sorted) {
        if (pointsToRemove <= 0) break;
        
        const virtueKey = virtue as keyof typeof virtuePoints;
        const reduction = Math.min(value, pointsToRemove);
        newPoints[virtueKey] -= reduction;
        pointsToRemove -= reduction;
      }
      
      setVirtuePoints(newPoints);
    }
  };

  // Adjust mastery rank using buttons
  const adjustMasteryRank = (amount: number) => {
    let newRank = Math.max(0, Math.min(254, masteryRank + amount));
    
    setMasteryRank(newRank);
    
    // Handle points adjustment if needed
    const newTotal = 4 + newRank;
    if (usedPoints > newTotal && amount < 0) {
      // Simple strategy: reduce highest virtue first
      const sorted = Object.entries(virtuePoints).sort(([,a], [,b]) => b - a);
      const newPoints = {...virtuePoints};
      
      let pointsToRemove = usedPoints - newTotal;
      for (const [virtue, value] of sorted) {
        if (pointsToRemove <= 0) break;
        
        const virtueKey = virtue as keyof typeof virtuePoints;
        const reduction = Math.min(value, pointsToRemove);
        newPoints[virtueKey] -= reduction;
        pointsToRemove -= reduction;
      }
      
      setVirtuePoints(newPoints);
    }
  };
  
  // Handle virtue point adjustment
  const adjustVirtue = (virtue: keyof typeof virtuePoints, amount: number) => {
    if (amount > 0 && remainingPoints <= 0) return; // Can't add if no points left
    if (amount < 0 && virtuePoints[virtue] <= 0) return; // Can't go below 0
    
    setVirtuePoints(prev => ({
      ...prev,
      [virtue]: Math.max(0, prev[virtue] + amount)
    }));
  };
  
  // Get color for virtues
  const getVirtueColor = (virtue: string): string => {
    switch(virtue.toLowerCase()) {
      case 'grace': return 'var(--grace-color)';
      case 'spirit': return 'var(--spirit-color)';
      case 'courage': return 'var(--courage-color)';
      default: return 'var(--text-primary)';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-750 p-4 rounded border border-gray-600">
        <h3 className="text-lg font-medium mb-3 text-yellow-300">Character Stats</h3>
        
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Mastery Rank</label>
          <div className="flex items-center">
            <button 
              onClick={() => adjustMasteryRank(-1)}
              disabled={masteryRank <= 0}
              className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-l border border-gray-600 disabled:opacity-50"
            >
              -
            </button>
            <input
              type="number"
              value={masteryRank}
              onChange={handleMasteryRankChange}
              min="0"
              max="254"
              className="w-12 text-center py-1 border-t border-b border-gray-600 bg-gray-800 text-white"
            />
            <button 
              onClick={() => adjustMasteryRank(1)}
              disabled={masteryRank >= 254}
              className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-r border border-gray-600 disabled:opacity-50"
            >
              +
            </button>
            <div className="ml-4 text-sm text-gray-400">
              Available Virtue Points: <span className="text-yellow-shiny font-medium">{remainingPoints}</span> / {totalPoints}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Mastery rank 0 gives 4 virtue points, each additional rank grants +1 point
          </p>
        </div>
        
        <div className="border-t border-gray-600 pt-4 mt-4">
          <h4 className="text-md font-medium mb-3">Virtue Point Distribution</h4>
          
          {/* Grace */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <img 
                  src="https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/HUD/GraceSunIcon.png"
                  alt="Grace"
                  className="h-5 w-5"
                />
                <span style={{ color: getVirtueColor('grace') }}>Grace</span>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => adjustVirtue('grace', -1)}
                  disabled={virtuePoints.grace <= 0}
                  className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-l border border-gray-600 disabled:opacity-50"
                >
                  -
                </button>
                <div className="px-4 py-1 bg-gray-800 border-t border-b border-gray-600 font-medium">
                  {virtuePoints.grace}
                </div>
                <button 
                  onClick={() => adjustVirtue('grace', 1)}
                  disabled={remainingPoints <= 0}
                  className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-r border border-gray-600 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
            <div className="bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${(virtuePoints.grace / Math.max(1, totalPoints)) * 100}%`,
                  backgroundColor: getVirtueColor('grace')
                }}
              ></div>
            </div>
          </div>
          
          {/* Spirit */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <img 
                  src="https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/HUD/SpiritMoonIcon.png"
                  alt="Spirit"
                  className="h-5 w-5"
                />
                <span style={{ color: getVirtueColor('spirit') }}>Spirit</span>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => adjustVirtue('spirit', -1)}
                  disabled={virtuePoints.spirit <= 0}
                  className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-l border border-gray-600 disabled:opacity-50"
                >
                  -
                </button>
                <div className="px-4 py-1 bg-gray-800 border-t border-b border-gray-600 font-medium">
                  {virtuePoints.spirit}
                </div>
                <button 
                  onClick={() => adjustVirtue('spirit', 1)}
                  disabled={remainingPoints <= 0}
                  className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-r border border-gray-600 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
            <div className="bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${(virtuePoints.spirit / Math.max(1, totalPoints)) * 100}%`,
                  backgroundColor: getVirtueColor('spirit')
                }}
              ></div>
            </div>
          </div>
          
          {/* Courage */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <img 
                  src="https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/HUD/CourageSunIcon.png"
                  alt="Courage"
                  className="h-5 w-5"
                />
                <span style={{ color: getVirtueColor('courage') }}>Courage</span>
              </div>
              <div className="flex items-center">
                <button 
                  onClick={() => adjustVirtue('courage', -1)}
                  disabled={virtuePoints.courage <= 0}
                  className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-l border border-gray-600 disabled:opacity-50"
                >
                  -
                </button>
                <div className="px-4 py-1 bg-gray-800 border-t border-b border-gray-600 font-medium">
                  {virtuePoints.courage}
                </div>
                <button 
                  onClick={() => adjustVirtue('courage', 1)}
                  disabled={remainingPoints <= 0}
                  className="w-6 h-6 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-r border border-gray-600 disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
            <div className="bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${(virtuePoints.courage / Math.max(1, totalPoints)) * 100}%`,
                  backgroundColor: getVirtueColor('courage')
                }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-600">
          <p>These virtue points are added to the bonuses from your equipment.</p>
        </div>
      </div>
      
      {/* Character Benefits Section - Simplified */}
      <div className="bg-gray-750 p-4 rounded border border-gray-600">
        <h3 className="text-lg font-medium mb-3 text-blue-300">About Mastery Rank</h3>
        <div className="text-sm text-gray-300">
          <p className="mb-3">
            In Soulframe, your Mastery Rank provides:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>+1 Virtue point per rank (in addition to 4 base points)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
