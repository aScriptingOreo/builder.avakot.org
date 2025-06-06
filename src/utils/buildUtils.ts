import { SelectedItems } from "../types/build";

/**
 * Interface for simplified build data for export/import
 * Only stores the essential identifiers needed to re-fetch the items
 */
interface SimplifiedBuild {
  helm?: string | null;
  upperBody?: string | null;
  lowerBody?: string | null;
  totem?: string | null;
  primary?: {
    item: string;
    motes?: (string | null)[];
  } | null;
  sidearm?: {
    item: string;
    motes?: (string | null)[];
  } | null;
  pact?: {
    item: string;
    motes?: (string | null)[];
  } | null;
}

interface PlayerStatsExport {
  masteryRank: number;
  virtuePoints: {
    grace: number;
    spirit: number;
    courage: number;
  };
}

interface FullBuildExport {
  equipment: SimplifiedBuild;
  playerStats: PlayerStatsExport;
}

/**
 * Serializes the build to a simplified format for export
 * @param selectedItems The current build items
 * @returns A simplified representation of the build with just IDs
 */
export const serializeBuild = (
  selectedItems: SelectedItems,
  playerStats: PlayerStatsExport
): FullBuildExport => {
  const simplified: SimplifiedBuild = {};

  // Process each slot
  Object.entries(selectedItems).forEach(([slot, item]) => {
    // Skip null items
    if (!item) {
      simplified[slot as keyof SimplifiedBuild] = null;
      return;
    }

    // For slots with motes (weapons, pact)
    if (["primary", "sidearm", "pact"].includes(slot)) {
      const moteSlot = slot as "primary" | "sidearm" | "pact";

      // Extract motes if they exist
      const motes = item.Motes ?
        item.Motes.map(mote => mote ? mote.MoteID : null) :
        [];

      simplified[moteSlot] = {
        item: item.LinkusMap, // Store the LinkusMap for lookup
        ...(motes.length > 0 && { motes }) // Only include motes if there are any
      };
    } else {
      // For regular armor slots, just store the LinkusMap
      simplified[slot as keyof SimplifiedBuild] = item.LinkusMap;
    }
  });

  return {
    equipment: simplified,
    playerStats
  };
};

/**
 * Converts a simplified build to a base64-encoded string
 * @param build The simplified build object
 * @returns Base64-encoded string representing the build
 */
export const buildToString = (build: FullBuildExport): string => {
  try {
    const json = JSON.stringify(build);
    return btoa(encodeURIComponent(json));
  } catch (error) {
    console.error("Error encoding build:", error);
    return "";
  }
};

/**
 * Parses a base64-encoded build string back to a simplified build object
 * @param str The base64-encoded build string
 * @returns The simplified build object or null if parsing fails
 */
export const parseBuildString = (str: string): FullBuildExport | null => {
  try {
    const json = decodeURIComponent(atob(str.trim()));
    const parsed = JSON.parse(json);
    return parsed;
  } catch (error) {
    console.error("Error decoding build string:", error);
    return null;
  }
};

/**
 * Fetches a GraphQL item based on its LinkusMap
 * @param linkusMap The item's LinkusMap identifier
 * @param itemType The type of item (armor, weapon, pact)
 */
const fetchItem = async (
  linkusMap: string,
  itemType: "armor" | "weapon" | "pact"
): Promise<any | null> => {
  console.log(`Fetching ${itemType} with LinkusMap: ${linkusMap}`);

  // Important: Our GraphQL schema looks up items by LinkusAlias but it's actually the LinkusMap
  // This is a mismatch in naming from the original data source
  const query = `
    query GetItem {
      ${itemType}(LinkusAlias: "${linkusMap}") {
        LinkusAlias
        LinkusMap
        DisplayName
        Slot
        ${itemType === "weapon" ?
      "Art Rarity Stats { Smite lvl0 { Stagger Attack ChargedAttack DamageAttuneCap } lvl30 { Stagger Attack ChargedAttack DamageAttuneCap } VirtueAttuneCap }" :
      itemType === "armor" ?
        "Set Stats { MagickDefence PhysicalDefence StabilityIncrease Virtue { Type Value } }" :
        "Stats { BonusHP BonusVirtue { Type Value } UnarmedDmg MagickDefence PhysicalDefence StabilityIncrease }"
    }
        Img {
          Preview
          Icon
        }
      }
    }
  `;

  try {
    console.log(`Sending GraphQL query for ${itemType}:`, query);
    const response = await fetch("/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error fetching ${itemType}:`, response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log(`GraphQL result for ${itemType}:`, result);

    if (result.errors) {
      console.error(`GraphQL errors fetching ${itemType}:`, result.errors);
      throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(", ")}`);
    }

    const dataKey = itemType; // The response will have a key matching the query name
    return result.data[dataKey];
  } catch (error) {
    console.error(`Error fetching ${itemType} (${linkusMap}):`, error);
    return null;
  }
};

/**
 * Fetches a mote based on its MoteID
 * @param moteId The mote's unique identifier
 */
const fetchMote = async (moteId: string): Promise<any | null> => {
  console.log(`Fetching mote with MoteID: ${moteId}`);

  const query = `
    query GetMote {
      mote(MoteID: "${moteId}") {
        MoteID
        Img {
          Icon
        }
        Slot
        Effect
      }
    }
  `;

  try {
    console.log("Sending GraphQL query for mote:", query);
    const response = await fetch("/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HTTP error fetching mote:", response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log("GraphQL result for mote:", result);

    if (result.errors) {
      console.error("GraphQL errors fetching mote:", result.errors);
      throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(", ")}`);
    }

    return result.data.mote;
  } catch (error) {
    console.error(`Error fetching mote (${moteId}):`, error);
    return null;
  }
};

/**
 * Restore a full build from a simplified build object
 * @param simplifiedBuild The simplified build with only identifiers
 * @returns Promise resolving to a complete build with full item data
 */
export const restoreBuildFromIdentifiers = async (
  build: FullBuildExport
): Promise<{ selectedItems: SelectedItems; playerStats: PlayerStatsExport }> => {
  const simplifiedBuild = build.equipment;
  const playerStats = build.playerStats;
  const restoredBuild: SelectedItems = {
    helm: null,
    upperBody: null,
    lowerBody: null,
    totem: null,
    primary: null,
    sidearm: null,
    pact: null,
  };

  // Process basic armor slots
  const armorSlots = ["helm", "upperBody", "lowerBody", "totem"] as const;
  for (const slot of armorSlots) {
    const linkusMap = simplifiedBuild[slot];
    if (linkusMap) {
      console.log(`Restoring armor slot ${slot} with LinkusMap: ${linkusMap}`);
      restoredBuild[slot] = await fetchItem(linkusMap, "armor");
      console.log(`Restored armor item for ${slot}:`, restoredBuild[slot]);
    }
  }

  // Handle weapon slots with their motes
  const weaponSlots = ["primary", "sidearm"] as const;
  for (const slot of weaponSlots) {
    const slotData = simplifiedBuild[slot];
    if (!slotData) continue;

    console.log(`Restoring weapon slot ${slot} with item: ${slotData.item}`);

    // Fetch the weapon
    const weapon = await fetchItem(slotData.item, "weapon");
    if (!weapon) {
      console.error(`Failed to fetch weapon for ${slot}: ${slotData.item}`);
      continue;
    }

    // Initialize motes array if not present
    if (!weapon.Motes) {
      weapon.Motes = [];
    }

    // Fetch motes if present
    if (slotData.motes && slotData.motes.length > 0) {
      console.log(`Fetching ${slotData.motes.length} motes for ${slot}`);
      const fetchedMotes = await Promise.all(
        slotData.motes.map(async (moteId) => {
          if (!moteId) return null;
          const mote = await fetchMote(moteId);
          console.log(`Fetched mote for ${slot}: ${moteId}`, mote);
          return mote;
        })
      );

      weapon.Motes = fetchedMotes;
    }

    restoredBuild[slot] = weapon;
    console.log(`Restored weapon for ${slot}:`, restoredBuild[slot]);
  }

  // Handle the pact slot separately
  const pactData = simplifiedBuild.pact;
  if (pactData) {
    console.log(`Restoring pact with item: ${pactData.item}`);

    // Fetch the pact using a specific query
    const pact = await fetchItem(pactData.item, "pact");
    if (!pact) {
      console.error(`Failed to fetch pact: ${pactData.item}`);
    } else {
      // Initialize motes array if not present
      if (!pact.Motes) {
        pact.Motes = [];
      }

      // Fetch pact motes if present
      if (pactData.motes && pactData.motes.length > 0) {
        console.log(`Fetching ${pactData.motes.length} motes for pact`);
        const fetchedMotes = await Promise.all(
          pactData.motes.map(async (moteId) => {
            if (!moteId) return null;
            const mote = await fetchMote(moteId);
            console.log(`Fetched mote for pact: ${moteId}`, mote);
            return mote;
          })
        );

        pact.Motes = fetchedMotes;
      }

      restoredBuild.pact = pact;
      console.log("Restored pact:", restoredBuild.pact);
    }
  }

  console.log("Final restored build:", restoredBuild);
  return { selectedItems: restoredBuild, playerStats };
};

/**
 * Determines the appropriate item type based on the slot name
 * @param slotName The name of the slot (e.g., "helm", "primary", "pact")
 * @returns The item type for GraphQL queries
 */
const getItemTypeFromSlot = (slotName: string): "armor" | "weapon" | "pact" => {
  if (slotName === "pact") return "pact";
  if (["primary", "sidearm"].includes(slotName)) return "weapon";
  return "armor";
};
