import React, { useEffect, useState } from "react";

interface EquipmentItem {
  LinkusAlias: string;
  DisplayName?: string;
  Img?: {
    Preview?: string;
    Icon?: string;
    Ingame?: string;
  };
  Slot?: string;
  Set?: string;
  Art?: string;
  Rarity?: string;
}

interface EquipmentSlotProps {
  slotName: string;
  slotType: "armor" | "weapon" | "pact";
  selectedItem: EquipmentItem | null;
  onItemSelect: (item: EquipmentItem) => void;
  onItemRemove: () => void;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({
  slotName,
  slotType,
  selectedItem,
  onItemSelect,
  onItemRemove,
}) => {
  const [items, setItems] = useState<EquipmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchSlotItems = async () => {
      try {
        let query = "";
        switch (slotName.toLowerCase()) {
          case "helm":
            query =
              "{ helms { LinkusAlias DisplayName Img { Preview Icon } Slot Set Rarity } }";
            break;
          case "upperbody":
            query =
              "{ upperBodyArmor { LinkusAlias DisplayName Img { Preview Icon } Slot Set Rarity } }";
            break;
          case "lowerbody":
            query =
              "{ lowerBodyArmor { LinkusAlias DisplayName Img { Preview Icon } Slot Set Rarity } }";
            break;
          case "totem":
            query =
              "{ totems { LinkusAlias DisplayName Img { Preview Icon } Slot Set Rarity } }";
            break;
          case "primary":
            query =
              "{ primaryWeapons { LinkusAlias DisplayName Img { Preview Icon } Slot Art Rarity } }";
            break;
          case "secondary":
            query =
              "{ secondaryWeapons { LinkusAlias DisplayName Img { Preview Icon } Slot Art Rarity } }";
            break;
          case "pact":
            query =
              "{ pacts { LinkusAlias DisplayName Img { Preview Icon } } }";
            break;
          default:
            return;
        }

        const response = await fetch("/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        const result = await response.json();
        if (result.data) {
          const dataKey = Object.keys(result.data)[0];
          setItems(result.data[dataKey] || []);
        }
      } catch (error) {
        console.error(`Error fetching ${slotName} items:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlotItems();
  }, [slotName]);

  const getImageUrl = (item: EquipmentItem) => {
    return item.Img?.Preview || item.Img?.Icon || item.Img?.Ingame || null;
  };

  const formatSlotName = (name: string) => {
    switch (name.toLowerCase()) {
      case "upperbody":
        return "Upper Body";
      case "lowerbody":
        return "Lower Body";
      default:
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
  };

  return (
    <div className="equipment-slot mb-4">
      <div className="flex items-center justify-between mb-2">
        <label
          className="text-sm font-semibold"
          style={{ color: "var(--accent-tertiary)" }}
        >
          {formatSlotName(slotName)}
        </label>
        {selectedItem && (
          <button
            onClick={onItemRemove}
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: "var(--courage-color)",
              color: "var(--text-lightest)",
              border: "1px solid #7a2b2c",
            }}
          >
            Remove
          </button>
        )}
      </div>

      <div className="relative">
        {/* Selected Item Display */}
        <div
          className="card cursor-pointer min-h-[80px]"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            backgroundColor: selectedItem
              ? "var(--bg-medium)"
              : "var(--bg-dark)",
            borderColor: selectedItem
              ? "var(--accent-primary)"
              : "var(--accent-subtle)",
          }}
        >
          <div className="card-body py-3 px-4">
            {selectedItem ? (
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center rounded"
                  style={{ backgroundColor: "var(--bg-darker)" }}
                >
                  {getImageUrl(selectedItem) ? (
                    <img
                      src={getImageUrl(selectedItem)!}
                      alt={selectedItem.DisplayName || selectedItem.LinkusAlias}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {selectedItem.DisplayName || selectedItem.LinkusAlias}
                  </div>
                  {selectedItem.Set && (
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {selectedItem.Set}
                    </div>
                  )}
                  {selectedItem.Art && (
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {selectedItem.Art}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-12">
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {isLoading
                    ? "Loading..."
                    : `Select ${formatSlotName(slotName)}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && !isLoading && (
          <div
            className="absolute top-full left-0 right-0 z-50 mt-1 card max-h-64 overflow-y-auto"
            style={{ backgroundColor: "var(--bg-darker)" }}
          >
            <div className="card-body p-2">
              {items.length === 0 ? (
                <div
                  className="text-center py-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  No items available
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.LinkusAlias}
                    className="flex items-center gap-3 p-2 rounded cursor-pointer transition-colors"
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--accent-subtle)";
                      e.currentTarget.style.borderColor =
                        "var(--accent-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                    onClick={() => {
                      onItemSelect(item);
                      setIsOpen(false);
                    }}
                  >
                    <div
                      className="w-8 h-8 flex items-center justify-center rounded"
                      style={{ backgroundColor: "var(--bg-dark)" }}
                    >
                      {getImageUrl(item) ? (
                        <img
                          src={getImageUrl(item)!}
                          alt={item.DisplayName || item.LinkusAlias}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          ?
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {item.DisplayName || item.LinkusAlias}
                      </div>
                      {(item.Set || item.Art) && (
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {item.Set || item.Art}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default EquipmentSlot;
