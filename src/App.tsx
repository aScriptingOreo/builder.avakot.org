import ItemSelector from "@components/ItemSelector";
import StatsDisplay from "@components/StatsDisplay";
import { SelectedItems } from "@types/build";
import localforage from "localforage";
import { useEffect, useState } from "react";

export function App() {
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
    setSelectedItems((prev) => ({
      ...prev,
      [slot]: item,
    }));
  };

  const handleItemRemove = (slot: keyof SelectedItems) => {
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
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-400">
            Soulframe Builder
          </h1>
          <button
            onClick={clearAllItems}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors"
          >
            Clear All
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Item Selection Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">
              Equipment Selection
            </h2>
            <ItemSelector
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
              onItemRemove={handleItemRemove}
            />
          </div>

          {/* Stats Display Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-green-300">
              Build Stats
            </h2>
            <StatsDisplay selectedItems={selectedItems} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
