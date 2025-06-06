import React from 'react';

interface PlayerStatsProps {
  masteryRank: number;
  virtuePoints: { grace: number; spirit: number; courage: number };
  onVirtuePointsChange: (virtues: { grace: number; spirit: number; courage: number }) => void;
  onMasteryRankChange: (rank: number) => void;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ masteryRank, virtuePoints, onVirtuePointsChange, onMasteryRankChange }) => {
  // Calculate total available virtue points based on mastery rank
  const totalPoints = 4 + masteryRank;
  // Calculate used and remaining points
  const usedPoints = virtuePoints.grace + virtuePoints.spirit + virtuePoints.courage;
  const remainingPoints = totalPoints - usedPoints;

  // Effect to notify parent component of virtue point changes
  React.useEffect(() => {
    onVirtuePointsChange(virtuePoints);
  }, [virtuePoints, onVirtuePointsChange]);
  
  // Handle mastery rank change
  const handleMasteryRankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newRank = Math.max(0, Math.min(254, parseInt(e.target.value) || 0));
    onMasteryRankChange(newRank);
    // If reducing mastery rank would result in negative remaining points, auto-adjust virtues
    const newTotal = 4 + newRank;
    if (usedPoints > newTotal) {
      const sorted = Object.entries(virtuePoints).sort(([,a], [,b]) => b - a);
      const newPoints = { ...virtuePoints };
      let pointsToRemove = usedPoints - newTotal;
      for (const [virtue, value] of sorted) {
        if (pointsToRemove <= 0) break;
        const virtueKey = virtue as keyof typeof virtuePoints;
        const reduction = Math.min(value, pointsToRemove);
        newPoints[virtueKey] -= reduction;
        pointsToRemove -= reduction;
      }
      onVirtuePointsChange(newPoints);
    }
  };

  // Adjust mastery rank using buttons
  const adjustMasteryRank = (amount: number) => {
    let newRank = Math.max(0, Math.min(254, masteryRank + amount));
    onMasteryRankChange(newRank);
    const newTotal = 4 + newRank;
    if (usedPoints > newTotal && amount < 0) {
      const sorted = Object.entries(virtuePoints).sort(([,a], [,b]) => b - a);
      const newPoints = { ...virtuePoints };
      let pointsToRemove = usedPoints - newTotal;
      for (const [virtue, value] of sorted) {
        if (pointsToRemove <= 0) break;
        const virtueKey = virtue as keyof typeof virtuePoints;
        const reduction = Math.min(value, pointsToRemove);
        newPoints[virtueKey] -= reduction;
        pointsToRemove -= reduction;
      }
      onVirtuePointsChange(newPoints);
    }
  };

  // Handle virtue point adjustment
  const adjustVirtue = (virtue: keyof typeof virtuePoints, amount: number) => {
    if (amount > 0 && remainingPoints <= 0) return;
    if (amount < 0 && virtuePoints[virtue] <= 0) return;
    onVirtuePointsChange({
      ...virtuePoints,
      [virtue]: Math.max(0, virtuePoints[virtue] + amount)
    });
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
                <input
                  type="number"
                  min="0"
                  max={totalPoints - (usedPoints - virtuePoints.grace)}
                  value={virtuePoints.grace}
                  onChange={e => {
                    let val = parseInt(e.target.value) || 0;
                    val = Math.max(0, Math.min(val, totalPoints - (usedPoints - virtuePoints.grace)));
                    // Clamp so total does not exceed available points
                    const newVirtues = { ...virtuePoints, grace: val };
                    const sum = newVirtues.grace + newVirtues.spirit + newVirtues.courage;
                    if (sum > totalPoints) {
                      // Reduce other virtues in order: spirit, courage
                      let overflow = sum - totalPoints;
                      if (newVirtues.spirit > 0) {
                        const reduce = Math.min(newVirtues.spirit, overflow);
                        newVirtues.spirit -= reduce;
                        overflow -= reduce;
                      }
                      if (overflow > 0 && newVirtues.courage > 0) {
                        const reduce = Math.min(newVirtues.courage, overflow);
                        newVirtues.courage -= reduce;
                        overflow -= reduce;
                      }
                    }
                    onVirtuePointsChange(newVirtues);
                  }}
                  className="w-12 text-center py-1 border-t border-b border-gray-600 bg-gray-800 text-white"
                />
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
                <input
                  type="number"
                  min="0"
                  max={totalPoints - (usedPoints - virtuePoints.spirit)}
                  value={virtuePoints.spirit}
                  onChange={e => {
                    let val = parseInt(e.target.value) || 0;
                    val = Math.max(0, Math.min(val, totalPoints - (usedPoints - virtuePoints.spirit)));
                    const newVirtues = { ...virtuePoints, spirit: val };
                    const sum = newVirtues.grace + newVirtues.spirit + newVirtues.courage;
                    if (sum > totalPoints) {
                      // Reduce other virtues in order: grace, courage
                      let overflow = sum - totalPoints;
                      if (newVirtues.grace > 0) {
                        const reduce = Math.min(newVirtues.grace, overflow);
                        newVirtues.grace -= reduce;
                        overflow -= reduce;
                      }
                      if (overflow > 0 && newVirtues.courage > 0) {
                        const reduce = Math.min(newVirtues.courage, overflow);
                        newVirtues.courage -= reduce;
                        overflow -= reduce;
                      }
                    }
                    onVirtuePointsChange(newVirtues);
                  }}
                  className="w-12 text-center py-1 border-t border-b border-gray-600 bg-gray-800 text-white"
                />
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
                <input
                  type="number"
                  min="0"
                  max={totalPoints - (usedPoints - virtuePoints.courage)}
                  value={virtuePoints.courage}
                  onChange={e => {
                    let val = parseInt(e.target.value) || 0;
                    val = Math.max(0, Math.min(val, totalPoints - (usedPoints - virtuePoints.courage)));
                    const newVirtues = { ...virtuePoints, courage: val };
                    const sum = newVirtues.grace + newVirtues.spirit + newVirtues.courage;
                    if (sum > totalPoints) {
                      // Reduce other virtues in order: grace, spirit
                      let overflow = sum - totalPoints;
                      if (newVirtues.grace > 0) {
                        const reduce = Math.min(newVirtues.grace, overflow);
                        newVirtues.grace -= reduce;
                        overflow -= reduce;
                      }
                      if (overflow > 0 && newVirtues.spirit > 0) {
                        const reduce = Math.min(newVirtues.spirit, overflow);
                        newVirtues.spirit -= reduce;
                        overflow -= reduce;
                      }
                    }
                    onVirtuePointsChange(newVirtues);
                  }}
                  className="w-12 text-center py-1 border-t border-b border-gray-600 bg-gray-800 text-white"
                />
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
