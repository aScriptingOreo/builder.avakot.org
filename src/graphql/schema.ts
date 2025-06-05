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
  if (!linkusAlias) return '';

  try {
    const defaultDict = await fetchData('defaultDict');
    // Find the entry where LinkusMap matches our linkusAlias
    const entry = defaultDict.find(item => item.LinkusMap === linkusAlias);

    if (entry && entry.LinkusAlias) {
      // LinkusAlias can be a string or array of strings
      if (Array.isArray(entry.LinkusAlias)) {
        // Return the first alias from the array
        return entry.LinkusAlias[0] || linkusAlias;
      } else {
        // Return the string value
        return entry.LinkusAlias || linkusAlias;
      }
    }

    // If no mapping found, return the original LinkusAlias
    return linkusAlias;
  } catch (error) {
    console.error('Error resolving display name for:', linkusAlias, error);
    return linkusAlias; // Fallback to original on error
  }
}

// Helper function to resolve crafting item names (Key:Value format)
async function resolveCraftingItemName(itemString: string): Promise<string> {
  if (!itemString) return '';

  const [key, value] = itemString.split(':');
  if (!key) return itemString;

  const displayName = await resolveDisplayName(key);
  return value ? `${displayName}:${value}` : displayName;
}

// Helper function to resolve multiple items at once (for efficiency)
async function resolveMultipleDisplayNames(linkusAliases: string[]): Promise<string[]> {
  if (!linkusAliases || linkusAliases.length === 0) return [];

  try {
    const defaultDict = await fetchData('defaultDict');

    return linkusAliases.map(linkusAlias => {
      if (!linkusAlias) return '';

      const entry = defaultDict.find(item => item.LinkusMap === linkusAlias);

      if (entry && entry.LinkusAlias) {
        if (Array.isArray(entry.LinkusAlias)) {
          return entry.LinkusAlias[0] || linkusAlias;
        } else {
          return entry.LinkusAlias || linkusAlias;
        }
      }

      return linkusAlias;
    });
  } catch (error) {
    console.error('Error resolving multiple display names:', error);
    return linkusAliases; // Return originals on error
  }
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

    # Motes Queries - Simplified
    motes: [Mote]
    weaponMotes: [Mote]
    pactMotes: [Mote]
    mote(MoteID: String!): Mote
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
    LinkusAlias: String! # This will be the REAL LinkusAlias from defaultDict
    LinkusMap: String!   # This is what the API calls "LinkusAlias" 
    DisplayName: String  # Resolved user-facing name (same as LinkusAlias)
    Slot: String
    Rarity: String
    Art: String
    DamageType: String
    Attune: AttuneInfo
    ReqVirtue: String
    Img: Image
    Stats: WeaponStats
    CraftingRecipe: CraftingRecipe
    Motes: [Mote] # Added field for associated motes
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
    LinkusAlias: String! # This will be the REAL LinkusAlias from defaultDict
    LinkusMap: String!   # This is what the API calls "LinkusAlias"
    DisplayName: String  # Resolved user-facing name (same as LinkusAlias)
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
    LinkusAlias: String! # This will be the REAL LinkusAlias from defaultDict
    LinkusMap: String!   # This is what the API calls "LinkusAlias"
    DisplayName: String  # Resolved user-facing name (same as LinkusAlias)
    Img: Image
    Stats: PactStats
    VirtueNodes: PactVirtueNodes
    CraftingRecipe: CraftingRecipe
    Motes: [Mote] # Added field for associated motes
  }

  # Crafting Recipe Types (MIC.json)
  type CraftingRecipe {
    LinkusAlias: String! # Refers to the item being crafted
    LinkusMap: String!   # This is what the API calls "LinkusAlias"
    DisplayName: String  # Resolved user-facing name
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

  # Simplified Mote Type to match API exactly
  type Mote {
    MoteID: String!
    Img: MoteImage
    Slot: String
    Effect: String
  }

  type MoteImage {
    Icon: String
  }
`;

const findCraftingRecipeByAlias = async (linkusAlias: string) => {
  const micData = await fetchData('MIC');
  return micData.find(recipe => recipe.LinkusAlias === linkusAlias) || null;
};

export const resolvers = {
  Query: {
    weapons: async () => {
      const data = await fetchData('MWS');
      const defaultDict = await fetchData('defaultDict');
      return data.map(weapon => ({
        ...weapon,
        LinkusMap: weapon.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
        _defaultDict: defaultDict
      }));
    },

    weapon: async (_: any, { LinkusAlias }: { LinkusAlias: string }) => {
      const data = await fetchData('MWS');
      // Search by what the API incorrectly calls "LinkusAlias" (which is actually LinkusMap)
      const weapon = data.find(w => w.LinkusAlias === LinkusAlias);
      if (!weapon) return null;

      const defaultDict = await fetchData('defaultDict');
      return {
        ...weapon,
        LinkusMap: weapon.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
        _defaultDict: defaultDict
      };
    },

    armors: async () => {
      const data = await fetchData('MAS');
      const defaultDict = await fetchData('defaultDict');
      return data.map(armor => ({
        ...armor,
        LinkusMap: armor.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
        _defaultDict: defaultDict
      }));
    },

    armor: async (_: any, { LinkusAlias }: { LinkusAlias: string }) => {
      const data = await fetchData('MAS');
      const armor = data.find(a => a.LinkusAlias === LinkusAlias);
      if (!armor) return null;

      const defaultDict = await fetchData('defaultDict');
      return {
        ...armor,
        LinkusMap: armor.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
        _defaultDict: defaultDict
      };
    },

    pacts: async () => {
      const data = await fetchData('MPS');
      const defaultDict = await fetchData('defaultDict');
      return data.map(pact => ({
        ...pact,
        LinkusMap: pact.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
        _defaultDict: defaultDict
      }));
    },

    // Add specific debug logs to pact query
    pact: async (_: any, { LinkusAlias }: { LinkusAlias: string }) => {
      console.log(`GraphQL: pact query for LinkusAlias: ${LinkusAlias}`);
      const data = await fetchData('MPS');
      console.log(`GraphQL: Found ${data.length} pacts in data`);

      const pact = data.find(p => p.LinkusAlias === LinkusAlias);
      if (!pact) {
        console.log(`GraphQL: No pact found for LinkusAlias: ${LinkusAlias}`);
        return null;
      }

      console.log(`GraphQL: Found pact for ${LinkusAlias}:`, pact);

      const defaultDict = await fetchData('defaultDict');
      return {
        ...pact,
        LinkusMap: pact.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
        _defaultDict: defaultDict
      };
    },

    craftingRecipes: async () => {
      const data = await fetchData('MIC');
      const defaultDict = await fetchData('defaultDict');
      return data.map(recipe => ({
        ...recipe,
        _defaultDict: defaultDict
      }));
    },

    craftingRecipe: async (_: any, { LinkusAlias }: { LinkusAlias: string }) => {
      const recipe = await findCraftingRecipeByAlias(LinkusAlias);
      if (!recipe) return null;

      const defaultDict = await fetchData('defaultDict');
      return {
        ...recipe,
        _defaultDict: defaultDict
      };
    },

    weaponsBySlot: async (_: any, { slot }: { slot: string }) => {
      const data = await fetchData('MWS'); // FIX: Added missing data fetch
      const defaultDict = await fetchData('defaultDict'); // FIX: Added missing defaultDict fetch
      return data
        .filter((w) => w.Slot === slot) // FIX: Added parentheses around arrow function parameter
        .map(weapon => ({
          ...weapon,
          LinkusMap: weapon.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
          _defaultDict: defaultDict
        }));
    },

    armorsBySlot: async (_: any, { slot }: { slot: string }) => {
      const data = await fetchData('MAS');
      const defaultDict = await fetchData('defaultDict');
      return data
        .filter(a => a.Slot === slot)
        .map(armor => ({
          ...armor,
          LinkusMap: armor.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
          _defaultDict: defaultDict
        }));
    },

    // Equipment slot-specific queries - FIX SYNTAX ERRORS
    helms: async () => {
      const data = await fetchData('MAS');
      const defaultDict = await fetchData('defaultDict');
      return data
        .filter((a) => a.Slot === 'Helm') // FIX: Added parentheses around arrow function parameter
        .map(armor => ({
          ...armor,
          LinkusMap: armor.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
          _defaultDict: defaultDict
        }));
    },

    upperBodyArmor: async () => {
      const data = await fetchData('MAS');
      const defaultDict = await fetchData('defaultDict');
      return data
        .filter((a) => a.Slot === 'UpperBody') // FIX: Added parentheses around arrow function parameter
        .map(armor => ({
          ...armor,
          LinkusMap: armor.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
          _defaultDict: defaultDict
        }));
    },

    lowerBodyArmor: async () => {
      const data = await fetchData('MAS');
      const defaultDict = await fetchData('defaultDict');
      return data
        .filter((a) => a.Slot === 'LowerBody') // FIX: Added parentheses around arrow function parameter
        .map(armor => ({
          ...armor,
          LinkusMap: armor.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
          _defaultDict: defaultDict
        }));
    },

    totems: async () => {
      const data = await fetchData('MAS');
      const defaultDict = await fetchData('defaultDict');
      return data
        .filter((a) => a.Slot === 'Totem') // FIX: Added parentheses around arrow function parameter
        .map(armor => ({
          ...armor,
          LinkusMap: armor.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
          _defaultDict: defaultDict
        }));
    },

    primaryWeapons: async () => {
      const data = await fetchData('MWS');
      const defaultDict = await fetchData('defaultDict');
      return data
        .filter((w) => w.Slot === 'Primary') // FIX: Added parentheses around arrow function parameter
        .map(weapon => ({
          ...weapon,
          LinkusMap: weapon.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
          _defaultDict: defaultDict
        }));
    },

    secondaryWeapons: async () => {
      const data = await fetchData('MWS');
      const defaultDict = await fetchData('defaultDict');
      return data
        .filter((w) => w.Slot === 'Sidearm') // FIX: Added parentheses around arrow function parameter
        .map(weapon => ({
          ...weapon,
          LinkusMap: weapon.LinkusAlias, // What API calls "LinkusAlias" is actually LinkusMap
          _defaultDict: defaultDict
        }));
    },

    defaultDict: async () => await fetchData('defaultDict'),
    resolveDisplayName: async (_: any, { linkusAlias }: { linkusAlias: string }) =>
      await resolveDisplayName(linkusAlias),

    item: async (_: any, { LinkusAlias }: { LinkusAlias: string }) => {
      const defaultDict = await fetchData('defaultDict');

      let itemData = (await fetchData('MWS')).find(w => w.LinkusAlias === LinkusAlias);
      if (itemData) return { __typename: 'Weapon', ...itemData, _defaultDict: defaultDict };

      itemData = (await fetchData('MAS')).find(a => a.LinkusAlias === LinkusAlias);
      if (itemData) return { __typename: 'Armor', ...itemData, _defaultDict: defaultDict };

      itemData = (await fetchData('MPS')).find(p => p.LinkusAlias === LinkusAlias);
      if (itemData) return { __typename: 'Pact', ...itemData, _defaultDict: defaultDict };

      return null;
    },

    // Simplified Motes resolvers
    motes: async () => {
      // Direct passthrough from API
      return fetchData('Motes');
    },

    weaponMotes: async () => {
      const motes = await fetchData('Motes');
      return motes.filter((mote: any) => mote.Slot === 'Weapons');
    },

    pactMotes: async () => {
      const motes = await fetchData('Motes');
      return motes.filter((mote: any) => mote.Slot === 'Pacts');
    },

    mote: async (_: any, { MoteID }: { MoteID: string }) => {
      const motes = await fetchData('Motes');
      return motes.find((mote: any) => mote.MoteID === MoteID);
    }
  },

  Armor: {
    // FIX: Simplify DisplayName resolver and add better debugging
    DisplayName: (parent: { LinkusAlias?: string; LinkusMap?: string; _defaultDict?: any[] }) => {
      // Use LinkusMap if available (the corrected API value), otherwise fall back to LinkusAlias
      const linkusMapValue = parent.LinkusMap || parent.LinkusAlias;

      console.log(`Armor DisplayName resolver - LinkusAlias: ${parent.LinkusAlias}, LinkusMap: ${parent.LinkusMap}, using: ${linkusMapValue}`);

      if (!linkusMapValue) {
        console.log('Armor DisplayName: No LinkusAlias or LinkusMap provided');
        return '';
      }

      if (parent._defaultDict && Array.isArray(parent._defaultDict)) {
        //console.log(`Searching in defaultDict with ${parent._defaultDict.length} entries for: ${linkusMapValue}`);

        const entry = parent._defaultDict.find(item => item.LinkusMap === linkusMapValue);

        if (entry && entry.LinkusAlias) {
          const resolved = Array.isArray(entry.LinkusAlias) ? entry.LinkusAlias[0] : entry.LinkusAlias;
          //console.log(`Armor DisplayName resolved: ${linkusMapValue} -> ${resolved}`);
          return resolved;
        } else {
          //console.log(`Armor DisplayName: No mapping found for ${linkusMapValue} in defaultDict`);
          // Log a few sample entries for debugging
          if (parent._defaultDict.length > 0) {
            //console.log('Sample defaultDict entries:', parent._defaultDict.slice(0, 3).map(e => ({ LinkusMap: e.LinkusMap, LinkusAlias: e.LinkusAlias })));
          }
        }
      } else {
        //console.log('Armor DisplayName: No defaultDict available or not an array');
      }

      //console.log(`Armor DisplayName fallback: ${linkusMapValue}`);
      return linkusMapValue;
    },

    // Keep LinkusAlias as the resolved name too, for consistency
    LinkusAlias: (parent: { LinkusAlias?: string; LinkusMap?: string; _defaultDict?: any[] }) => {
      const linkusMapValue = parent.LinkusMap || parent.LinkusAlias;
      if (!linkusMapValue || !parent._defaultDict) return linkusMapValue || '';

      const entry = parent._defaultDict.find(item => item.LinkusMap === linkusMapValue);
      if (entry && entry.LinkusAlias) {
        return Array.isArray(entry.LinkusAlias) ? entry.LinkusAlias[0] : entry.LinkusAlias;
      }

      return linkusMapValue;
    },

    CraftingRecipe: async (parent: { LinkusAlias: string; _defaultDict?: any[] }) => {
      const recipe = await findCraftingRecipeByAlias(parent.LinkusAlias);
      if (!recipe) return null;

      return {
        ...recipe,
        _defaultDict: parent._defaultDict
      };
    },
  },

  Weapon: {
    DisplayName: (parent: { LinkusAlias?: string; LinkusMap?: string; _defaultDict?: any[] }) => {
      // Use LinkusMap if available (the corrected API value), otherwise fall back to LinkusAlias
      const linkusMapValue = parent.LinkusMap || parent.LinkusAlias;

      //
      if (!linkusMapValue) {
        //console.log('Weapon DisplayName: No LinkusAlias or LinkusMap provided');
        return '';
      }

      if (parent._defaultDict && Array.isArray(parent._defaultDict)) {
        console.log(`Searching in defaultDict with ${parent._defaultDict.length} entries for: ${linkusMapValue}`);

        const entry = parent._defaultDict.find(item => item.LinkusMap === linkusMapValue);

        if (entry && entry.LinkusAlias) {
          const resolved = Array.isArray(entry.LinkusAlias) ? entry.LinkusAlias[0] : entry.LinkusAlias;
          //console.log(`Weapon DisplayName resolved: ${linkusMapValue} -> ${resolved}`);
          return resolved;
        } else {
          //console.log(`Weapon DisplayName: No mapping found for ${linkusMapValue} in defaultDict`);
          // Log a few sample entries for debugging
          if (parent._defaultDict.length > 0) {
            //console.log('Sample defaultDict entries:', parent._defaultDict.slice(0, 3).map(e => ({ LinkusMap: e.LinkusMap, LinkusAlias: e.LinkusAlias })));
          }
        }
      } else {
        //console.log('Weapon DisplayName: No defaultDict available or not an array');
      }

      //console.log(`Weapon DisplayName fallback: ${linkusMapValue}`);
      return linkusMapValue;
    },

    LinkusAlias: (parent: { LinkusAlias?: string; LinkusMap?: string; _defaultDict?: any[] }) => {
      const linkusMapValue = parent.LinkusMap || parent.LinkusAlias;
      if (!linkusMapValue || !parent._defaultDict) return linkusMapValue || '';

      const entry = parent._defaultDict.find(item => item.LinkusMap === linkusMapValue);
      if (entry && entry.LinkusAlias) {
        return Array.isArray(entry.LinkusAlias) ? entry.LinkusAlias[0] : entry.LinkusAlias;
      }

      return linkusMapValue;
    },

    CraftingRecipe: async (parent: { LinkusAlias: string; _defaultDict?: any[] }) => {
      const recipe = await findCraftingRecipeByAlias(parent.LinkusAlias);
      if (!recipe) return null;

      return {
        ...recipe,
        _defaultDict: parent._defaultDict
      };
    },

    // Simplified Motes resolver for Weapon
    Motes: async () => {
      return []; // For now, just return empty array
    },
  },

  Pact: {
    // FIX: Apply same logic to Pact resolvers
    DisplayName: (parent: { LinkusAlias?: string; LinkusMap?: string; _defaultDict?: any[] }) => {
      const linkusMapValue = parent.LinkusMap || parent.LinkusAlias;

      if (!linkusMapValue) return '';

      if (parent._defaultDict && Array.isArray(parent._defaultDict)) {
        const entry = parent._defaultDict.find(item => item.LinkusMap === linkusMapValue);

        if (entry && entry.LinkusAlias) {
          const resolved = Array.isArray(entry.LinkusAlias) ? entry.LinkusAlias[0] : entry.LinkusAlias;
          //console.log(`Pact DisplayName resolved: ${linkusMapValue} -> ${resolved}`);
          return resolved;
        }
      }

      return linkusMapValue;
    },

    LinkusAlias: (parent: { LinkusAlias?: string; LinkusMap?: string; _defaultDict?: any[] }) => {
      const linkusMapValue = parent.LinkusMap || parent.LinkusAlias;
      if (!linkusMapValue || !parent._defaultDict) return linkusMapValue || '';

      const entry = parent._defaultDict.find(item => item.LinkusMap === linkusMapValue);
      if (entry && entry.LinkusAlias) {
        return Array.isArray(entry.LinkusAlias) ? entry.LinkusAlias[0] : entry.LinkusAlias;
      }

      return linkusMapValue;
    },

    Stats: (parent: any) => ({ // Handle typo UnnarmedDmg -> UnarmedDmg
      ...parent.Stats,
      UnarmedDmg: parent.Stats.UnnarmedDmg, // Map from JSON
    }),

    // Simplified Motes resolver for Pact
    Motes: async () => {
      return []; // For now, just return empty array
    },
  },

  CraftingRecipe: {
    DisplayName: (parent: { LinkusAlias: string; _defaultDict?: any[] }) => {
      if (!parent.LinkusAlias) return '';

      if (parent._defaultDict) {
        const entry = parent._defaultDict.find(item => item.LinkusMap === parent.LinkusAlias);
        if (entry && entry.LinkusAlias) {
          return Array.isArray(entry.LinkusAlias) ? entry.LinkusAlias[0] : entry.LinkusAlias;
        }
      }

      return parent.LinkusAlias;
    },

    ResolvedItems: (parent: { Item?: string[]; _defaultDict?: any[] }) => {
      if (!parent.Item || !parent._defaultDict) return [];

      return parent.Item.map(item => {
        if (!item) return '';

        const [key, value] = item.split(':');
        if (!key) return item;

        // Resolve the key part using defaultDict
        const entry = parent._defaultDict!.find(dictItem => dictItem.LinkusMap === key);
        let displayName = key; // Fallback

        if (entry && entry.LinkusAlias) {
          displayName = Array.isArray(entry.LinkusAlias) ? entry.LinkusAlias[0] : entry.LinkusAlias;
        }

        return value ? `${displayName}:${value}` : displayName;
      });
    },
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
