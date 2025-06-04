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
  virtueBonus: {
    Order: number;
    Grace: number;
    Spirit: number;
    Courage: number;
  };
  bonusHP: number;
}
