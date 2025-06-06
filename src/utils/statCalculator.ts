import { SelectedItems } from "../types/build";
import { parseArmorStats, parseMoteEffects, parsePactStats, parseSmiteValue, parseWeaponStats } from "./statsParser";

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

  // Additional weapon stats
  smite: number;  // Numeric value (for calculations)
  smiteDisplay: string;  // Original format (e.g., "3/50")
  smitePercentage: string;  // Formatted percentage (e.g., "6.0%")
  damageAttuneCap: number;
  virtueAttuneCap: number;
  damageType: string;
  art: string;

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
    smite: 0,
    smiteDisplay: "0",
    smitePercentage: "0%",
    damageAttuneCap: 0,
    virtueAttuneCap: 0,
    damageType: "",       // New field
    art: "",              // New field
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

    // Check the raw Smite value to debug
    console.log(`calculateStats: Raw Smite value for ${weapon.LinkusAlias}:`,
      weapon.Stats?.Smite || "No Smite value");

    const weaponStats = parseWeaponStats(weapon.Stats);

    // Show stats for the selected weapon (Primary or Sidearm)
    const isPrimaryWeapon = weapon === selectedItems.primary;
    const isSidearmWeapon = weapon === selectedItems.sidearm;

    // Process weapon motes for stat bonuses
    if (weapon.Motes && Array.isArray(weapon.Motes)) {
      const weaponMotesBonuses = weapon.Motes
        .filter(mote => mote) // Filter out null/undefined motes
        .map(mote => {
          if (mote?.Effect) {
            const { weaponBonuses } = parseMoteEffects(mote.Effect);
            return weaponBonuses;
          }
          return { attackDamage: 0, chargedAttackDamage: 0, smiteChancePercent: 0 };
        });

      // Sum up all bonuses from motes
      const totalMoteBonus = weaponMotesBonuses.reduce(
        (acc, bonus) => ({
          attackDamage: acc.attackDamage + bonus.attackDamage,
          chargedAttackDamage: acc.chargedAttackDamage + bonus.chargedAttackDamage,
          smiteChancePercent: acc.smiteChancePercent + bonus.smiteChancePercent,
        }),
        { attackDamage: 0, chargedAttackDamage: 0, smiteChancePercent: 0 }
      );

      console.log(`calculateStats: Mote bonuses for ${weapon.LinkusAlias}:`, totalMoteBonus);

      // Apply mote bonuses to selected weapon stats
      if ((showPrimaryWeapon && isPrimaryWeapon) || (!showPrimaryWeapon && isSidearmWeapon)) {
        stats.attackPower = weaponStats.Attack + totalMoteBonus.attackDamage;
        stats.chargedAttack = weaponStats.ChargedAttack + totalMoteBonus.chargedAttackDamage;

        // Parse the smite value and apply percentage bonus
        // Log the raw Smite value from weaponStats before parsing
        console.log(`calculateStats: Raw weaponStats.Smite before parsing: "${weaponStats.Smite}"`);

        const smiteInfo = parseSmiteValue(weaponStats.Smite);
        console.log(`calculateStats: Original smite info for ${weapon.LinkusAlias}:`, smiteInfo);

        if (smiteInfo.denominator > 0) {
          // Get the original X/Y values
          const originalX = smiteInfo.numerator;
          const originalY = smiteInfo.denominator;

          // Add the percentage boost from motes
          const baseProbability = originalX / originalY;
          const moteBoost = totalMoteBonus.smiteChancePercent / 100; // Convert percent to decimal

          // Calculate the new probability (capped at 100%)
          const newProbability = Math.min(baseProbability + moteBoost, 1.0);
          const newPercentage = newProbability * 100;

          // Keep the same denominator and calculate a new numerator
          const newX = Math.round(newProbability * originalY);

          console.log(`calculateStats: Smite calculation for ${weapon.LinkusAlias}:`, {
            originalX,
            originalY,
            originalProbability: baseProbability,
            moteBoostDecimal: moteBoost,
            moteBoostPercent: totalMoteBonus.smiteChancePercent,
            newProbability,
            newX,
            unchanged_Y: originalY
          });

          // Update the stats object
          stats.smite = newProbability;
          stats.smiteDisplay = `${newX}/${originalY}`;
          stats.smitePercentage = `${newPercentage.toFixed(1)}%`;
        } else {
          // If there's no valid X/Y format, just use the raw value
          stats.smite = smiteInfo.numerator;
          stats.smiteDisplay = smiteInfo.display;  // This should be the raw string
          stats.smitePercentage = smiteInfo.formattedPercentage;

          // Double-check that we're preserving the correct format
          console.log(`calculateStats: Setting smiteDisplay (no denominator) to: "${stats.smiteDisplay}"`);
        }

        // Set other weapon stats that don't get modified by motes
        stats.stagger = weaponStats.Stagger;
        stats.damageAttuneCap = weaponStats.DamageAttuneCap;
        stats.virtueAttuneCap = weaponStats.VirtueAttuneCap;
        stats.damageType = weapon.DamageType || "";
        stats.art = weapon.Art || "";
      }
    } else {
      // No motes, just set base stats
      if ((showPrimaryWeapon && isPrimaryWeapon) || (!showPrimaryWeapon && isSidearmWeapon)) {
        stats.attackPower = weaponStats.Attack;
        stats.chargedAttack = weaponStats.ChargedAttack;
        stats.stagger = weaponStats.Stagger;
        stats.smite = weaponStats.Smite;
        stats.damageAttuneCap = weaponStats.DamageAttuneCap;
        stats.virtueAttuneCap = weaponStats.VirtueAttuneCap;
        stats.damageType = weapon.DamageType || "";
        stats.art = weapon.Art || "";

        // Log setting smiteDisplay in the "no motes" case
        console.log(`calculateStats: Setting smiteDisplay (no motes) for ${weapon.LinkusAlias} to: "${weaponStats.Smite}"`);

        // Set smite values without bonus - ensure we're using the raw string
        const smiteInfo = parseSmiteValue(weaponStats.Smite);
        stats.smite = smiteInfo.numerator;
        stats.smiteDisplay = smiteInfo.display; // This should preserve the X/Y format
        stats.smitePercentage = smiteInfo.formattedPercentage;

        console.log(`calculateStats: Final smiteDisplay (no motes): "${stats.smiteDisplay}"`);
      }
    }

    console.log(`calculateStats: Processed weapon ${weapon.LinkusAlias}`, weaponStats);

    // Process weapon motes for virtue bonuses - Keep existing code for virtue bonuses
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

  // Add stats from pact if equipped
  if (selectedItems.pact?.Stats) {
    const pactStats = selectedItems.pact.Stats;

    // Add defensive stats from pact
    if (pactStats.PhysicalDefence) stats.physicalDefence += parseFloat(pactStats.PhysicalDefence) || 0;
    if (pactStats.MagickDefence) stats.magickDefence += parseFloat(pactStats.MagickDefence) || 0;
    if (pactStats.StabilityIncrease) stats.stabilityIncrease += parseFloat(pactStats.StabilityIncrease) || 0;

    // Add bonus HP from pact
    if (pactStats.BonusHP) stats.bonusHP += parseFloat(pactStats.BonusHP) || 0;

    // Add unarmed damage from pact
    if (pactStats.UnarmedDmg) stats.unarmedDamage += parseFloat(pactStats.UnarmedDmg) || 0;

    // Add virtue bonus from pact
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
