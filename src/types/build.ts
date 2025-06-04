// Define interfaces for the item properties we need

export interface VirtueStat {
  Type: string;
  Value: string;
}

export interface ArmorStats {
  PhysicalDefence?: string;
  MagickDefence?: string;
  StabilityIncrease?: string;
  Virtue?: VirtueStat; // For totems
}

export interface WeaponStatsLevel {
  Attack?: string;
  ChargedAttack?: string;
  Stagger?: string;
  DamageAttuneCap?: string;
}

export interface WeaponStats {
  lvl0?: WeaponStatsLevel;
  lvl30?: WeaponStatsLevel;
  Smite?: string;
  VirtueAttuneCap?: string;
}

export interface PactStats {
  BonusHP?: string;
  BonusVirtue?: VirtueStat;
  UnarmedDmg?: string;
  MagickDefence?: string;
  PhysicalDefence?: string;
  StabilityIncrease?: string;
}

export interface ItemImage {
  Preview?: string;
  Icon?: string;
  Ingame?: string;
}

export interface ArmorItem {
  LinkusAlias: string;
  DisplayName?: string;
  Slot?: string;
  Set?: string;
  Img?: ItemImage;
  Stats?: ArmorStats;
}

export interface MoteItem {
  MoteID: string;
  DisplayName?: string;
  Img?: {
    Icon?: string;
  };
  Effect?: string | string[];
  Slot?: string; // Important: "Weapons" or "Pacts"
}

export interface WeaponItem {
  LinkusAlias: string;
  DisplayName?: string;
  Slot?: string;
  Art?: string;
  Rarity?: string;
  Img?: ItemImage;
  Stats?: WeaponStats;
  Motes?: MoteItem[]; // Motes for weapons
}

export interface PactItem {
  LinkusAlias: string;
  DisplayName?: string;
  Img?: ItemImage;
  Stats?: PactStats;
  Motes?: MoteItem[]; // Motes for pacts
}

export type EquipmentItem = ArmorItem | WeaponItem | PactItem;

export interface SelectedItems {
  helm: ArmorItem | null;
  upperBody: ArmorItem | null;
  lowerBody: ArmorItem | null;
  totem: ArmorItem | null;
  primary: WeaponItem | null;
  sidearm: WeaponItem | null;
  pact: PactItem | null;
}

export interface BuildStats {
  totalPhysicalDefence: number;
  totalMagickDefence: number;
  totalStabilityIncrease: number;
  virtueBonus: {
    Order: number;
    Grace: number;
    Spirit: number;
    Courage: number;
  };
  bonusHP: number;
}
