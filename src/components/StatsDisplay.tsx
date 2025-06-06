import React, { useEffect, useState } from "react";
import { SelectedItems } from "../types/build";
import { resolveDisplayName } from "../utils/api";
import { getStatIcon, getVirtueIcon } from '../utils/iconUtils';
import { calculateStats, formatStatValue } from "../utils/statCalculator";
import { parseMoteEffects } from "../utils/statsParser";
import StatIcon from "./StatIcon";

interface StatsDisplayProps {
  selectedItems: SelectedItems;
  playerVirtues: {
    grace: number;
    spirit: number;
    courage: number;
  };
}

// Define colors for each armor slot
const ARMOR_SLOT_COLORS = {
  helm: "#3b82f6", // Blue
  upperBody: "#10b981", // Green
  lowerBody: "#8b5cf6", // Purple
  totem: "#f59e0b", // Amber/gold
};

// Add Pact color
const PACT_COLOR = "#ef4444"; // Red

const StatsDisplay: React.FC<StatsDisplayProps> = ({ 
  selectedItems,
  playerVirtues 
}) => {
  const [itemDisplayNames, setItemDisplayNames] = useState<
    Record<string, string>
  >({});
  const [showPrimaryWeapon, setShowPrimaryWeapon] = useState(true);

  // Debug logging to ensure component updates
  console.log("StatsDisplay: selectedItems changed", selectedItems);

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
  }, [selectedItems, itemDisplayNames]);

  // Use the centralized stats calculation from statCalculator
  const stats = calculateStats(selectedItems, showPrimaryWeapon);

  // Debug logging to see calculated stats
  console.log("StatsDisplay: calculated stats", stats);

  // Helper function to get individual armor and pact contributions with color coding
  const getDefenseContributions = (statType: 'PhysicalDefence' | 'MagickDefence' | 'StabilityIncrease' | 'BonusHP') => {
    const contributions = [];
    const armorSlots: (keyof SelectedItems)[] = ['helm', 'upperBody', 'lowerBody'];
    for (const slot of armorSlots) {
      const item = selectedItems[slot];
      // Only check ArmorStats for armor slots
      if (item?.Stats && typeof item.Stats === 'object' && statType in item.Stats && typeof (item.Stats as any)[statType] === 'string') {
        const value = parseFloat((item.Stats as any)[statType]);
        if (!isNaN(value) && value > 0) {
          contributions.push({
            slot,
            value,
            color: ARMOR_SLOT_COLORS[slot as keyof typeof ARMOR_SLOT_COLORS]
          });
        }
      }
    }
    const pact = selectedItems.pact;
    if (pact?.Stats && typeof pact.Stats === 'object' && statType in pact.Stats && typeof (pact.Stats as any)[statType] === 'string') {
      let pactValue = 0;
      if (statType === 'BonusHP' && pact.Stats.BonusHP) {
        pactValue = parseFloat(pact.Stats.BonusHP);
      } else if (statType !== 'BonusHP' && (pact.Stats as any)[statType]) {
        pactValue = parseFloat((pact.Stats as any)[statType]);
      }
      if (!isNaN(pactValue) && pactValue > 0) {
        contributions.push({
          slot: 'pact',
          value: pactValue,
          color: PACT_COLOR
        });
      }
    }
    return contributions;
  };

  // Update the getVirtueContribution function to handle AllVirtues
  const getVirtueContribution = (virtueType: string) => {
    const contributions = [];
    
    // Check totem contribution
    const totem = selectedItems.totem;
    if (totem?.Stats?.Virtue) {
      const vType = totem.Stats.Virtue.Type?.toLowerCase();
      const value = parseFloat(totem.Stats.Virtue.Value);
      if (!isNaN(value) && value > 0) {
        if (vType === "allvirtues") {
          // AllVirtues: add a contribution for each virtue type
          if (["grace", "spirit", "courage"].includes(virtueType.toLowerCase())) {
            contributions.push({
              value,
              color: ARMOR_SLOT_COLORS.totem,
              source: "totem"
            });
          }
        } else if (vType === virtueType.toLowerCase()) {
          contributions.push({
            value,
            color: ARMOR_SLOT_COLORS.totem,
            source: "totem"
          });
        }
      }
    }
    
    // Check pact contribution
    const pact = selectedItems.pact;
    if (pact?.Stats?.BonusVirtue) {
      const vType = pact.Stats.BonusVirtue.Type?.toLowerCase();
      const value = parseFloat(pact.Stats.BonusVirtue.Value);
      if (!isNaN(value) && value > 0) {
        if (vType === "allvirtues") {
          if (["grace", "spirit", "courage"].includes(virtueType.toLowerCase())) {
            contributions.push({
              value,
              color: PACT_COLOR,
              source: "pact"
            });
          }
        } else if (vType === virtueType.toLowerCase()) {
          contributions.push({
            value,
            color: PACT_COLOR,
            source: "pact"
          });
        }
      }
    }
    
    // Check motes with virtue bonuses
    // Process weapons
    ['primary', 'sidearm'].forEach(weaponSlot => {
      const weapon = selectedItems[weaponSlot as keyof SelectedItems];
      // Only WeaponItem has Motes
      if (weapon && 'Motes' in weapon && Array.isArray(weapon.Motes)) {
        weapon.Motes.forEach((mote: any) => {
          if (mote && typeof mote.Effect === 'string' && mote.Effect.includes(virtueType)) {
            // Parse virtue value from effect description
            const match = mote.Effect.match(new RegExp(`${virtueType}\\s*\\+\\s*(\\d+)`, 'i'));
            if (match && match[1]) {
              const value = parseInt(match[1], 10);
              if (!isNaN(value) && value > 0) {
                contributions.push({
                  value,
                  color: '#9333ea', // Purple for motes
                  source: `${weaponSlot} mote`
                });
              }
            }
          }
        });
      }
    });
    // Check pact motes
    const pactMotes = (selectedItems.pact && 'Motes' in selectedItems.pact && Array.isArray(selectedItems.pact.Motes)) ? selectedItems.pact.Motes : undefined;
    if (pactMotes) {
      pactMotes.forEach((mote: any) => {
        if (mote && typeof mote.Effect === 'string' && mote.Effect.includes(virtueType)) {
          const match = mote.Effect.match(new RegExp(`${virtueType}\\s*\\+\\s*(\\d+)`, 'i'));
          if (match && match[1]) {
            const value = parseInt(match[1], 10);
            if (!isNaN(value) && value > 0) {
              contributions.push({
                value,
                color: '#9333ea', // Purple for motes
                source: 'pact mote'
              });
            }
          }
        }
      });
    }
    
    // Add player virtue points
    if (virtueType.toLowerCase() === 'grace' && playerVirtues.grace > 0) {
      contributions.push({
        value: playerVirtues.grace,
        color: '#f59e0b', // Amber for player virtues
        source: 'player'
      });
    } 
    else if (virtueType.toLowerCase() === 'spirit' && playerVirtues.spirit > 0) {
      contributions.push({
        value: playerVirtues.spirit,
        color: '#f59e0b', // Amber for player virtues
        source: 'player'
      });
    }
    else if (virtueType.toLowerCase() === 'courage' && playerVirtues.courage > 0) {
      contributions.push({
        value: playerVirtues.courage,
        color: '#f59e0b', // Amber for player virtues
        source: 'player'
      });
    }
    
    return contributions;
  };

  // Calculate special mote effects that aren't virtue bonuses
  const getSpecialMoteEffects = () => {
    const specialEffects: string[] = [];
    const processedMoteTypes: Set<string> = new Set();

    // Check weapon motes
    [selectedItems.primary, selectedItems.sidearm].forEach((weapon) => {
      if (weapon?.Motes) {
        weapon.Motes.forEach((mote) => {
          if (mote?.Effect) {
            const { otherEffects, weaponBonuses } = parseMoteEffects(
              mote.Effect
            );

            // Add non-numeric effects
            specialEffects.push(
              ...otherEffects.filter((effect) => {
                // Filter out effects we're already showing in stats
                if (
                  effect.match(
                    /Attack Damage|Fully-Charged Heavy Damage|Smite Chance/
                  )
                ) {
                  return false;
                }
                return true;
              })
            );

            // Add formatted versions of numeric effects
            if (
              weaponBonuses.attackDamage > 0 &&
              !processedMoteTypes.has("attackDamage")
            ) {
              specialEffects.push(
                `+${weaponBonuses.attackDamage} Attack Damage from motes`
              );
              processedMoteTypes.add("attackDamage");
            }

            if (
              weaponBonuses.chargedAttackDamage > 0 &&
              !processedMoteTypes.has("chargedAttackDamage")
            ) {
              specialEffects.push(
                `+${weaponBonuses.chargedAttackDamage} Charged Attack Damage from motes`
              );
              processedMoteTypes.add("chargedAttackDamage");
            }

            if (
              weaponBonuses.smiteChancePercent > 0 &&
              !processedMoteTypes.has("smiteChance")
            ) {
              specialEffects.push(
                `+${weaponBonuses.smiteChancePercent}% Smite Chance from motes`
              );
              processedMoteTypes.add("smiteChance");
            }
          }
        });
      }
    });

    // Check pact motes - Keep original behavior for pact motes
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
    return (
      itemDisplayNames[item?.LinkusAlias] ||
      item?.DisplayName ||
      item?.LinkusAlias ||
      "None"
    );
  };

  // Get current weapon for display
  const getCurrentWeapon = () => {
    return showPrimaryWeapon ? selectedItems.primary : selectedItems.sidearm;
  };

  const currentWeapon = getCurrentWeapon();

  // Calculate individual contributions
  const physicalDefenceContributions = getDefenseContributions('PhysicalDefence');
  const magickDefenceContributions = getDefenseContributions('MagickDefence');
  const stabilityContributions = getDefenseContributions('StabilityIncrease');
  const bonusHPContributions = getDefenseContributions('BonusHP');
  
  return (
    <div className="space-y-6">
      {/* Defense Stats - Always show */}
      <div className="bg-gray-750 p-4 rounded border border-gray-600">
        <h3 className="text-lg font-medium mb-3 text-blue-300">
          Defense Stats
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <StatIcon 
                iconUrl={getStatIcon('physicalDefence')}
                value=""
                alt="Physical Defence"
                size="small"
              />
              Physical Defence
            </div>
            <div className="text-xl font-bold text-white flex items-center">
              {formatStatValue(stats.physicalDefence)}
              {physicalDefenceContributions.length > 0 && (
                <span className="ml-2 text-sm font-normal">
                  {physicalDefenceContributions.map((contrib, idx) => (
                    <span 
                      key={`${contrib.slot}-${idx}`}
                      style={{color: contrib.color}}
                      className="ml-1"
                    >
                      {idx === 0 ? '(' : ''}
                      +{contrib.value}
                      {idx === physicalDefenceContributions.length - 1 ? ')' : ', '}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <StatIcon 
                iconUrl={getStatIcon('magickDefence')}
                value=""
                alt="Magick Defence"
                size="small"
              />
              Magick Defence
            </div>
            <div className="text-xl font-bold text-white flex items-center">
              {formatStatValue(stats.magickDefence)}
              {magickDefenceContributions.length > 0 && (
                <span className="ml-2 text-sm font-normal">
                  {magickDefenceContributions.map((contrib, idx) => (
                    <span 
                      key={`${contrib.slot}-${idx}`}
                      style={{color: contrib.color}}
                      className="ml-1"
                    >
                      {idx === 0 ? '(' : ''}
                      +{contrib.value}
                      {idx === magickDefenceContributions.length - 1 ? ')' : ', '}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <StatIcon 
                iconUrl={getStatIcon('stability')}
                value=""
                alt="Stability Increase"
                size="small"
              />
              Stability Increase
            </div>
            <div className="text-xl font-bold text-white flex items-center">
              {formatStatValue(stats.stabilityIncrease)}
              {stabilityContributions.length > 0 && (
                <span className="ml-2 text-sm font-normal">
                  {stabilityContributions.map((contrib, idx) => (
                    <span 
                      key={`${contrib.slot}-${idx}`}
                      style={{color: contrib.color}}
                      className="ml-1"
                    >
                      {idx === 0 ? '(' : ''}
                      +{contrib.value}
                      {idx === stabilityContributions.length - 1 ? ')' : ', '}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <img 
                src={getStatIcon('bonusHP')}
                alt="Bonus HP"
                className="h-5 w-5"
              />
              Bonus HP
            </div>
            <div className="text-xl font-bold text-white flex items-center">
              {formatStatValue(stats.bonusHP)}
              {bonusHPContributions.length > 0 && (
                <span className="ml-2 text-sm font-normal">
                  {bonusHPContributions.map((contrib, idx) => (
                    <span 
                      key={`${contrib.slot}-${idx}`}
                      style={{color: contrib.color}}
                      className="ml-1"
                    >
                      {idx === 0 ? '(' : ''}
                      +{contrib.value}
                      {idx === bonusHPContributions.length - 1 ? ')' : ', '}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </div>
          
          {/* Add Unarmed Damage */}
          {stats.unarmedDamage > 0 && (
            <div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <img 
                  src={getStatIcon('unarmedDamage')}
                  alt="Unarmed Damage"
                  className="h-5 w-5"
                />
                Unarmed Damage
              </div>
              <div className="text-xl font-bold text-white flex items-center">
                {formatStatValue(stats.unarmedDamage)}
                <span className="ml-2 text-sm font-normal" style={{color: PACT_COLOR}}>
                  (Pact)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weapon Stats - Always show with toggle */}
      <div className="bg-gray-750 p-4 rounded border border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-red-300">Combat Stats</h3>

          {/* Weapon Toggle Switch */}
          <div className="flex items-center gap-3">
            <span
              className={`text-sm ${
                showPrimaryWeapon ? "text-white font-medium" : "text-gray-400"
              }`}
            >
              Primary
            </span>
            <button
              onClick={() => setShowPrimaryWeapon(!showPrimaryWeapon)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              style={{
                backgroundColor: showPrimaryWeapon
                  ? "var(--accent-primary)"
                  : "var(--accent-subtle)",
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showPrimaryWeapon ? "translate-x-1" : "translate-x-6"
                }`}
              />
            </button>
            <span
              className={`text-sm ${
                !showPrimaryWeapon ? "text-white font-medium" : "text-gray-400"
              }`}
            >
              Sidearm
            </span>
          </div>
        </div>

        {/* Current weapon indicator */}
        {currentWeapon && (
          <div className="mb-3 text-sm">
            <div className="text-gray-300">
              Showing stats for:{" "}
              <span className="text-yellow-shiny font-medium">
                {getItemDisplayName(currentWeapon)}
              </span>
            </div>
            {stats.art && (
              <div className="text-gray-400 mt-1">
                Art: <span className="text-yellow-200">{stats.art}</span>
                {stats.damageType && (
                  <span className="ml-2">
                    • Type:{" "}
                    <span className="text-yellow-200">{stats.damageType}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-sm text-gray-400">Attack Power</div>
            <div className="text-xl font-bold text-white">
              {formatStatValue(stats.attackPower)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Charged Attack</div>
            <div className="text-xl font-bold text-white">
              {formatStatValue(stats.chargedAttack)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Stagger</div>
            <div className="text-xl font-bold text-white">
              {formatStatValue(stats.stagger)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Smite</div>
            <div className="text-xl font-bold text-white">
              {stats.smiteDisplay && stats.smiteDisplay.includes("/")
                ? stats.smiteDisplay.replace("/", " in ") + " hits"
                : stats.smiteDisplay + " hits"}{" "}
              <span className="text-sm text-gray-300">
                ({stats.smitePercentage} chance)
              </span>
            </div>
          </div>
          {/* Unarmed Damage row */}
          {stats.unarmedDamage > 0 && (
            <div className="col-span-2">
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <img 
                  src={getStatIcon('unarmedDamage')}
                  alt="Unarmed Damage"
                  className="h-5 w-5"
                />
                Unarmed Damage
              </div>
              <div className="text-xl font-bold text-white flex items-center">
                {formatStatValue(stats.unarmedDamage)}
                <span className="ml-2 text-sm font-normal" style={{color: PACT_COLOR}}>
                  (Pact)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Additional Weapon Stats Section */}
        {currentWeapon && (
          <div className="border-t border-gray-600 pt-3 mt-1">
            <h4 className="text-sm font-medium text-yellow-200 mb-2">
              Attunement Caps
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Damage Attune Cap</div>
                <div className="text-lg font-medium text-blue-300">
                  {stats.damageAttuneCap > 0
                    ? formatStatValue(stats.damageAttuneCap)
                    : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Virtue Attune Cap</div>
                <div className="text-lg font-medium text-green-300">
                  {stats.virtueAttuneCap > 0
                    ? formatStatValue(stats.virtueAttuneCap)
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Virtue Bonuses - Always show */}
      <div className="bg-gray-750 p-4 rounded border border-gray-600">
        <h3 className="text-lg font-medium mb-3 text-yellow-300">
          Virtue Bonuses
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <img 
                src={getVirtueIcon('grace')}
                alt="Grace"
                className="h-5 w-5"
              />
              Grace
            </div>
            <div className="text-xl font-bold text-white flex items-center flex-wrap">
              +{formatStatValue(stats.graceValue)}
              <span className="ml-2 text-sm font-normal flex flex-wrap">
                {getVirtueContribution('grace').map((contrib, idx) => (
                  <span 
                    key={`grace-${idx}`}
                    style={{color: contrib.color}}
                    className="ml-1"
                  >
                    {idx === 0 ? '(' : ''}
                    +{contrib.value}
                    {idx === getVirtueContribution('grace').length - 1 ? ')' : ', '}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <img 
                src={getVirtueIcon('spirit')}
                alt="Spirit"
                className="h-5 w-5"
              />
              Spirit
            </div>
            <div className="text-xl font-bold text-white flex items-center flex-wrap">
              +{formatStatValue(stats.spiritValue)}
              <span className="ml-2 text-sm font-normal flex flex-wrap">
                {getVirtueContribution('spirit').map((contrib, idx) => (
                  <span 
                    key={`spirit-${idx}`}
                    style={{color: contrib.color}}
                    className="ml-1"
                  >
                    {idx === 0 ? '(' : ''}
                    +{contrib.value}
                    {idx === getVirtueContribution('spirit').length - 1 ? ')' : ', '}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <img 
                src={getVirtueIcon('courage')}
                alt="Courage"
                className="h-5 w-5"
              />
              Courage
            </div>
            <div className="text-xl font-bold text-white flex items-center flex-wrap">
              +{formatStatValue(stats.courageValue)}
              <span className="ml-2 text-sm font-normal flex flex-wrap">
                {getVirtueContribution('courage').map((contrib, idx) => (
                  <span 
                    key={`courage-${idx}`}
                    style={{color: contrib.color}}
                    className="ml-1"
                  >
                    {idx === 0 ? '(' : ''}
                    +{contrib.value}
                    {idx === getVirtueContribution('courage').length - 1 ? ')' : ', '}
                  </span>
                ))}
              </span>
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

        {/* Equipped Items List with Color Coding for Armor */}
        <div className="space-y-2 text-sm border-t border-gray-600 pt-3">
          {Object.entries(selectedItems).map(([slot, item]) => {
            const isArmorSlot = ['helm', 'upperBody', 'lowerBody', 'totem'].includes(slot);
            const slotColor = isArmorSlot ? ARMOR_SLOT_COLORS[slot as keyof typeof ARMOR_SLOT_COLORS] : undefined;
            
            return (
              <div key={slot} className="flex justify-between">
                <span className="text-gray-400 capitalize" style={slotColor ? {color: slotColor} : undefined}>
                  {slot === "sidearm"
                    ? "Sidearm"
                    : slot.replace(/([A-Z])/g, " $1").trim()}
                  :
                </span>
                <span className="text-white">
                  {item ? getItemDisplayName(item) : "None"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsDisplay;
