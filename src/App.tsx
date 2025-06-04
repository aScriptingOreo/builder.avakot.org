import BuildStats from "@components/BuildStats";
import ItemSelector from "@components/ItemSelector";
import { SelectedItems } from "@types/build";
import localforage from "localforage";
import React, { useEffect, useState } from "react";

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
        className="px-6 py-4 w-full relative"
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
            Build and optimize your Soulframe character
          </p>
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
              />
            </div>
          </div>

          {/* Build Summary */}
          <div className="card">
            <div className="card-header">
              <h2>Build Summary</h2>
            </div>
            <div className="card-body scrollable-content">
              <div className="space-y-4">
                {Object.entries(selectedItems).map(([slot, item]) => (
                  <div
                    key={slot}
                    className="flex items-center justify-between p-3 rounded"
                    style={{
                      backgroundColor: "var(--bg-dark)",
                      border: "1px solid var(--accent-subtle)",
                    }}
                  >
                    <span className="font-medium capitalize text-shadow">
                      {slot === "sidearm"
                        ? "Secondary"
                        : slot.replace(/([A-Z])/g, " $1")}
                      :
                    </span>
                    <span className="text-yellow-shiny font-medium">
                      {item ? item.DisplayName || item.LinkusAlias : "None"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Build Stats */}
          <div className="card">
            <div className="card-header">
              <h2>Stats</h2>
            </div>
            <div className="card-body scrollable-content">
              <BuildStats selectedItems={selectedItems} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
