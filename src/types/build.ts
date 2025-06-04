export interface SelectedItems {
  helm: any | null;
  upperBody: any | null;
  lowerBody: any | null;
  totem: any | null;
  primary: any | null;
  sidearm: any | null;
  pact: any | null;
}

export interface BuildStats {
  totalPhysicalDefence: number;
  totalMagickDefence: number;
  totalStabilityIncrease: number;
  totalBonusHP: number;
  virtueBonus: {
    Grace: number;
    Spirit: number;
    Courage: number;
  };
  weaponStats?: {
    primary?: any;
    sidearm?: any;
  };
}

export interface ItemSlot {
  name: string;
  slot: keyof SelectedItems;
  category: 'armor' | 'weapon' | 'pact';
  endpoint: string;
}

export interface ItemWithDisplayName {
  LinkusAlias: string;
  DisplayName?: string;
  [key: string]: any;
}

export interface DictEntry {
  LinkusMap: string;
  LinkusAlias: string | string[];
}
