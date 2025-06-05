import { SelectedItems } from "../types/build";
import { parseArmorStats, parseMoteEffects, parsePactStats, parseWeaponStats } from "./statsParser";

// Interface for consolidated stats
export interface ConsolidatedStats {
  // Defensive stats
  physicalDefence: number;
  magickDefence: number;
  stabilityIncrease: number;

  // Health bonus
  bonusHP: number;

  // Weapon stats
  attackPower: number;
  chargedAttack: number;
  stagger: number;

  // Virtue stats
  graceValue: number;
  spiritValue: number;
  courageValue: number;

  // Equipment summary
  armorPieces: number;
  weaponsEquipped: number;
  hasPact: boolean;
}

// Helper to parse numeric values safely
const parseStatValue = (value: string | undefined | null): number => {
  if (!value) return 0;

  // Handle percentage values (e.g., "15%")
  if (value.endsWith('%')) {
    return parseFloat(value) / 100;
  }

  // Handle fraction values (e.g., "1/3")
  if (value.includes('/')) {
    const [numerator, denominator] = value.split('/').map(Number);
    return numerator / denominator;
  }

  // Standard numeric values
  const numValue = parseFloat(value);
  return isNaN(numValue) ? 0 : numValue;
};

// Calculate stats from all selected items
export const calculateStats = (selectedItems: SelectedItems, showPrimaryWeapon: boolean = true): ConsolidatedStats => {
  // Initialize stats with default values
  const stats: ConsolidatedStats = {
    physicalDefence: 0,
    magickDefence: 0,
    stabilityIncrease: 0,
    bonusHP: 0,
    attackPower: 0,
    chargedAttack: 0,
    stagger: 0,
    graceValue: 0,
    spiritValue: 0,
    courageValue: 0,
    armorPieces: 0,
    weaponsEquipped: 0,
    hasPact: false
  };

  console.log("calculateStats: Processing selectedItems", selectedItems);

  // Process armor items (helm, upperBody, lowerBody, totem)
  const armorItems = [
    selectedItems.helm,
    selectedItems.upperBody,
    selectedItems.lowerBody,
    selectedItems.totem
  ].filter(Boolean); // Filter out null/undefined items

  // Count armor pieces
  stats.armorPieces = armorItems.length;

  // Process each armor item using statsParser
  armorItems.forEach(item => {
    if (!item) return;

    console.log(`calculateStats: Processing armor item ${item.LinkusAlias}, has Stats:`, !!item.Stats);

    const armorStats = parseArmorStats(item.Stats);

    // Accumulate the stats
    stats.physicalDefence += armorStats.PhysicalDefence;
    stats.magickDefence += armorStats.MagickDefence;
    stats.stabilityIncrease += armorStats.StabilityIncrease;

    // Handle virtue bonuses from totems
    if (armorStats.VirtueBonus) {
      const virtueType = armorStats.VirtueBonus.type;
      const virtueValue = armorStats.VirtueBonus.value;

      if (virtueType === 'Grace') stats.graceValue += virtueValue;
      else if (virtueType === 'Spirit') stats.spiritValue += virtueValue;
      else if (virtueType === 'Courage') stats.courageValue += virtueValue;
      else if (virtueType === 'All Virtues') {
        stats.graceValue += virtueValue;
        stats.spiritValue += virtueValue;
        stats.courageValue += virtueValue;
      }
    }

    console.log(`calculateStats: Processed armor item ${item.LinkusAlias}`, armorStats);
    console.log(`calculateStats: Running totals - Physical: ${stats.physicalDefence}, Magick: ${stats.magickDefence}, Stability: ${stats.stabilityIncrease}`);
  });

  // Process weapon items and their motes
  const weaponItems = [
    selectedItems.primary,
    selectedItems.sidearm
  ].filter(Boolean);

  stats.weaponsEquipped = weaponItems.length;

  // Process each weapon using statsParser
  weaponItems.forEach((weapon, index) => {
    if (!weapon) return;

    console.log(`calculateStats: Processing weapon ${weapon.LinkusAlias}, has Stats:`, !!weapon.Stats);

    const weaponStats = parseWeaponStats(weapon.Stats);

    // Show stats for the selected weapon (Primary or Sidearm)
    const isPrimaryWeapon = weapon === selectedItems.primary;
    const isSidearmWeapon = weapon === selectedItems.sidearm;

    if ((showPrimaryWeapon && isPrimaryWeapon) || (!showPrimaryWeapon && isSidearmWeapon)) {
      stats.attackPower = weaponStats.Attack;
      stats.chargedAttack = weaponStats.ChargedAttack;
      stats.stagger = weaponStats.Stagger;
    }

    console.log(`calculateStats: Processed weapon ${weapon.LinkusAlias}`, weaponStats);

    // Process weapon motes (if any) - always include motes from both weapons for virtue bonuses
    if (weapon.Motes && Array.isArray(weapon.Motes)) {
      weapon.Motes.forEach(mote => {
        if (mote?.Effect) {
          const { virtueBonus } = parseMoteEffects(mote.Effect);
          stats.graceValue += virtueBonus.Grace;
          stats.spiritValue += virtueBonus.Spirit;
          stats.courageValue += virtueBonus.Courage;

          console.log(`calculateStats: Processed weapon mote ${mote.MoteID}`, virtueBonus);
        }
      });
    }
  });

  // Process pact and its motes using statsParser
  const pact = selectedItems.pact;
  if (pact) {
    stats.hasPact = true;

    console.log(`calculateStats: Processing pact ${pact.LinkusAlias}, has Stats:`, !!pact.Stats);

    const pactStats = parsePactStats(pact.Stats);

    // Accumulate pact stats
    stats.bonusHP += pactStats.BonusHP;
    stats.physicalDefence += pactStats.PhysicalDefence;
    stats.magickDefence += pactStats.MagickDefence;
    stats.stabilityIncrease += pactStats.StabilityIncrease;

    // Handle virtue bonuses from pact
    if (pactStats.VirtueBonus) {
      const virtueType = pactStats.VirtueBonus.type;
      const virtueValue = pactStats.VirtueBonus.value;

      if (virtueType === 'Grace') stats.graceValue += virtueValue;
      else if (virtueType === 'Spirit') stats.spiritValue += virtueValue;
      else if (virtueType === 'Courage') stats.courageValue += virtueValue;
      else if (virtueType === 'All Virtues') {
        stats.graceValue += virtueValue;
        stats.spiritValue += virtueValue;
        stats.courageValue += virtueValue;
      }
    }

    console.log(`calculateStats: Processed pact ${pact.LinkusAlias}`, pactStats);

    // Process pact motes (if any)
    if (pact.Motes && Array.isArray(pact.Motes)) {
      pact.Motes.forEach(mote => {
        if (mote?.Effect) {
          const { virtueBonus } = parseMoteEffects(mote.Effect);
          stats.graceValue += virtueBonus.Grace;
          stats.spiritValue += virtueBonus.Spirit;
          stats.courageValue += virtueBonus.Courage;

          console.log(`calculateStats: Processed pact mote ${mote.MoteID}`, virtueBonus);
        }
      });
    }
  }

  console.log("calculateStats: Final calculated stats", stats);

  return stats;
};

// Format stat value for display
export const formatStatValue = (value: number): string => {
  // If value is an integer or close to it, display without decimal places
  if (Math.abs(value - Math.round(value)) < 0.01) {
    return Math.round(value).toString();
  }

  // For values with decimals, display with up to 2 decimal places
  return value.toFixed(2);
};
