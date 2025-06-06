import BuildShareTools from "@components/BuildShareTools";
import BuildSummaryText from "@components/BuildSummaryText";
import ItemSelector from "@components/ItemSelector";
import StatsDisplay from "@components/StatsDisplay";
import { SelectedItems } from "@types/build";
import localforage from "localforage";
import React, { useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";

interface MoteItem {
  MoteID: string;
  DisplayName?: string;
  Img?: {
    Icon?: string;
  };
  Effect?: string | string[];
  Slot?: string;
}

interface EquipmentItem {
  // ...existing properties...
  Motes?: MoteItem[];
}

const App: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({
    helm: null,
    upperBody: null,
    lowerBody: null,
    totem: null,
    primary: null,
    sidearm: null,
    pact: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load saved build from localStorage on component mount
  useEffect(() => {
    const loadSavedBuild = async () => {
      try {
        const savedBuild = await localforage.getItem<SelectedItems>(
          "soulframe-build"
        );
        if (savedBuild) {
          setSelectedItems(savedBuild);
        }
      } catch (error) {
        console.error("Error loading saved build:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedBuild();
  }, []);

  // Save build to localStorage whenever selectedItems changes
  useEffect(() => {
    if (!isLoading) {
      const saveBuild = async () => {
        try {
          await localforage.setItem("soulframe-build", selectedItems);
        } catch (error) {
          console.error("Error saving build:", error);
        }
      };

      saveBuild();
    }
  }, [selectedItems, isLoading]);

  const handleItemSelect = (slot: keyof SelectedItems, item: any) => {
    console.log(`App: Selecting item for ${slot}:`, item);
    setSelectedItems((prev) => ({
      ...prev,
      [slot]: item,
    }));
  };

  const handleItemRemove = (slot: keyof SelectedItems) => {
    console.log(`App: Removing item from ${slot}`);
    setSelectedItems((prev) => ({
      ...prev,
      [slot]: null,
    }));
  };

  const handleMoteSelect = (
    slot: keyof SelectedItems,
    moteIndex: number,
    mote: MoteItem
  ) => {
    console.log(
      `App: handleMoteSelect called - slot: ${slot}, moteIndex: ${moteIndex}, mote:`,
      mote
    );

    if (!selectedItems[slot]) {
      console.log(`App: No item selected in slot ${slot}`);
      return;
    }

    // Validate that the mote's slot type matches the equipment type
    const isWeaponSlot = slot === "primary" || slot === "sidearm";
    const isPactSlot = slot === "pact";

    const validMoteType =
      (isWeaponSlot && mote.Slot === "Weapons") ||
      (isPactSlot && mote.Slot === "Pacts");

    if (!validMoteType) {
      console.warn(`Invalid mote type: ${mote.Slot} for slot ${slot}`);
      alert(`This mote cannot be used with this equipment type.`);
      return;
    }

    // For weapon motes, check if the same mote is already equipped on any weapon
    if (isWeaponSlot) {
      const allWeaponMotes: string[] = [];

      // Collect all currently equipped weapon motes
      [selectedItems.primary, selectedItems.sidearm].forEach((weapon) => {
        if (weapon?.Motes) {
          weapon.Motes.forEach((equippedMote) => {
            if (equippedMote?.MoteID) {
              allWeaponMotes.push(equippedMote.MoteID);
            }
          });
        }
      });

      console.log(`App: Currently equipped weapon motes:`, allWeaponMotes);

      // Check if this mote is already equipped (excluding the slot we're updating)
      const currentWeapon = selectedItems[slot];
      const currentMoteAtIndex = currentWeapon?.Motes?.[moteIndex];
      const isReplacingExisting = currentMoteAtIndex?.MoteID === mote.MoteID;

      if (!isReplacingExisting && allWeaponMotes.includes(mote.MoteID)) {
        alert(
          `The mote "${mote.MoteID}" is already equipped on another weapon. Each mote can only be equipped once.`
        );
        return;
      }

      // Check if we're adding a new mote and would exceed 3 motes for this weapon
      const currentWeaponMotes = currentWeapon?.Motes || [];
      const filledSlots = currentWeaponMotes.filter(
        (m) => m && m.MoteID
      ).length;
      const isNewSlot =
        moteIndex >= currentWeaponMotes.length ||
        !currentWeaponMotes[moteIndex];

      if (isNewSlot && filledSlots >= 3) {
        alert(
          "This weapon already has 3 motes equipped. Each weapon can have a maximum of 3 motes."
        );
        return;
      }
    }

    console.log(
      `App: Updating selectedItems for slot ${slot} with mote at index ${moteIndex}`
    );

    setSelectedItems((prev) => {
      console.log(`App: Previous selectedItems:`, prev);

      const item = prev[slot];
      if (!item) {
        console.log(`App: No item found in slot ${slot}`);
        return prev;
      }

      // Create a copy of the item to update
      const updatedItem = { ...item };

      // Initialize Motes array if it doesn't exist
      if (!updatedItem.Motes) {
        updatedItem.Motes = [];
        console.log(`App: Initialized Motes array for ${slot}`);
      }

      // Set the mote at the specified index
      const updatedMotes = [...updatedItem.Motes];
      updatedMotes[moteIndex] = mote;
      updatedItem.Motes = updatedMotes;

      console.log(`App: Updated item for ${slot}:`, updatedItem);

      // Return updated state
      const newState = {
        ...prev,
        [slot]: updatedItem,
      };

      console.log(`App: New selectedItems state:`, newState);
      return newState;
    });
  };

  const handleMoteRemove = (slot: keyof SelectedItems, moteIndex: number) => {
    setSelectedItems((prev) => {
      const item = prev[slot];
      if (!item || !item.Motes) return prev;

      // Create a copy of the item to update
      const updatedItem = { ...item };
      const updatedMotes = [...updatedItem.Motes];

      // Remove the mote at the specified index
      updatedMotes[moteIndex] = undefined;
      updatedItem.Motes = updatedMotes;

      // Return updated state
      return {
        ...prev,
        [slot]: updatedItem,
      };
    });
  };

  const clearAllItems = () => {
    setSelectedItems({
      helm: null,
      upperBody: null,
      lowerBody: null,
      totem: null,
      primary: null,
      sidearm: null,
      pact: null,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your build...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: "var(--bg-darkest)",
        backgroundImage:
          'url("https://s3.7thseraph.org/wiki.avakot.org/greyscale55.png")',
        backgroundRepeat: "repeat",
        backgroundBlendMode: "overlay",
      }}
    >
      {/* Header */}
      <header
        className="px-6 py-4 w-full relative flex justify-between items-center"
        style={{
          backgroundColor: "var(--bg-darker)",
          borderBottom: "1px solid var(--divider-color)",
        }}
      >
        <div className="w-full max-w-none">
          <h1 className="text-3xl font-bold text-yellow-shiny text-shadow-heavy">
            Soulframe Builder
          </h1>
          <p
            className="text-shadow mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Up to date with [P10H6], Built by aHappyOreo, powered by
            wiki.avakot.org
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Build Share Tools - Added to the right of Ko-Fi button */}
          <BuildShareTools
            selectedItems={selectedItems}
            onImport={(importedItems) => setSelectedItems(importedItems)}
          />

          {/* Ko-Fi button - Fixed width to prevent squishing */}
          <a
            href="https://ko-fi.com/ascriptingoreo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 rounded-md text-white transition-transform hover:scale-105"
            style={{
              backgroundColor: "var(--courage-color)",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
              minWidth: "130px", // Added fixed minimum width
              justifyContent: "center", // Center content horizontally
            }}
          >
            {/* Ko-Fi cup icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
            <span className="font-medium whitespace-nowrap">Send Love</span>
          </a>
        </div>

        {/* Decorative Header Image */}
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ pointerEvents: "none" }}
        >
          <img
            src="https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/Crafting/CraftingRankTopper.png"
            alt=""
            style={{
              height: "120px",
              width: "auto",
              filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))",
              opacity: 0.9,
            }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-8" style={{ paddingTop: "4rem" }}>
        {/* Add SearchBar above the three-column-grid */}
        <SearchBar
          selectedItems={selectedItems}
          onItemSelect={handleItemSelect}
          onItemRemove={handleItemRemove} // Add this prop
        />

        <div className="three-column-grid w-full max-w-none">
          {/* Equipment Selection */}
          <div className="card">
            <div className="card-header">
              <h2>Equipment</h2>
            </div>
            <div className="card-body scrollable-content">
              <ItemSelector
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
                onItemRemove={handleItemRemove}
                onMoteSelect={handleMoteSelect}
                onMoteRemove={handleMoteRemove}
              />
            </div>
          </div>

          {/* Build Summary - Now using BuildSummaryText component */}
          <div className="card">
            <div className="card-header">
              <h2>Build Summary</h2>
            </div>
            <div className="card-body scrollable-content">
              <BuildSummaryText selectedItems={selectedItems} />
            </div>
          </div>

          {/* Build Stats */}
          <div className="card">
            <div className="card-header">
              <h2>Stats</h2>
            </div>
            <div className="card-body scrollable-content">
              <StatsDisplay selectedItems={selectedItems} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
