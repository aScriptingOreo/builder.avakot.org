import { BuildStats, SelectedItems } from '@types/build';
import { resolveDisplayName } from '@utils/api';
import React, { useEffect, useState } from 'react';

interface StatsDisplayProps {
  selectedItems: SelectedItems;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ selectedItems }) => {
  const [itemDisplayNames, setItemDisplayNames] = useState<Record<string, string>>({});

  // Resolve display names for selected items
  useEffect(() => {
    const resolveNames = async () => {
      const names: Record<string, string> = {};
      
      for (const [slot, item] of Object.entries(selectedItems)) {
        if (item?.LinkusAlias && !itemDisplayNames[item.LinkusAlias]) {
          names[item.LinkusAlias] = await resolveDisplayName(item.LinkusAlias);
        }
      }
      
      if (Object.keys(names).length > 0) {
        setItemDisplayNames(prev => ({ ...prev, ...names }));
      }
    };

    resolveNames();
  }, [selectedItems]);

  const calculateStats = (): BuildStats => {
    let totalPhysicalDefence = 0;
    let totalMagickDefence = 0;
    let totalStabilityIncrease = 0;
    let totalBonusHP = 0;
    const virtueBonus = { Grace: 0, Spirit: 0, Courage: 0 };

    // Calculate armor stats
    ['helm', 'upperBody', 'lowerBody', 'totem'].forEach(slot => {
      const item = selectedItems[slot as keyof SelectedItems];
      if (item?.Stats) {
        totalPhysicalDefence += parseInt(item.Stats.PhysicalDefence || 0);
        totalMagickDefence += parseInt(item.Stats.MagickDefence || 0);
        totalStabilityIncrease += parseInt(item.Stats.StabilityIncrease || 0);
        
        // Handle totem virtue bonuses
        if (item.Stats.Virtue) {
          const virtueType = item.Stats.Virtue.Type;
          const virtueValue = parseInt(item.Stats.Virtue.Value || 0);
          if (virtueType === 'All Virtues') {
            virtueBonus.Grace += virtueValue;
            virtueBonus.Spirit += virtueValue;
            virtueBonus.Courage += virtueValue;
          } else if (virtueBonus[virtueType as keyof typeof virtueBonus] !== undefined) {
            virtueBonus[virtueType as keyof typeof virtueBonus] += virtueValue;
          }
        }
      }
    });

    // Calculate pact stats
    if (selectedItems.pact?.Stats) {
      const pactStats = selectedItems.pact.Stats;
      totalBonusHP += parseInt(pactStats.BonusHP || 0);
      totalPhysicalDefence += parseInt(pactStats.PhysicalDefence || 0);
      totalMagickDefence += parseInt(pactStats.MagickDefence || 0);
      totalStabilityIncrease += parseInt(pactStats.StabilityIncrease || 0);
      
      if (pactStats.BonusVirtue) {
        const virtueType = pactStats.BonusVirtue.Type;
        const virtueValue = parseInt(pactStats.BonusVirtue.Value || 0);
        if (virtueBonus[virtueType as keyof typeof virtueBonus] !== undefined) {
          virtueBonus[virtueType as keyof typeof virtueBonus] += virtueValue;
        }
      }
    }

    return {
      totalPhysicalDefence,
      totalMagickDefence,
      totalStabilityIncrease,
      totalBonusHP,
      virtueBonus,
      weaponStats: {
        primary: selectedItems.primary,
        sidearm: selectedItems.sidearm
      }
    };
  };

  const stats = calculateStats();

  const getItemDisplayName = (item: any) => {
    return itemDisplayNames[item?.LinkusAlias] || item?.LinkusAlias || 'None';
  };

  return (
    <div className="space-y-6">
      {/* Defense Stats */}
      <div className="bg-gray-750 p-4 rounded border border-gray-600">
        <h3 className="text-lg font-medium mb-3 text-blue-300">Defense Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Physical Defence</div>
            <div className="text-xl font-bold text-orange-400">{stats.totalPhysicalDefence}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Magick Defence</div>
            <div className="text-xl font-bold text-purple-400">{stats.totalMagickDefence}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Stability Increase</div>
            <div className="text-xl font-bold text-green-400">{stats.totalStabilityIncrease}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Bonus HP</div>
            <div className="text-xl font-bold text-red-400">{stats.totalBonusHP}</div>
          </div>
        </div>
      </div>

      {/* Virtue Bonuses */}
      <div className="bg-gray-750 p-4 rounded border border-gray-600">
        <h3 className="text-lg font-medium mb-3 text-yellow-300">Virtue Bonuses</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-400">Grace</div>
            <div className="text-xl font-bold text-blue-400">+{stats.virtueBonus.Grace}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Spirit</div>
            <div className="text-xl font-bold text-green-400">+{stats.virtueBonus.Spirit}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Courage</div>
            <div className="text-xl font-bold text-red-400">+{stats.virtueBonus.Courage}</div>
          </div>
        </div>
      </div>

      {/* Equipped Items Summary */}
      <div className="bg-gray-750 p-4 rounded border border-gray-600">
        <h3 className="text-lg font-medium mb-3 text-green-300">Equipped Items</h3>
        <div className="space-y-2 text-sm">
          {Object.entries(selectedItems).map(([slot, item]) => (
            <div key={slot} className="flex justify-between">
              <span className="text-gray-400 capitalize">{slot.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span className="text-white">
                {item ? getItemDisplayName(item) : 'None'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;
