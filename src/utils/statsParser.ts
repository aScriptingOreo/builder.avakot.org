/**
 * Stats Parser - Helper functions for converting API string values to usable numeric values
 */

// Generic function to extract numeric values from strings
export function extractNumericValue(value: string | undefined | null): number {
  if (!value) return 0;

  // Handle string values that might be empty or "0"
  if (typeof value === 'string') {
    if (value.trim() === '' || value.trim() === '0') return 0;

    // Handle fraction format like "3/50" - we only care about the first number
    if (value.includes('/')) {
      const parts = value.split('/');
      return parseInt(parts[0], 10) || 0;
    }

    // Extract numbers from strings like "10 Physical Defence" or just "10"
    const matches = value.match(/^(\d+)/);
    if (matches && matches[1]) {
      return parseInt(matches[1], 10);
    }
  }

  // Try direct parsing for numbers
  const num = parseFloat(String(value));
  return isNaN(num) ? 0 : num;
}

// Process armor stats - handles both regular armor and totems
export function parseArmorStats(stats: any): {
  PhysicalDefence: number;
  MagickDefence: number;
  StabilityIncrease: number;
  VirtueBonus: { type: string; value: number } | null;
} {
  if (!stats) {
    console.log('parseArmorStats: No stats provided');
    return { PhysicalDefence: 0, MagickDefence: 0, StabilityIncrease: 0, VirtueBonus: null };
  }

  console.log('parseArmorStats: Processing stats:', stats);

  const physicalDefence = extractNumericValue(stats.PhysicalDefence);
  const magickDefence = extractNumericValue(stats.MagickDefence);
  const stabilityIncrease = extractNumericValue(stats.StabilityIncrease);

  console.log('parseArmorStats: Extracted values:', {
    physicalDefence,
    magickDefence,
    stabilityIncrease,
    rawPhysicalDefence: stats.PhysicalDefence,
    rawMagickDefence: stats.MagickDefence,
    rawStabilityIncrease: stats.StabilityIncrease
  });

  // Process virtue bonus from totem
  let virtueBonus = null;
  if (stats.Virtue) {
    virtueBonus = {
      type: stats.Virtue.Type || 'Unknown',
      value: extractNumericValue(stats.Virtue.Value)
    };
    console.log('parseArmorStats: Found virtue bonus:', virtueBonus);
  }

  const result = {
    PhysicalDefence: physicalDefence,
    MagickDefence: magickDefence,
    StabilityIncrease: stabilityIncrease,
    VirtueBonus: virtueBonus
  };

  console.log('parseArmorStats: Final result:', result);
  return result;
}

// Process weapon stats (focusing on lvl30)
export function parseWeaponStats(stats: any): {
  Stagger: number;
  Attack: number;
  ChargedAttack: number;
  DamageAttuneCap: number;
  Smite: string; // Change from number to string to preserve raw value
  VirtueAttuneCap: number;
} {
  if (!stats) {
    console.log('parseWeaponStats: No stats provided');
    return {
      Stagger: 0,
      Attack: 0,
      ChargedAttack: 0,
      DamageAttuneCap: 0,
      Smite: "0",  // Use string "0" instead of number 0
      VirtueAttuneCap: 0
    };
  }

  console.log('parseWeaponStats: Processing stats:', stats);

  // Always use lvl30 stats if available, fallback to lvl0
  const levelStats = stats.lvl30 || stats.lvl0 || {};

  // For Smite, preserve the raw string format (don't convert to number)
  const rawSmite = stats.Smite || "0";

  // Log the raw Smite value directly from stats
  console.log(`parseWeaponStats: Raw Smite value from API: "${rawSmite}"`);

  const result = {
    Stagger: extractNumericValue(levelStats.Stagger),
    Attack: extractNumericValue(levelStats.Attack),
    ChargedAttack: extractNumericValue(levelStats.ChargedAttack),
    DamageAttuneCap: extractNumericValue(levelStats.DamageAttuneCap),
    Smite: rawSmite,  // Store the raw string value
    VirtueAttuneCap: extractNumericValue(stats.VirtueAttuneCap)
  };

  console.log('parseWeaponStats: Final result:', result);
  return result;
}

// Process pact stats
export function parsePactStats(stats: any): {
  BonusHP: number;
  PhysicalDefence: number;
  MagickDefence: number;
  StabilityIncrease: number;
  UnarmedDmg: number;
  VirtueBonus: { type: string; value: number } | null;
} {
  if (!stats) {
    console.log('parsePactStats: No stats provided');
    return {
      BonusHP: 0,
      PhysicalDefence: 0,
      MagickDefence: 0,
      StabilityIncrease: 0,
      UnarmedDmg: 0,
      VirtueBonus: null
    };
  }

  console.log('parsePactStats: Processing stats:', stats);

  // Process virtue bonus
  let virtueBonus = null;
  if (stats.BonusVirtue) {
    virtueBonus = {
      type: stats.BonusVirtue.Type || 'Unknown',
      value: extractNumericValue(stats.BonusVirtue.Value)
    };
    console.log('parsePactStats: Found virtue bonus:', virtueBonus);
  }

  const result = {
    BonusHP: extractNumericValue(stats.BonusHP),
    PhysicalDefence: extractNumericValue(stats.PhysicalDefence),
    MagickDefence: extractNumericValue(stats.MagickDefence),
    StabilityIncrease: extractNumericValue(stats.StabilityIncrease),
    UnarmedDmg: extractNumericValue(stats.UnarmedDmg || stats.UnnarmedDmg), // Handle both spellings
    VirtueBonus: virtueBonus
  };

  console.log('parsePactStats: Final result:', result);
  return result;
}

// Parse mote effects and return virtue bonuses
export function parseMoteEffects(effect: string | string[] | undefined): {
  virtueBonus: { Grace: number; Spirit: number; Courage: number };
  otherEffects: string[];
  weaponBonuses: {
    attackDamage: number;
    chargedAttackDamage: number;
    smiteChancePercent: number;
  };
} {
  const virtueBonus = { Grace: 0, Spirit: 0, Courage: 0 };
  const otherEffects: string[] = [];
  const weaponBonuses = {
    attackDamage: 0,
    chargedAttackDamage: 0,
    smiteChancePercent: 0
  };

  // Handle undefined or null
  if (!effect) return { virtueBonus, otherEffects, weaponBonuses };

  // Convert single string to array for consistent processing
  const effects = Array.isArray(effect) ? effect : [effect];

  effects.forEach(effectStr => {
    // Check for virtue bonuses like "1 Grace"
    const virtueMatch = effectStr.match(/(\d+)\s+(Grace|Spirit|Courage)/i);
    if (virtueMatch) {
      const value = parseInt(virtueMatch[1], 10);
      const virtueType = virtueMatch[2].toLowerCase() as 'grace' | 'spirit' | 'courage';

      // Normalize the virtue type to match our object keys
      const normalizedType = virtueType.charAt(0).toUpperCase() + virtueType.slice(1) as keyof typeof virtueBonus;

      // Add to the correct virtue type
      if (virtueBonus[normalizedType] !== undefined) {
        virtueBonus[normalizedType] += value;
      }
    }
    // Check for "X Fully-Charged Heavy Damage"
    else if (effectStr.match(/Fully-Charged Heavy Damage/i)) {
      const damageMatch = effectStr.match(/(\d+)\s+Fully-Charged Heavy Damage/i);
      if (damageMatch) {
        const value = parseInt(damageMatch[1], 10);
        weaponBonuses.chargedAttackDamage += value;
      }
      otherEffects.push(effectStr);
    }
    // Check for "X Attack Damage" - now adds to both attack and charged attack
    else if (effectStr.match(/Attack Damage/i)) {
      const damageMatch = effectStr.match(/(\d+)\s+Attack Damage/i);
      if (damageMatch) {
        const value = parseInt(damageMatch[1], 10);
        weaponBonuses.attackDamage += value;
        weaponBonuses.chargedAttackDamage += value; // Also add to charged attack
      }
      otherEffects.push(effectStr);
    }
    // Check for "X% Smite Chance"
    else if (effectStr.match(/Smite Chance/i)) {
      const smiteMatch = effectStr.match(/(\d+(?:\.\d+)?)\s*%\s+Smite Chance/i);
      if (smiteMatch) {
        const percentValue = parseFloat(smiteMatch[1]);
        weaponBonuses.smiteChancePercent += percentValue;
      }
      otherEffects.push(effectStr);
    }
    // If not a recognized bonus, keep as other effect
    else {
      otherEffects.push(effectStr);
    }
  });

  return { virtueBonus, otherEffects, weaponBonuses };
}

/**
 * Extract Smite values from "X in Y chances" format ("x/y")
 * Correctly interprets as X successes in Y attempts
 */
export function parseSmiteValue(smiteStr: string | undefined | null): {
  numerator: number;
  denominator: number;
  percentage: number;
  display: string;
  formattedPercentage: string;
} {
  if (!smiteStr) {
    return {
      numerator: 0,
      denominator: 0,
      percentage: 0,
      display: "0",
      formattedPercentage: "0%"
    };
  }

  // Convert to string if it's not already a string
  const smiteString = String(smiteStr);

  // Debug log for raw smite value
  console.log("parseSmiteValue: Raw value from API:", smiteString);

  // Match x/y pattern (X in Y chances)
  const match = smiteString.match(/(\d+)\/(\d+)/);

  if (match) {
    const numerator = parseInt(match[1], 10);
    const denominator = parseInt(match[2], 10);

    // Calculate as X successes in Y attempts (probability)
    const percentage = denominator > 0 ? (numerator / denominator) * 100 : 0;

    const result = {
      numerator,
      denominator,
      percentage,
      display: `${numerator}/${denominator}`, // Keep exact original format
      formattedPercentage: `${percentage.toFixed(1)}%`
    };

    console.log("parseSmiteValue: Parsed result:", result);
    return result;
  }

  // If format doesn't match, try to parse as single number
  const singleNumber = parseInt(smiteString, 10);
  if (!isNaN(singleNumber)) {
    return {
      numerator: singleNumber,
      denominator: 100,
      percentage: singleNumber,
      display: String(singleNumber),
      formattedPercentage: `${singleNumber}%`
    };
  }

  // Default return if parsing fails
  console.log("parseSmiteValue: Failed to parse:", smiteString);
  return {
    numerator: 0,
    denominator: 0,
    percentage: 0,
    display: "0",
    formattedPercentage: "0%"
  };
}

// Calculate total virtue bonuses from all equipped items
export function calculateTotalVirtueBonus(
  armor: any[],
  pact: any | null,
  motes: any[]
): { Grace: number; Spirit: number; Courage: number } {
  const total = { Grace: 0, Spirit: 0, Courage: 0 };

  // Process armor (specifically totems with virtue bonuses)
  armor.forEach(item => {
    if (item?.Stats?.Virtue) {
      const virtueType = item.Stats.Virtue.Type;
      const virtueValue = extractNumericValue(item.Stats.Virtue.Value);

      if (virtueType === 'All Virtues') {
        total.Grace += virtueValue;
        total.Spirit += virtueValue;
        total.Courage += virtueValue;
      } else if (total[virtueType as keyof typeof total] !== undefined) {
        total[virtueType as keyof typeof total] += virtueValue;
      }
    }
  });

  // Process pact virtue bonus
  if (pact?.Stats?.BonusVirtue) {
    const virtueType = pact.Stats.BonusVirtue.Type;
    const virtueValue = extractNumericValue(pact.Stats.BonusVirtue.Value);

    if (virtueType === 'All Virtues') {
      total.Grace += virtueValue;
      total.Spirit += virtueValue;
      total.Courage += virtueValue;
    } else if (total[virtueType as keyof typeof total] !== undefined) {
      total[virtueType as keyof typeof total] += virtueValue;
    }
  }

  // Process motes' virtue bonuses
  motes.forEach(mote => {
    if (mote?.Effect) {
      const { virtueBonus } = parseMoteEffects(mote.Effect);
      total.Grace += virtueBonus.Grace;
      total.Spirit += virtueBonus.Spirit;
      total.Courage += virtueBonus.Courage;
    }
  });

  return total;
}

// Parse statCalculator values
export function convertStatsToConsolidated(
  armorItems: any[],
  weaponItems: any[],
  pactItem: any | null,
  motes: any[]
) {
  // Parse all armor stats
  const armorStats = armorItems.map(item => parseArmorStats(item?.Stats));

  // Parse weapon stats
  const weaponStats = weaponItems.map(item => parseWeaponStats(item?.Stats));

  // Parse pact stats
  const pactStats = pactItem ? parsePactStats(pactItem.Stats) : null;

  // Calculate physical defence (sum from armor and pact)
  const physicalDefence = armorStats.reduce((sum, stats) => sum + stats.PhysicalDefence, 0)
    + (pactStats?.PhysicalDefence || 0);

  // Calculate magick defence (sum from armor and pact)
  const magickDefence = armorStats.reduce((sum, stats) => sum + stats.MagickDefence, 0)
    + (pactStats?.MagickDefence || 0);

  // Calculate stability increase (sum from armor and pact)
  const stabilityIncrease = armorStats.reduce((sum, stats) => sum + stats.StabilityIncrease, 0)
    + (pactStats?.StabilityIncrease || 0);

  // Calculate attack power (from primary weapon if exists)
  const attackPower = weaponStats.length > 0 ? weaponStats[0].Attack : 0;

  // Calculate charged attack (from primary weapon if exists)
  const chargedAttack = weaponStats.length > 0 ? weaponStats[0].ChargedAttack : 0;

  // Calculate stagger (from primary weapon if exists)
  const stagger = weaponStats.length > 0 ? weaponStats[0].Stagger : 0;

  // Calculate bonus HP (from pact)
  const bonusHP = pactStats?.BonusHP || 0;

  // Calculate virtue values
  const virtueBonus = calculateTotalVirtueBonus(
    armorItems,
    pactItem,
    motes
  );

  return {
    physicalDefence,
    magickDefence,
    stabilityIncrease,
    attackPower,
    chargedAttack,
    stagger,
    bonusHP,
    graceValue: virtueBonus.Grace,
    spiritValue: virtueBonus.Spirit,
    courageValue: virtueBonus.Courage,
    armorPieces: armorItems.filter(Boolean).length,
    weaponsEquipped: weaponItems.filter(Boolean).length,
    hasPact: !!pactItem
  };
}
