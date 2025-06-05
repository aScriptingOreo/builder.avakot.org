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
  Smite: number;
  VirtueAttuneCap: number;
} {
  if (!stats) {
    console.log('parseWeaponStats: No stats provided');
    return {
      Stagger: 0,
      Attack: 0,
      ChargedAttack: 0,
      DamageAttuneCap: 0,
      Smite: 0,
      VirtueAttuneCap: 0
    };
  }

  console.log('parseWeaponStats: Processing stats:', stats);

  // Always use lvl30 stats if available, fallback to lvl0
  const levelStats = stats.lvl30 || stats.lvl0 || {};

  console.log('parseWeaponStats: Using level stats:', levelStats);

  const result = {
    Stagger: extractNumericValue(levelStats.Stagger),
    Attack: extractNumericValue(levelStats.Attack),
    ChargedAttack: extractNumericValue(levelStats.ChargedAttack),
    DamageAttuneCap: extractNumericValue(levelStats.DamageAttuneCap),
    Smite: extractNumericValue(stats.Smite),
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
} {
  const virtueBonus = { Grace: 0, Spirit: 0, Courage: 0 };
  const otherEffects: string[] = [];

  // Handle undefined or null
  if (!effect) return { virtueBonus, otherEffects };

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
    } else {
      // If not a virtue bonus, keep as other effect
      otherEffects.push(effectStr);
    }
  });

  return { virtueBonus, otherEffects };
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
