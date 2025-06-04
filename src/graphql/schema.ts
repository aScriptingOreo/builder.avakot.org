const API_BASE_URL = 'https://wiki.avakot.org/linkus';

// Helper function to fetch data from an endpoint
async function fetchData(endpoint: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) {
      console.error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
      // Attempt to read error body if available
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (e) {
        // ignore if error body cannot be read
      }
      console.error(`Error body: ${errorBody}`);
      throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
    }
    // Assuming the API always returns JSON, even if it's an empty array for no data
    const data = await response.json();
    return Array.isArray(data) ? data : []; // Ensure it's an array
  } catch (error) {
    console.error(`Error fetching or parsing ${endpoint}:`, error);
    return []; // Return empty array on error to prevent resolver crashes
  }
}


// Helper function to resolve LinkusAlias to user-facing name using defaultDict
async function resolveDisplayName(linkusAlias: string): Promise<string> {
  try {
    const defaultDict = await fetchData('defaultDict');
    const entry = defaultDict.find(item => item.LinkusMap === linkusAlias);
    if (entry && entry.LinkusAlias) {
      // Return first alias if it's an array, otherwise return the string
      return Array.isArray(entry.LinkusAlias) ? entry.LinkusAlias[0] : entry.LinkusAlias;
    }
    return linkusAlias; // Fallback to original if not found
  } catch (error) {
    console.error('Error resolving display name:', error);
    return linkusAlias;
  }
}

// Helper function to resolve crafting item names (Key:Value format)
async function resolveCraftingItemName(itemString: string): Promise<string> {
  const [key, value] = itemString.split(':');
  if (!key) return itemString;

  const displayName = await resolveDisplayName(key);
  return value ? `${displayName}:${value}` : displayName;
}

export const typeDefs = `
  type Query {
    weapons: [Weapon]
    weapon(LinkusAlias: String!): Weapon
    weaponsBySlot(slot: String!): [Weapon] # Primary, Secondary, etc.

    armors: [Armor]
    armor(LinkusAlias: String!): Armor
    armorsBySlot(slot: String!): [Armor] # Helm, UpperBody, LowerBody, Totem

    pacts: [Pact]
    pact(LinkusAlias: String!): Pact

    craftingRecipes: [CraftingRecipe]
    craftingRecipe(LinkusAlias: String!): CraftingRecipe

    # Equipment slot queries for buildcrafting
    helms: [Armor]
    upperBodyArmor: [Armor]
    lowerBodyArmor: [Armor]
    totems: [Armor]
    primaryWeapons: [Weapon]
    secondaryWeapons: [Weapon]

    item(LinkusAlias: String!): ItemUnion

    # DefaultDict queries for name resolution
    defaultDict: [DictEntry]
    resolveDisplayName(linkusAlias: String!): String
  }

  union ItemUnion = Weapon | Armor | Pact

  # Common Types
  type Image {
    Icon: String
    Ingame: String
    Preview: String
    AltPreview: String
    AltIngame: String
  }

  # Weapon Types (MWS.json)
  type AttuneInfo {
    Virtue: String
    Tier: String
  }

  type WeaponStatsLvl {
    Stagger: String
    Attack: String
    ChargedAttack: String
    DamageAttuneCap: String
  }

  type WeaponStats {
    Smite: String
    lvl0: WeaponStatsLvl
    lvl30: WeaponStatsLvl
    VirtueAttuneCap: String
  }

  type Weapon {
    LinkusAlias: String!
    DisplayName: String # Resolved user-facing name
    Slot: String
    Rarity: String
    Art: String
    DamageType: String
    Attune: AttuneInfo
    ReqVirtue: String
    Img: Image
    Stats: WeaponStats
    CraftingRecipe: CraftingRecipe
  }

  # Armor Types (MAS.json)
  type ArmorVirtueBonus {
    Type: String
    Value: String
  }

  type ArmorStats {
    MagickDefence: String
    PhysicalDefence: String
    StabilityIncrease: String
    Virtue: ArmorVirtueBonus # Specific to Totems
  }

  type Armor {
    LinkusAlias: String!
    DisplayName: String # Resolved user-facing name
    Slot: String # Helm, UpperBody, LowerBody, Totem
    Set: String
    Img: Image
    Tags: String
    Stats: ArmorStats
    CraftingRecipe: CraftingRecipe
  }

  # Pact Types (MPS.json)
  type PactBonusVirtue {
    Type: String
    Value: String
  }

  type PactStats {
    BonusHP: String
    BonusVirtue: PactBonusVirtue
    UnarmedDmg: String # Corrected typo from UnnarmedDmg
    MagickDefence: String
    PhysicalDefence: String
    StabilityIncrease: String
  }

  type PactVirtueNodes {
    Order: [String]
    Grace: String
    Spirit: String
    Courage: String
  }

  type Pact {
    LinkusAlias: String!
    DisplayName: String # Resolved user-facing name
    Img: Image
    Stats: PactStats
    VirtueNodes: PactVirtueNodes
    CraftingRecipe: CraftingRecipe
  }

  # Crafting Recipe Types (MIC.json)
  type CraftingRecipe {
    LinkusAlias: String! # Refers to the item being crafted
    DisplayName: String # Resolved user-facing name
    ItemType: String
    Item: [String] # e.g., ["Scrap Iron:15"]
    ResolvedItems: [String] # Items with resolved names
    Fragments: String
    JoineryType: String
    JoineryTypeLink: [String]
    JoineryCost: String
    Cost: String # e.g., "Dracs:1500"
    Time: String
    BondReq: String
  }

  # DefaultDict Types
  type DictEntry {
    LinkusMap: String!
    LinkusAlias: [String] # Can be string or array of strings
  }
`;

const findCraftingRecipeByAlias = async (linkusAlias: string) => {
  const micData = await fetchData('MIC');
  return micData.find(recipe => recipe.LinkusAlias === linkusAlias) || null;
};

export const resolvers = {
  Query: {
    weapons: async () => await fetchData('MWS'),
    weapon: async (_: any, { LinkusAlias }: { LinkusAlias: string }) => {
      const data = await fetchData('MWS');
      return data.find(w => w.LinkusAlias === LinkusAlias) || null;
    },

    armors: async () => await fetchData('MAS'),
    armor: async (_: any, { LinkusAlias }: { LinkusAlias: string }) => {
      const data = await fetchData('MAS');
      return data.find(a => a.LinkusAlias === LinkusAlias) || null;
    },

    pacts: async () => await fetchData('MPS'),
    pact: async (_: any, { LinkusAlias }: { LinkusAlias: string }) => {
      const data = await fetchData('MPS');
      return data.find(p => p.LinkusAlias === LinkusAlias) || null;
    },

    craftingRecipes: async () => await fetchData('MIC'),
    craftingRecipe: async (_: any, { LinkusAlias }: { LinkusAlias: string }) =>
      await findCraftingRecipeByAlias(LinkusAlias),

    weaponsBySlot: async (_: any, { slot }: { slot: string }) => {
      const data = await fetchData('MWS');
      return data.filter(w => w.Slot === slot);
    },

    armorsBySlot: async (_: any, { slot }: { slot: string }) => {
      const data = await fetchData('MAS');
      return data.filter(a => a.Slot === slot);
    },

    // Equipment slot-specific queries
    helms: async () => {
      const data = await fetchData('MAS');
      return data.filter(a => a.Slot === 'Helm');
    },

    upperBodyArmor: async () => {
      const data = await fetchData('MAS');
      return data.filter(a => a.Slot === 'UpperBody');
    },

    lowerBodyArmor: async () => {
      const data = await fetchData('MAS');
      return data.filter(a => a.Slot === 'LowerBody');
    },

    totems: async () => {
      const data = await fetchData('MAS');
      return data.filter(a => a.Slot === 'Totem');
    },

    primaryWeapons: async () => {
      const data = await fetchData('MWS');
      return data.filter(w => w.Slot === 'Primary');
    },

    secondaryWeapons: async () => {
      const data = await fetchData('MWS');
      return data.filter(w => w.Slot === 'Secondary');
    },

    defaultDict: async () => await fetchData('defaultDict'),
    resolveDisplayName: async (_: any, { linkusAlias }: { linkusAlias: string }) =>
      await resolveDisplayName(linkusAlias),

    item: async (_: any, { LinkusAlias }: { LinkusAlias: string }) => {
      let itemData = (await fetchData('MWS')).find(w => w.LinkusAlias === LinkusAlias);
      if (itemData) return { __typename: 'Weapon', ...itemData };

      itemData = (await fetchData('MAS')).find(a => a.LinkusAlias === LinkusAlias);
      if (itemData) return { __typename: 'Armor', ...itemData };

      itemData = (await fetchData('MPS')).find(p => p.LinkusAlias === LinkusAlias);
      if (itemData) return { __typename: 'Pact', ...itemData };

      return null;
    }
  },
  Weapon: {
    DisplayName: async (parent: { LinkusAlias: string }) => await resolveDisplayName(parent.LinkusAlias),
    CraftingRecipe: async (parent: { LinkusAlias: string }) => await findCraftingRecipeByAlias(parent.LinkusAlias),
  },
  Armor: {
    DisplayName: async (parent: { LinkusAlias: string }) => await resolveDisplayName(parent.LinkusAlias),
    CraftingRecipe: async (parent: { LinkusAlias: string }) => await findCraftingRecipeByAlias(parent.LinkusAlias),
  },
  Pact: {
    DisplayName: async (parent: { LinkusAlias: string }) => await resolveDisplayName(parent.LinkusAlias),
    CraftingRecipe: async (parent: { LinkusAlias: string }) => await findCraftingRecipeByAlias(parent.LinkusAlias),
    Stats: (parent: any) => ({ // Handle typo UnnarmedDmg -> UnarmedDmg
      ...parent.Stats,
      UnarmedDmg: parent.Stats.UnnarmedDmg, // Map from JSON
    }),
  },
  CraftingRecipe: {
    DisplayName: async (parent: { LinkusAlias: string }) => await resolveDisplayName(parent.LinkusAlias),
    ResolvedItems: async (parent: { Item?: string[] }) => {
      if (!parent.Item) return [];
      const resolvedItems = await Promise.all(
        parent.Item.map(item => resolveCraftingItemName(item))
      );
      return resolvedItems;
    },
  },
  ItemUnion: {
    __resolveType(obj: any, context: any, info: any) {
      if (obj.__typename) return obj.__typename; // __typename is injected by the 'item' resolver
      // Fallback logic (should not be strictly necessary if __typename is always provided)
      if (obj.Art && obj.DamageType !== undefined) return 'Weapon';
      if (obj.Set !== undefined && obj.Slot !== undefined) return 'Armor';
      if (obj.VirtueNodes !== undefined && obj.Stats && obj.Stats.BonusHP !== undefined) return 'Pact';
      return null;
    }
  },
  // Resolvers for specific fields within Image, Stats, etc. can be added if direct mapping is not sufficient
  // or if transformations are needed (e.g. parsing "1/20" into structured data).
  // For now, we assume direct mapping for most sub-fields.
};

// To use this, you would typically combine typeDefs and resolvers
// with a library like @graphql-tools/schema to create an executable schema:
//
// import { makeExecutableSchema } from '@graphql-tools/schema';
// const schema = makeExecutableSchema({ typeDefs, resolvers });
//
// This schema can then be used with Apollo Server, express-graphql, or other GraphQL server implementations.
