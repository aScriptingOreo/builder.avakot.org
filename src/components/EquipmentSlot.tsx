import React, { useState } from "react";
import Modal from "./Modal";
import MoteSelector from "./MoteSelector";

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
  Motes?: MoteItem[];
}

interface EquipmentSlotProps {
  slotName: string;
  slotType: "armor" | "weapon" | "pact";
  selectedItem: EquipmentItem | null;
  onItemSelect: (item: EquipmentItem) => void;
  onItemRemove: () => void;
  onMoteSelect?: (moteIndex: number, mote: MoteItem) => void;
  onMoteRemove?: (moteIndex: number) => void;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({
  slotName,
  slotType,
  selectedItem,
  onItemSelect,
  onItemRemove,
  onMoteSelect,
  onMoteRemove,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showMoteSelector, setShowMoteSelector] = useState(false);
  const [activeMoteIndex, setActiveMoteIndex] = useState<number | null>(null);
  const [items, setItems] = useState<EquipmentItem[]>([]);

  // Map slot names to GraphQL queries - Use armorsBySlot and weaponsBySlot for filtering
  const getGraphQLQuery = (slotName: string, slotType: string) => {
    switch (slotType) {
      case "armor":
        // Use armorsBySlot query with proper slot names
        const armorSlotMap: { [key: string]: string } = {
          helm: "Helm",
          upperbody: "UpperBody",
          lowerbody: "LowerBody",
          totem: "Totem",
        };
        const slotFilter = armorSlotMap[slotName];
        if (!slotFilter) return "";
        return `{ armorsBySlot(slot: "${slotFilter}") { LinkusAlias DisplayName LinkusMap Img { Preview Icon } Slot Set } }`;

      case "weapon":
        // Use weaponsBySlot query with proper slot names
        const weaponSlotMap: { [key: string]: string } = {
          primary: "Primary",
          secondary: "Sidearm",
        };
        const weaponSlotFilter = weaponSlotMap[slotName];
        if (!weaponSlotFilter) return "";
        return `{ weaponsBySlot(slot: "${weaponSlotFilter}") { LinkusAlias DisplayName LinkusMap Img { Preview Icon } Slot Art Rarity } }`;

      case "pact":
        return "{ pacts { LinkusAlias DisplayName LinkusMap Img { Preview Icon } } }";

      default:
        return "";
    }
  };

  // Get display name for slots
  const getSlotDisplayName = (slotName: string) => {
    const displayNames = {
      helm: "Helm",
      upperbody: "Upper Body",
      lowerbody: "Lower Body",
      totem: "Totem",
      primary: "Primary Weapon",
      secondary: "Secondary Weapon",
      pact: "Pact",
    };
    return displayNames[slotName as keyof typeof displayNames] || slotName;
  };

  const handleSlotClick = async (e?: React.MouseEvent) => {
    // Prevent event propagation that might cause conflicts
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (selectedItem || isLoading) return;

    setIsLoading(true);

    try {
      const query = getGraphQLQuery(slotName, slotType);
      if (!query) {
        throw new Error(`No query defined for slot: ${slotName}`);
      }

      console.log(
        `EquipmentSlot: Fetching ${slotName} items with query:`,
        query
      );

      const response = await fetch("/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query }),
      });

      console.log(
        `EquipmentSlot: Response status for ${slotName}:`,
        response.status
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `EquipmentSlot: HTTP error for ${slotName}:`,
          response.status,
          errorText
        );
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      const result = await response.json();

      console.log(`EquipmentSlot: GraphQL response for ${slotName}:`, result);

      if (result.errors) {
        console.error("EquipmentSlot: GraphQL errors:", result.errors);
        throw new Error(
          "GraphQL query failed: " +
            result.errors.map((e: any) => e.message).join(", ")
        );
      }

      if (result.data) {
        const dataKey = Object.keys(result.data)[0];
        const fetchedItems = result.data[dataKey] || [];

        console.log(
          `EquipmentSlot: Found ${fetchedItems.length} items for ${slotName}:`,
          fetchedItems
        );

        setItems(fetchedItems);
        setShowModal(true);
      }
    } catch (error) {
      console.error(`EquipmentSlot: Error fetching ${slotName} items:`, error);
      alert(
        `Failed to load ${getSlotDisplayName(
          slotName
        )} items. Please make sure the GraphQL server is running on port 5501.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemSelect = (item: EquipmentItem) => {
    onItemSelect(item);
    setShowModal(false);
  };

  const handleRemoveItem = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onItemRemove();
  };

  // New function to handle mote slot click
  const handleMoteSlotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMoteIndex(index);
    setShowMoteSelector(true);
  };

  // New function to handle mote selection
  const handleMoteSelect = (mote: MoteItem) => {
    if (activeMoteIndex !== null && onMoteSelect) {
      onMoteSelect(activeMoteIndex, mote);
    }
    setShowMoteSelector(false);
    setActiveMoteIndex(null);
  };

  // New function to handle mote removal
  const handleMoteRemove = (index: number) => {
    if (onMoteRemove) {
      onMoteRemove(index);
    }
  };

  // Helper function to get the best available image
  const getItemImage = (item: any) => {
    if (!item.Img) return null;
    // Prefer Preview over Icon
    return item.Img.Preview || item.Img.Icon || null;
  };

  // Helper function to get mote image
  const getMoteImage = (mote: MoteItem) => {
    return mote.Img?.Icon || null;
  };

  // Helper function to get mote effect as string
  const getMoteEffect = (mote: MoteItem): string => {
    if (!mote.Effect) return "";
    if (typeof mote.Effect === "string") return mote.Effect;
    return mote.Effect.join(", ");
  };

  return (
    <>
      <div
        className="equipment-slot-card"
        style={{
          ...(selectedItem && {
            borderColor: "var(--yellow-shiny)",
            backgroundColor: "rgba(209, 149, 54, 0.1)",
          }),
          ...(isLoading && { opacity: 0.5, cursor: "wait" }),
          ...(!isLoading && !selectedItem && { cursor: "pointer" }),
        }}
        onClick={handleSlotClick}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="equipment-slot-header">
            {getSlotDisplayName(slotName)}
          </h3>
          {selectedItem && (
            <button
              onClick={handleRemoveItem}
              className="btn-danger"
              style={{
                padding: "0.25rem 0.5rem",
                fontSize: "0.875rem",
                minWidth: "auto",
              }}
              title="Remove item"
            >
              ✕
            </button>
          )}
        </div>

        {selectedItem ? (
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              {getItemImage(selectedItem) && (
                <div
                  className="item-image-container"
                  style={{
                    width: "3rem",
                    height: "3rem",
                  }}
                >
                  <img
                    src={getItemImage(selectedItem)}
                    alt={selectedItem.DisplayName || selectedItem.LinkusAlias}
                    className="item-image"
                  />
                </div>
              )}
              <div className="flex-1">
                <div
                  className="item-name"
                  style={{
                    fontSize: "1rem",
                    marginBottom: "0.25rem",
                    color: "var(--yellow-shiny)",
                  }}
                >
                  {selectedItem.DisplayName || selectedItem.LinkusAlias}
                </div>
                {(selectedItem.Set || selectedItem.Art) && (
                  <div
                    className="text-sm text-shadow"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {selectedItem.Set || selectedItem.Art}
                  </div>
                )}
              </div>
            </div>

            {/* Mote slots - only for weapons and pacts */}
            {(slotType === "weapon" || slotType === "pact") && (
              <div className="mote-slots flex space-x-2 mt-2 justify-center">
                {[0, 1, 2].map((index) => {
                  const mote = selectedItem.Motes?.[index];
                  return (
                    <div
                      key={`mote-slot-${index}`}
                      className="mote-slot"
                      onClick={(e) => handleMoteSlotClick(index, e)}
                      style={{
                        width: "2rem",
                        height: "2rem",
                        borderRadius: "50%",
                        border: mote
                          ? "1px solid var(--yellow-shiny)"
                          : "1px dashed var(--accent-subtle)",
                        backgroundColor: mote
                          ? "rgba(209, 149, 54, 0.1)"
                          : "var(--bg-medium)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        position: "relative",
                      }}
                      title={
                        mote ? getMoteEffect(mote) : `Add ${slotType} mote`
                      }
                    >
                      {mote ? (
                        <>
                          <div
                            className="mote-image-container"
                            style={{ width: "90%", height: "90%" }}
                          >
                            {getMoteImage(mote) ? (
                              <img
                                src={getMoteImage(mote)}
                                alt={mote.DisplayName || mote.MoteID}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="flex items-center justify-center text-xs">
                                {mote.MoteID.substring(0, 1)}
                              </div>
                            )}
                          </div>
                          <button
                            className="absolute -top-1 -right-1 bg-courage-color text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoteRemove(index);
                            }}
                          >
                            ×
                          </button>
                        </>
                      ) : (
                        <div className="text-text-muted text-xs">+</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div
            className="text-shadow"
            style={{
              color: "var(--text-muted)",
              fontSize: "0.875rem",
            }}
          >
            {isLoading ? "Loading..." : "Click to select..."}
          </div>
        )}
      </div>

      {/* Modal - Now using the Portal component instead of inline modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Select ${getSlotDisplayName(slotName)}`}
      >
        {items.length === 0 ? (
          <div
            className="text-center py-8 text-shadow"
            style={{ color: "var(--text-muted)" }}
          >
            No {getSlotDisplayName(slotName).toLowerCase()} items available.
          </div>
        ) : (
          <div className="item-grid">
            {items.map((item) => {
              const displayName = item.DisplayName || item.LinkusAlias;
              const itemKey =
                item.LinkusMap || item.LinkusAlias || Math.random();
              const itemImage = getItemImage(item);

              return (
                <div
                  key={itemKey}
                  className="item-card"
                  onClick={() => handleItemSelect(item)}
                >
                  {/* Item Image with layered background */}
                  <div className="item-image-container">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={displayName}
                        className="item-image"
                      />
                    ) : (
                      <div className="item-image-placeholder">?</div>
                    )}
                  </div>

                  {/* Item Name */}
                  <div
                    className="item-name"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {displayName}
                  </div>

                  {/* Item Info */}
                  {(item.Set || item.Art || item.Rarity) && (
                    <div className="item-slot">
                      {item.Set || item.Art || item.Rarity}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>

      {/* MoteSelector rendered separately - will appear via React Portal */}
      {showMoteSelector && (
        <MoteSelector
          slotType={slotType === "weapon" ? "weapon" : "pact"}
          isOpen={showMoteSelector}
          onClose={() => setShowMoteSelector(false)}
          onMoteSelect={handleMoteSelect}
        />
      )}
    </>
  );
};

export default EquipmentSlot;
