import React from "react";
import { SelectedItems } from "../types/build";
import {
  calculateStats,
  ConsolidatedStats,
  formatStatValue,
} from "../utils/statCalculator";

interface BuildStatsProps {
  selectedItems: SelectedItems;
}

const BuildStats: React.FC<BuildStatsProps> = ({ selectedItems }) => {
  const stats: ConsolidatedStats = calculateStats(selectedItems);

  // Check if any items are selected
  const hasItems = Object.values(selectedItems).some((item) => item !== null);

  // Display message if no items are selected
  if (!hasItems) {
    return (
      <div
        className="text-center py-8 text-shadow"
        style={{ color: "var(--text-muted)" }}
      >
        Select equipment to view stats.
      </div>
    );
  }

  // Helper function to determine if a section should be displayed
  const hasDefensiveStats =
    stats.physicalDefence > 0 ||
    stats.magickDefence > 0 ||
    stats.stabilityIncrease > 0 ||
    stats.bonusHP > 0;
  const hasOffensiveStats =
    stats.attackPower > 0 || stats.chargedAttack > 0 || stats.stagger > 0;
  const hasVirtueStats =
    stats.graceValue > 0 || stats.spiritValue > 0 || stats.courageValue > 0;

  return (
    <div className="space-y-6">
      {/* Defensive Stats - only show if any values exist */}
      {hasDefensiveStats && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-shadow-heavy">
            Defensive
          </h3>
          <table className="statusus-table w-full">
            <tbody>
              {stats.physicalDefence > 0 && (
                <tr>
                  <td>Physical Defence</td>
                  <td className="text-right">
                    {formatStatValue(stats.physicalDefence)}
                  </td>
                </tr>
              )}
              {stats.magickDefence > 0 && (
                <tr>
                  <td>Magick Defence</td>
                  <td className="text-right">
                    {formatStatValue(stats.magickDefence)}
                  </td>
                </tr>
              )}
              {stats.stabilityIncrease > 0 && (
                <tr>
                  <td>Stability</td>
                  <td className="text-right">
                    {formatStatValue(stats.stabilityIncrease)}
                  </td>
                </tr>
              )}
              {stats.bonusHP > 0 && (
                <tr>
                  <td>Bonus HP</td>
                  <td className="text-right">
                    {formatStatValue(stats.bonusHP)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Offensive Stats - only show if any values exist and weapons are equipped */}
      {hasOffensiveStats && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-shadow-heavy text-courage">
            Offensive
          </h3>
          <table className="statusus-table w-full">
            <tbody>
              {stats.attackPower > 0 && (
                <tr>
                  <td>Attack Power</td>
                  <td className="text-right">
                    {formatStatValue(stats.attackPower)}
                  </td>
                </tr>
              )}
              {stats.chargedAttack > 0 && (
                <tr>
                  <td>Charged Attack</td>
                  <td className="text-right">
                    {formatStatValue(stats.chargedAttack)}
                  </td>
                </tr>
              )}
              {stats.stagger > 0 && (
                <tr>
                  <td>Stagger</td>
                  <td className="text-right">
                    {formatStatValue(stats.stagger)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Virtue Stats - only show if any values exist */}
      {hasVirtueStats && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-shadow-heavy">
            Virtues
          </h3>
          <table className="statusus-table w-full">
            <tbody>
              {stats.graceValue > 0 && (
                <tr>
                  <td className="text-grace">Grace</td>
                  <td className="text-right">
                    {formatStatValue(stats.graceValue)}
                  </td>
                </tr>
              )}
              {stats.spiritValue > 0 && (
                <tr>
                  <td className="text-spirit">Spirit</td>
                  <td className="text-right">
                    {formatStatValue(stats.spiritValue)}
                  </td>
                </tr>
              )}
              {stats.courageValue > 0 && (
                <tr>
                  <td className="text-courage">Courage</td>
                  <td className="text-right">
                    {formatStatValue(stats.courageValue)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BuildStats;
