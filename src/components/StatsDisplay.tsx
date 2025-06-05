import React, { useEffect, useState } from "react";
import { SelectedItems } from "../types/build";
import { resolveDisplayName } from "../utils/api";
import {
  convertStatsToConsolidated,
  parseMoteEffects,
} from "../utils/statsParser";

interface StatsDisplayProps {
  selectedItems: SelectedItems;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ selectedItems }) => {
  const [itemDisplayNames, setItemDisplayNames] = useState<
    Record<string, string>
  >({});

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
        setItemDisplayNames((prev) => ({ ...prev, ...names }));
      }
    };

    resolveNames();
  }, [selectedItems]);

  // Use the proper stats calculation from statsParser
  const calculateConsolidatedStats = () => {
    const armorItems = [
      selectedItems.helm,
      selectedItems.upperBody,
      selectedItems.lowerBody,
      selectedItems.totem,
    ].filter(Boolean);

    const weaponItems = [selectedItems.primary, selectedItems.sidearm].filter(
      Boolean
    );

    const pactItem = selectedItems.pact;

    // Collect all motes from equipped weapons and pacts
    const motes: any[] = [];

    // Add weapon motes
    weaponItems.forEach((weapon) => {
      if (weapon.Motes && Array.isArray(weapon.Motes)) {
        weapon.Motes.forEach((mote) => {
          if (mote) motes.push(mote);
        });
      }
    });

    // Add pact motes
    if (pactItem?.Motes && Array.isArray(pactItem.Motes)) {
      pactItem.Motes.forEach((mote) => {
        if (mote) motes.push(mote);
      });
    }

    return convertStatsToConsolidated(armorItems, weaponItems, pactItem, motes);
  };

  const stats = calculateConsolidatedStats();

  // Calculate special mote effects that aren't virtue bonuses
  const getSpecialMoteEffects = () => {
    const specialEffects: string[] = [];

    // Check weapon motes
    [selectedItems.primary, selectedItems.sidearm].forEach((weapon) => {
      if (weapon?.Motes) {
        weapon.Motes.forEach((mote) => {
          if (mote?.Effect) {
            const { otherEffects } = parseMoteEffects(mote.Effect);
            specialEffects.push(...otherEffects);
          }
        });
      }
    });

    // Check pact motes
    if (selectedItems.pact?.Motes) {
      selectedItems.pact.Motes.forEach((mote) => {
        if (mote?.Effect) {
          const { otherEffects } = parseMoteEffects(mote.Effect);
          specialEffects.push(...otherEffects);
        }
      });
    }

    return specialEffects;
  };

  const specialEffects = getSpecialMoteEffects();

  const getItemDisplayName = (item: any) => {
    return itemDisplayNames[item?.LinkusAlias] || item?.LinkusAlias || "None";
  };

  return (
    <div className="space-y-6">
      {/* Defense Stats - Always show */}
      <div className="bg-gray-750 p-4 rounded border border-gray-600">
        <h3 className="text-lg font-medium mb-3 text-blue-300">
          Defense Stats
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Physical Defence</div>
            <div className="text-xl font-bold text-orange-400">
              {stats.physicalDefence}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Magick Defence</div>
            <div className="text-xl font-bold text-purple-400">
              {stats.magickDefence}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Stability Increase</div>
            <div className="text-xl font-bold text-green-400">
              {stats.stabilityIncrease}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Bonus HP</div>
            <div className="text-xl font-bold text-red-400">
              {stats.bonusHP}
            </div>
          </div>
        </div>
      </div>

      {/* Weapon Stats - Always show */}
      <div className="bg-gray-750 p-4 rounded border border-gray-600">
        <h3 className="text-lg font-medium mb-3 text-red-300">Combat Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Attack Power</div>
            <div className="text-xl font-bold text-red-400">
              {stats.attackPower}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Charged Attack</div>
            <div className="text-xl font-bold text-yellow-400">
              {stats.chargedAttack}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Stagger</div>
            <div className="text-xl font-bold text-orange-400">
              {stats.stagger}
            </div>
          </div>
        </div>
      </div>

      {/* Virtue Bonuses - Always show */}
      <div className="bg-gray-750 p-4 rounded border border-gray-600">
        <h3 className="text-lg font-medium mb-3 text-yellow-300">
          Virtue Bonuses
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-400">Grace</div>
            <div className="text-xl font-bold text-grace">
              +{stats.graceValue}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Spirit</div>
            <div className="text-xl font-bold text-spirit">
              +{stats.spiritValue}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Courage</div>
            <div className="text-xl font-bold text-courage">
              +{stats.courageValue}
            </div>
          </div>
        </div>
      </div>

      {/* Special Mote Effects - Only show if there are effects */}
      {specialEffects.length > 0 && (
        <div className="bg-gray-750 p-4 rounded border border-gray-600">
          <h3 className="text-lg font-medium mb-3 text-purple-300">
            Special Effects
          </h3>
          <div className="space-y-2">
            {specialEffects.map((effect, index) => (
              <div
                key={index}
                className="text-sm text-purple-200 bg-purple-900 bg-opacity-30 px-3 py-2 rounded"
              >
                {effect}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Build Summary - Always show */}
      <div className="bg-gray-750 p-4 rounded border border-gray-600">
        <h3 className="text-lg font-medium mb-3 text-green-300">
          Build Summary
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-400">Armor Pieces</div>
            <div className="text-xl font-bold text-blue-400">
              {stats.armorPieces}/4
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Weapons</div>
            <div className="text-xl font-bold text-red-400">
              {stats.weaponsEquipped}/2
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Pact</div>
            <div className="text-xl font-bold text-purple-400">
              {stats.hasPact ? "Yes" : "No"}
            </div>
          </div>
        </div>

        {/* Equipped Items List */}
        <div className="space-y-2 text-sm border-t border-gray-600 pt-3">
          {Object.entries(selectedItems).map(([slot, item]) => (
            <div key={slot} className="flex justify-between">
              <span className="text-gray-400 capitalize">
                {slot.replace(/([A-Z])/g, " $1").trim()}:
              </span>
              <span className="text-white">
                {item ? getItemDisplayName(item) : "None"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;
