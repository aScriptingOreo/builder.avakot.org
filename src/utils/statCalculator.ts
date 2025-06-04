import { SelectedItems } from "../types/build";

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
export const calculateStats = (selectedItems: SelectedItems): ConsolidatedStats => {
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

  // Process armor items (helm, upperBody, lowerBody, totem)
  const armorItems = [
    selectedItems.helm,
    selectedItems.upperBody,
    selectedItems.lowerBody,
    selectedItems.totem
  ].filter(Boolean); // Filter out null/undefined items

  // Count armor pieces
  stats.armorPieces = armorItems.length;

  // Process each armor item
  armorItems.forEach(item => {
    if (!item) return;

    // Add defensive stats
    if (item.Stats) {
      stats.physicalDefence += parseStatValue(item.Stats.PhysicalDefence);
      stats.magickDefence += parseStatValue(item.Stats.MagickDefence);
      stats.stabilityIncrease += parseStatValue(item.Stats.StabilityIncrease);
    }

    // Handle totem virtue bonuses
    if (item.Slot === 'Totem' && item.Stats?.Virtue) {
      const virtueType = item.Stats.Virtue.Type;
      const virtueValue = parseStatValue(item.Stats.Virtue.Value);

      if (virtueType === 'Grace') stats.graceValue += virtueValue;
      else if (virtueType === 'Spirit') stats.spiritValue += virtueValue;
      else if (virtueType === 'Courage') stats.courageValue += virtueValue;
    }
  });

  // Process weapon items and their motes
  const weaponItems = [
    selectedItems.primary,
    selectedItems.sidearm
  ].filter(Boolean);

  stats.weaponsEquipped = weaponItems.length;

  // Process each weapon
  weaponItems.forEach(weapon => {
    if (!weapon || !weapon.Stats) return;

    // Use lvl30 stats if available, otherwise lvl0
    const weaponStats = weapon.Stats.lvl30 || weapon.Stats.lvl0;
    if (weaponStats) {
      stats.attackPower += parseStatValue(weaponStats.Attack);
      stats.chargedAttack += parseStatValue(weaponStats.ChargedAttack);
      stats.stagger += parseStatValue(weaponStats.Stagger);
    }

    // Add smite damage if available
    if (weapon.Stats.Smite) {
      // This could be added to a separate property if needed
      // For now we'll just add it to attack power as an example
      stats.attackPower += parseStatValue(weapon.Stats.Smite);
    }

    // Process weapon motes (if any)
    if (weapon.Motes && Array.isArray(weapon.Motes)) {
      // Limit to 3 motes per weapon
      const motes = weapon.Motes.slice(0, 3);

      // Process each mote's effect
      motes.forEach(mote => {
        if (mote.Effect) {
          // Parse mote effect and apply to stats
          // This is a simplified example - you would need to implement
          // more sophisticated parsing for actual mote effects
          if (mote.Effect.includes('Counter Damage')) {
            // Example: "15 Counter Damage"
            const counterDamage = parseFloat(mote.Effect.split(' ')[0]);
            if (!isNaN(counterDamage)) {
              stats.attackPower += counterDamage * 0.1; // Just an example calculation
            }
          }
          // Add more effect parsing as needed
        }
      });
    }
  });

  // Process pact and its motes
  const pact = selectedItems.pact;
  if (pact) {
    stats.hasPact = true;

    if (pact.Stats) {
      // Add pact bonuses
      stats.bonusHP += parseStatValue(pact.Stats.BonusHP);
      stats.physicalDefence += parseStatValue(pact.Stats.PhysicalDefence);
      stats.magickDefence += parseStatValue(pact.Stats.MagickDefence);
      stats.stabilityIncrease += parseStatValue(pact.Stats.StabilityIncrease);

      // Add virtue bonuses from pact
      if (pact.Stats.BonusVirtue) {
        const virtueType = pact.Stats.BonusVirtue.Type;
        const virtueValue = parseStatValue(pact.Stats.BonusVirtue.Value);

        if (virtueType === 'Grace') stats.graceValue += virtueValue;
        else if (virtueType === 'Spirit') stats.spiritValue += virtueValue;
        else if (virtueType === 'Courage') stats.courageValue += virtueValue;
      }
    }

    // Process pact motes (if any)
    if (pact.Motes && Array.isArray(pact.Motes)) {
      // Limit to 3 motes per pact
      const motes = pact.Motes.slice(0, 3);

      // Process each mote's effect
      motes.forEach(mote => {
        if (mote.Effect) {
          // Parse mote effect and apply to stats
          // More sophisticated parsing would be needed here
          if (mote.Effect.includes('Grace Flows')) {
            stats.graceValue += 1; // Example effect
          }
          // Add more effect parsing as needed
        }
      });
    }
  }

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
