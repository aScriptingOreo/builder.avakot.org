import React, { useState, useEffect } from 'react';
import { SelectedItems } from '@types/build';
import { fetchData, resolveDisplayName } from '@utils/api';

interface ItemSelectorProps {
  selectedItems: SelectedItems;
  onItemSelect: (slot: keyof SelectedItems, item: any) => void;
  onItemRemove: (slot: keyof SelectedItems) => void;
}

const ITEM_SLOTS = [
  { name: 'Helm', slot: 'helm' as const, category: 'armor', endpoint: 'MAS', filter: (item: any) => item.Slot === 'Helm' },
  { name: 'Upper Body', slot: 'upperBody' as const, category: 'armor', endpoint: 'MAS', filter: (item: any) => item.Slot === 'UpperBody' },
  { name: 'Lower Body', slot: 'lowerBody' as const, category: 'armor', endpoint: 'MAS', filter: (item: any) => item.Slot === 'LowerBody' },
  { name: 'Totem', slot: 'totem' as const, category: 'armor', endpoint: 'MAS', filter: (item: any) => item.Slot === 'Totem' },
  { name: 'Primary Weapon', slot: 'primary' as const, category: 'weapon', endpoint: 'MWS', filter: (item: any) => item.Slot === 'Primary' },
  { name: 'Sidearm', slot: 'sidearm' as const, category: 'weapon', endpoint: 'MWS', filter: (item: any) => item.Slot === 'Sidearm' },
  { name: 'Pact', slot: 'pact' as const, category: 'pact', endpoint: 'MPS', filter: () => true },
];

const ItemSelector: React.FC<ItemSelectorProps> = ({ selectedItems, onItemSelect, onItemRemove }) => {
  const [activeSlot, setActiveSlot] = useState<keyof SelectedItems | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemDisplayNames, setItemDisplayNames] = useState<Record<string, string>>({});

  // Resolve display names for items
  useEffect(() => {
    const resolveNames = async () => {
      const names: Record<string, string> = {};
      for (const item of items) {
        if (item.LinkusAlias && !itemDisplayNames[item.LinkusAlias]) {
          names[item.LinkusAlias] = await resolveDisplayName(item.LinkusAlias);
        }
      }
      setItemDisplayNames(prev => ({ ...prev, ...names }));
    };

    if (items.length > 0) {
      resolveNames();
    }
  }, [items]);

  const loadItemsForSlot = async (slotConfig: typeof ITEM_SLOTS[0]) => {
    setLoading(true);
    try {
      const data = await fetchData(slotConfig.endpoint);
      const filteredItems = data.filter(slotConfig.filter);
      setItems(filteredItems);
    } catch (error) {
      console.error(`Error loading ${slotConfig.name} items:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slotConfig: typeof ITEM_SLOTS[0]) => {
    if (activeSlot === slotConfig.slot) {
      setActiveSlot(null);
      setItems([]);
      setSearchTerm('');
    } else {
      setActiveSlot(slotConfig.slot);
      loadItemsForSlot(slotConfig);
      setSearchTerm('');
    }
  };

  const getItemDisplayName = (item: any) => {
    return itemDisplayNames[item.LinkusAlias] || item.LinkusAlias;
  };

  const filteredItems = items.filter(item => {
    const displayName = getItemDisplayName(item);
    const searchLower = searchTerm.toLowerCase();
    return displayName.toLowerCase().includes(searchLower) ||
           item.LinkusAlias?.toLowerCase().includes(searchLower) ||
           item.Set?.toLowerCase().includes(searchLower);
  });

  return (
    <div className="space-y-4">
      {/* Slot Selection Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {ITEM_SLOTS.map((slotConfig) => {
          const selectedItem = selectedItems[slotConfig.slot];
          const isActive = activeSlot === slotConfig.slot;
          
          return (
            <div key={slotConfig.slot} className="space-y-1">
              <button
                onClick={() => handleSlotClick(slotConfig)}
                className={`w-full p-3 rounded border text-left transition-colors ${
                  isActive
                    ? 'bg-blue-600 border-blue-500'
                    : selectedItem
                    ? 'bg-green-700 border-green-600'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{slotConfig.name}</div>
                {selectedItem && (
                  <div className="text-sm text-gray-300 truncate">
                    {itemDisplayNames[selectedItem.LinkusAlias] || selectedItem.LinkusAlias || 'Unknown Item'}
                  </div>
                )}
              </button>
              
              {selectedItem && (
                <button
                  onClick={() => onItemRemove(slotConfig.slot)}
                  className="w-full text-xs bg-red-600 hover:bg-red-700 p-1 rounded transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Item Selection Modal */}
      {activeSlot && (
        <div className="border border-gray-600 rounded-lg p-4 bg-gray-750">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Select {ITEM_SLOTS.find(s => s.slot === activeSlot)?.name}
            </h3>
            <button
              onClick={() => setActiveSlot(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400"
          />

          {/* Items List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center text-gray-400">Loading...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center text-gray-400">No items found</div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.LinkusAlias}
                  onClick={() => {
                    onItemSelect(activeSlot, item);
                    setActiveSlot(null);
                  }}
                  className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded cursor-pointer transition-colors"
                >
                  <div className="font-medium">{getItemDisplayName(item)}</div>
                  <div className="text-xs text-gray-500">ID: {item.LinkusAlias}</div>
                  {item.Set && (
                    <div className="text-sm text-gray-400">Set: {item.Set}</div>
                  )}
                  {item.Art && (
                    <div className="text-sm text-gray-400">Type: {item.Art}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemSelector;
