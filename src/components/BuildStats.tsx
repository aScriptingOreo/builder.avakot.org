import React from "react";
import { BuildStats as BuildStatsType, SelectedItems } from "../types/build";

interface BuildStatsProps {
  selectedItems: SelectedItems;
}

const BuildStats: React.FC<BuildStatsProps> = ({ selectedItems }) => {
  // Calculate stats from selected items
  const calculateStats = (): BuildStatsType => {
    const stats: BuildStatsType = {
      totalPhysicalDefence: 0,
      totalMagickDefence: 0,
      totalStabilityIncrease: 0,
      virtueBonus: {
        Order: 0,
        Grace: 0,
        Spirit: 0,
        Courage: 0,
      },
      bonusHP: 0,
    };

    // Calculate armor stats
    Object.values(selectedItems).forEach((item) => {
      if (!item) return;

      // Armor stats
      if (item.Stats) {
        if (item.Stats.PhysicalDefence) {
          stats.totalPhysicalDefence +=
            parseFloat(item.Stats.PhysicalDefence) || 0;
        }
        if (item.Stats.MagickDefence) {
          stats.totalMagickDefence += parseFloat(item.Stats.MagickDefence) || 0;
        }
        if (item.Stats.StabilityIncrease) {
          stats.totalStabilityIncrease +=
            parseFloat(item.Stats.StabilityIncrease) || 0;
        }
        if (item.Stats.BonusHP) {
          stats.bonusHP += parseFloat(item.Stats.BonusHP) || 0;
        }

        // Virtue bonuses (from totems and pacts)
        if (
          item.Stats.Virtue &&
          item.Stats.Virtue.Type &&
          item.Stats.Virtue.Value
        ) {
          const virtueType = item.Stats.Virtue
            .Type as keyof typeof stats.virtueBonus;
          if (virtueType in stats.virtueBonus) {
            stats.virtueBonus[virtueType] +=
              parseFloat(item.Stats.Virtue.Value) || 0;
          }
        }

        // Pact virtue bonuses
        if (
          item.Stats.BonusVirtue &&
          item.Stats.BonusVirtue.Type &&
          item.Stats.BonusVirtue.Value
        ) {
          const virtueType = item.Stats.BonusVirtue
            .Type as keyof typeof stats.virtueBonus;
          if (virtueType in stats.virtueBonus) {
            stats.virtueBonus[virtueType] +=
              parseFloat(item.Stats.BonusVirtue.Value) || 0;
          }
        }
      }
    });

    return stats;
  };

  const stats = calculateStats();

  return (
    <div className="space-y-4">
      {/* Defense Stats */}
      <div
        style={{
          backgroundColor: "var(--bg-dark)",
          border: "1px solid var(--accent-subtle)",
          borderRadius: "6px",
          padding: "1rem",
        }}
      >
        <h4 className="font-semibold mb-3 text-spirit text-shadow-heavy">
          Defense
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-shadow">
            <span>Physical Defence:</span>
            <span className="text-yellow-shiny font-medium">
              {stats.totalPhysicalDefence.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-shadow">
            <span>Magick Defence:</span>
            <span className="text-yellow-shiny font-medium">
              {stats.totalMagickDefence.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between text-shadow">
            <span>Stability Increase:</span>
            <span className="text-yellow-shiny font-medium">
              {stats.totalStabilityIncrease.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Health Stats */}
      <div
        style={{
          backgroundColor: "var(--bg-dark)",
          border: "1px solid var(--accent-subtle)",
          borderRadius: "6px",
          padding: "1rem",
        }}
      >
        <h4 className="font-semibold mb-3 text-courage text-shadow-heavy">
          Health
        </h4>
        <div className="flex justify-between text-shadow">
          <span>Bonus HP:</span>
          <span className="text-yellow-shiny font-medium">
            {stats.bonusHP.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Virtue Bonuses */}
      <div
        style={{
          backgroundColor: "var(--bg-dark)",
          border: "1px solid var(--accent-subtle)",
          borderRadius: "6px",
          padding: "1rem",
        }}
      >
        <h4 className="font-semibold mb-3 text-grace text-shadow-heavy">
          Virtue Bonuses
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-shadow">
            <span className="text-grace">Grace:</span>
            <span className="text-yellow-shiny font-medium">
              +{stats.virtueBonus.Grace.toFixed(0)}
            </span>
          </div>
          <div className="flex justify-between text-shadow">
            <span className="text-spirit">Spirit:</span>
            <span className="text-yellow-shiny font-medium">
              +{stats.virtueBonus.Spirit.toFixed(0)}
            </span>
          </div>
          <div className="flex justify-between text-shadow">
            <span className="text-courage">Courage:</span>
            <span className="text-yellow-shiny font-medium">
              +{stats.virtueBonus.Courage.toFixed(0)}
            </span>
          </div>
          <div className="flex justify-between text-shadow">
            <span>Order:</span>
            <span className="text-yellow-shiny font-medium">
              +{stats.virtueBonus.Order.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Equipment Count */}
      <div
        style={{
          backgroundColor: "var(--bg-dark)",
          border: "1px solid var(--accent-subtle)",
          borderRadius: "6px",
          padding: "1rem",
        }}
      >
        <h4
          className="font-semibold mb-3 text-shadow-heavy"
          style={{ color: "var(--accent-tertiary)" }}
        >
          Equipment
        </h4>
        <div className="flex justify-between text-shadow">
          <span>Items Equipped:</span>
          <span className="text-yellow-shiny font-medium">
            {
              Object.values(selectedItems).filter((item) => item !== null)
                .length
            }
            /7
          </span>
        </div>
      </div>
    </div>
  );
};

export default BuildStats;
