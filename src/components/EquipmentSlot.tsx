import React, { useState } from "react";
import { SelectedItems } from "../types/build";
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
  slotType: keyof SelectedItems;
  selectedItem: any;
  selectedItems: SelectedItems; // Add this prop
  onItemSelect: (item: any) => void;
  onItemRemove: () => void;
  onMoteSelect: (moteIndex: number, mote: any) => void;
  onMoteRemove: (moteIndex: number) => void;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({
  slotType,
  selectedItem,
  selectedItems, // Add this parameter
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
  const [moteSelector, setMoteSelector] = useState<{
    isOpen: boolean;
    slotIndex: number | null;
  }>({
    isOpen: false,
    slotIndex: null,
  });

  const handleSlotClick = async (e?: React.MouseEvent) => {
    // Prevent event propagation that might cause conflicts
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (selectedItem || isLoading) return;

    setIsLoading(true);

    try {
      const query = getGraphQLQuery(slotType);
      if (!query) {
        throw new Error(`No query defined for slot: ${slotType}`);
      }

      console.log(
        `EquipmentSlot: Fetching ${slotType} items with query:`,
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
        `EquipmentSlot: Response status for ${slotType}:`,
        response.status
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `EquipmentSlot: HTTP error for ${slotType}:`,
          response.status,
          errorText
        );
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      const result = await response.json();

      console.log(`EquipmentSlot: GraphQL response for ${slotType}:`, result);

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
          `EquipmentSlot: Found ${fetchedItems.length} items for ${slotType}:`,
          fetchedItems
        );

        setItems(fetchedItems);
        setShowModal(true);
      }
    } catch (error) {
      console.error(`EquipmentSlot: Error fetching ${slotType} items:`, error);
      alert(
        `Failed to load ${getSlotDisplayName(
          slotType
        )} items. Please make sure the GraphQL server is running on port 5501.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Map slot names to GraphQL queries - Use armorsBySlot and weaponsBySlot for filtering
  const getGraphQLQuery = (slotType: keyof SelectedItems): string => {
    switch (slotType) {
      case "helm":
        return `{ armorsBySlot(slot: "Helm") { LinkusAlias DisplayName LinkusMap Img { Preview Icon } Slot Set Stats { MagickDefence PhysicalDefence StabilityIncrease Virtue { Type Value } } } }`;

      case "upperBody":
        return `{ armorsBySlot(slot: "UpperBody") { LinkusAlias DisplayName LinkusMap Img { Preview Icon } Slot Set Stats { MagickDefence PhysicalDefence StabilityIncrease Virtue { Type Value } } } }`;

      case "lowerBody":
        return `{ armorsBySlot(slot: "LowerBody") { LinkusAlias DisplayName LinkusMap Img { Preview Icon } Slot Set Stats { MagickDefence PhysicalDefence StabilityIncrease Virtue { Type Value } } } }`;

      case "totem":
        return `{ armorsBySlot(slot: "Totem") { LinkusAlias DisplayName LinkusMap Img { Preview Icon } Slot Set Stats { MagickDefence PhysicalDefence StabilityIncrease Virtue { Type Value } } } }`;

      case "primary":
        return `{ weaponsBySlot(slot: "Primary") { LinkusAlias DisplayName LinkusMap Img { Preview Icon } Slot Art Rarity Stats { Smite lvl0 { Stagger Attack ChargedAttack DamageAttuneCap } lvl30 { Stagger Attack ChargedAttack DamageAttuneCap } VirtueAttuneCap } } }`;

      case "sidearm":
        return `{ weaponsBySlot(slot: "Sidearm") { LinkusAlias DisplayName LinkusMap Img { Preview Icon } Slot Art Rarity Stats { Smite lvl0 { Stagger Attack ChargedAttack DamageAttuneCap } lvl30 { Stagger Attack ChargedAttack DamageAttuneCap } VirtueAttuneCap } } }`;

      case "pact":
        return `{ pacts { LinkusAlias DisplayName LinkusMap Img { Preview Icon } Stats { BonusHP BonusVirtue { Type Value } UnarmedDmg MagickDefence PhysicalDefence StabilityIncrease } } }`;

      default:
        return "";
    }
  };

  // Get display name for slots
  const getSlotDisplayName = (slotType: keyof SelectedItems): string => {
    switch (slotType) {
      case "helm":
        return "Helm";
      case "upperBody": // Fix: was "upperbody"
        return "Upper Body";
      case "lowerBody": // Fix: was "lowerbody"
        return "Lower Body";
      case "totem":
        return "Totem";
      case "primary":
        return "Primary";
      case "sidearm":
        return "Sidearm";
      case "pact":
        return "Pact";
      default:
        return slotType; // Use slotType instead of slotName
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
  const handleMoteSelect = (mote: any) => {
    if (moteSelector.slotIndex === null) return;

    console.log(
      `EquipmentSlot: Mote selected for ${slotType} slot ${moteSelector.slotIndex}:`,
      mote
    );

    // For weapon slots, check if we're at the 3-mote limit for this specific weapon
    if ((slotType === "primary" || slotType === "sidearm") && selectedItem) {
      const currentMotes = selectedItem.Motes || [];
      const filledSlots = currentMotes.filter((m) => m && m.MoteID).length;

      // If we're trying to add to a new slot and we're already at 3 motes, deny
      if (moteSelector.slotIndex >= currentMotes.length && filledSlots >= 3) {
        alert(
          "This weapon already has 3 motes equipped. Remove a mote first or replace an existing one."
        );
        setMoteSelector({ isOpen: false, slotIndex: null });
        return;
      }
    }

    // For pact slots, check if the mote is already equipped on the pact
    if (slotType === "pact" && selectedItem) {
      const currentMotes = selectedItem.Motes || [];

      // Check if this mote is already equipped on the pact
      const moteExists = currentMotes.some(
        (m) => m && m.MoteID === mote.MoteID
      );

      if (moteExists) {
        alert(
          "This mote is already equipped on this pact. Each mote can only be used once per pact."
        );
        setMoteSelector({ isOpen: false, slotIndex: null });
        return;
      }

      // Check if we're at the 3-mote limit for the pact
      const filledSlots = currentMotes.filter((m) => m && m.MoteID).length;

      if (moteSelector.slotIndex >= currentMotes.length && filledSlots >= 3) {
        alert(
          "This pact already has 3 motes equipped. Remove a mote first or replace an existing one."
        );
        setMoteSelector({ isOpen: false, slotIndex: null });
        return;
      }
    }

    onMoteSelect(moteSelector.slotIndex, mote);
    setMoteSelector({ isOpen: false, slotIndex: null });
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
            {getSlotDisplayName(slotType)}
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
            {(slotType === "primary" ||
              slotType === "sidearm" ||
              slotType === "pact") && (
              <div className="mote-slots flex space-x-2 mt-2 justify-center">
                {[0, 1, 2].map((index) => {
                  const mote = selectedItem.Motes?.[index];
                  return (
                    <div
                      key={`mote-slot-${index}`}
                      className="mote-slot"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMoteSelector({ isOpen: true, slotIndex: index });
                      }}
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
        title={`Select ${getSlotDisplayName(slotType)}`}
      >
        {items.length === 0 ? (
          <div
            className="text-center py-8 text-shadow"
            style={{ color: "var(--text-muted)" }}
          >
            No {getSlotDisplayName(slotType).toLowerCase()} items available.
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

      {/* Weapon Mote Selector */}
      {moteSelector.isOpen &&
        (slotType === "primary" || slotType === "sidearm") && (
          <MoteSelector
            slotType="weapon"
            isOpen={moteSelector.isOpen}
            onClose={() => setMoteSelector({ isOpen: false, slotIndex: null })}
            onMoteSelect={handleMoteSelect}
            selectedItems={selectedItems}
          />
        )}

      {/* Pact Mote Selector */}
      {moteSelector.isOpen && slotType === "pact" && (
        <MoteSelector
          slotType="pact"
          isOpen={moteSelector.isOpen}
          onClose={() => setMoteSelector({ isOpen: false, slotIndex: null })}
          onMoteSelect={handleMoteSelect}
          selectedItems={selectedItems}
        />
      )}
    </>
  );
};

export default EquipmentSlot;
