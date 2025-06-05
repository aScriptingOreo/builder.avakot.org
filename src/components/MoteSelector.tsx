import React, { useEffect, useState } from "react";
import { SelectedItems } from "../types/build";
import Modal from "./Modal";

interface MoteItem {
  MoteID: string;
  Img?: {
    Icon?: string;
  };
  Slot?: string;
  Effect?: string;
}

interface MoteSelectorProps {
  slotType: "weapon" | "pact";
  isOpen: boolean;
  onClose: () => void;
  onMoteSelect: (mote: MoteItem) => void;
  selectedItems: SelectedItems; // Add this to check existing motes
}

const MoteSelector: React.FC<MoteSelectorProps> = ({
  slotType,
  isOpen,
  onClose,
  onMoteSelect,
  selectedItems,
}) => {
  const [motes, setMotes] = useState<MoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMotes();
    }
  }, [isOpen, slotType]);

  const fetchMotes = async () => {
    setIsLoading(true);
    try {
      // Use direct API fetch as fallback
      const endpoint = `https://wiki.avakot.org/linkus/Motes`;
      console.log(`Fetching motes from API endpoint: ${endpoint}`);

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`API fetch error: ${response.status}`);
      }

      const allMotes = await response.json();

      // Filter locally based on slot type
      const slotFilter = slotType === "weapon" ? "Weapons" : "Pacts";
      const filteredMotes = allMotes.filter(
        (mote: MoteItem) => mote.Slot === slotFilter
      );

      console.log(`Found ${filteredMotes.length} ${slotFilter} motes`);
      setMotes(filteredMotes);
    } catch (error) {
      console.error(`Error fetching motes:`, error);
      setMotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get all currently equipped weapon motes
  const getEquippedWeaponMotes = (): string[] => {
    // Safety check to prevent undefined errors
    if (!selectedItems) {
      console.warn("getEquippedWeaponMotes: selectedItems is undefined");
      return [];
    }

    const equippedMotes: string[] = [];

    // Check primary weapon motes
    if (selectedItems.primary?.Motes) {
      selectedItems.primary.Motes.forEach((mote) => {
        if (mote?.MoteID) {
          equippedMotes.push(mote.MoteID);
        }
      });
    }

    // Check sidearm weapon motes
    if (selectedItems.sidearm?.Motes) {
      selectedItems.sidearm.Motes.forEach((mote) => {
        if (mote?.MoteID) {
          equippedMotes.push(mote.MoteID);
        }
      });
    }

    return equippedMotes;
  };

  // Check if a weapon mote can be equipped
  const canEquipWeaponMote = (mote: MoteItem): boolean => {
    if (slotType !== "weapon") return true; // Pact motes don't have this restriction

    // Safety check
    if (!selectedItems) {
      console.warn(
        "canEquipWeaponMote: selectedItems is undefined, allowing mote"
      );
      return true;
    }

    const equippedMotes = getEquippedWeaponMotes();

    // If mote is already equipped anywhere, it cannot be equipped again
    if (equippedMotes.includes(mote.MoteID)) {
      return false;
    }

    // Each weapon can have up to 3 motes, so we need to check if we're at the limit
    // But this validation should be done at the weapon level, not here
    // The MoteSelector doesn't know which specific weapon is being modified
    // So we'll just check for duplicate motes here
    return true;
  };

  // Get the reason why a mote cannot be equipped (for tooltip/display)
  const getMoteRestrictionReason = (mote: MoteItem): string | null => {
    if (slotType !== "weapon") return null;

    // Safety check
    if (!selectedItems) {
      return null;
    }

    const equippedMotes = getEquippedWeaponMotes();

    if (equippedMotes.includes(mote.MoteID)) {
      return "Already equipped on another weapon";
    }

    return null;
  };

  // Helper function to get mote image
  const getMoteImage = (mote: MoteItem) => {
    return mote.Img?.Icon || null;
  };

  // Helper function to get mote effect as string
  const getMoteEffect = (mote: MoteItem): string => {
    return mote.Effect || "";
  };

  const handleMoteSelect = (mote: MoteItem) => {
    console.log("MoteSelector: handleMoteSelect called with mote:", mote);
    console.log(
      "MoteSelector: canEquipWeaponMote result:",
      canEquipWeaponMote(mote)
    );

    if (canEquipWeaponMote(mote)) {
      console.log("MoteSelector: Calling onMoteSelect with mote:", mote);
      onMoteSelect(mote);
      console.log("MoteSelector: Closing modal");
      onClose(); // Close the modal after successful selection
    } else {
      const reason = getMoteRestrictionReason(mote);
      console.log("MoteSelector: Cannot equip mote, reason:", reason);
      alert(`Cannot equip this mote: ${reason}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Select ${slotType === "weapon" ? "Weapon" : "Pact"} Mote`}
    >
      {/* Show weapon mote restriction info */}
      {slotType === "weapon" && selectedItems && (
        <div
          className="mb-4 p-3 rounded"
          style={{
            backgroundColor: "var(--bg-dark)",
            border: "1px solid var(--accent-subtle)",
          }}
        >
          <div className="text-sm text-yellow-shiny font-medium mb-2">
            Weapon Mote Restriction
          </div>
          <div className="text-xs text-gray-300">
            Each weapon can equip up to 3 motes. The same mote cannot be
            equipped on multiple weapons. Currently equipped across all weapons:{" "}
            {getEquippedWeaponMotes().length}/6
          </div>
          {getEquippedWeaponMotes().length > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              Equipped motes: {getEquippedWeaponMotes().join(", ")}
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8">Loading motes...</div>
      ) : motes.length === 0 ? (
        <div
          className="text-center py-8 text-shadow"
          style={{ color: "var(--text-muted)" }}
        >
          No motes available for this slot type.
        </div>
      ) : (
        <div className="item-grid">
          {motes.map((mote) => {
            const canEquip = canEquipWeaponMote(mote);
            const restrictionReason = getMoteRestrictionReason(mote);

            return (
              <div
                key={mote.MoteID}
                className={`item-card ${
                  !canEquip
                    ? "opacity-50"
                    : "cursor-pointer hover:border-yellow-500"
                }`}
                onClick={() => {
                  console.log("MoteSelector: Mote card clicked:", mote.MoteID);
                  if (canEquip) {
                    handleMoteSelect(mote);
                  } else {
                    const reason = getMoteRestrictionReason(mote);
                    console.log(
                      "MoteSelector: Disabled mote clicked, reason:",
                      reason
                    );
                    alert(`Cannot equip this mote: ${reason}`);
                  }
                }}
                title={restrictionReason || undefined}
                style={{
                  filter: !canEquip ? "grayscale(70%)" : "none",
                  cursor: !canEquip ? "not-allowed" : "pointer",
                }}
              >
                {/* Mote image with layered background */}
                <div className="item-image-container relative">
                  {getMoteImage(mote) ? (
                    <img
                      src={getMoteImage(mote)}
                      alt={mote.MoteID}
                      className="item-image"
                    />
                  ) : (
                    <div className="item-image-placeholder">
                      {mote.MoteID.substring(0, 1)}
                    </div>
                  )}

                  {/* Show restriction overlay */}
                  {!canEquip && (
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded z-10"
                      style={{ pointerEvents: "none" }} // Only disable pointer events on the overlay, not the whole card
                    >
                      <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded border border-red-400">
                        EQUIPPED
                      </div>
                    </div>
                  )}
                </div>

                {/* Mote Name */}
                <div
                  className={`text-sm font-medium text-center mt-2 ${
                    !canEquip ? "text-gray-500" : "text-white"
                  }`}
                >
                  {mote.MoteID}
                </div>

                {/* Mote Effect */}
                <div
                  className={`text-xs text-center mt-1 ${
                    !canEquip ? "text-gray-600" : "text-gray-300"
                  }`}
                  style={{
                    height: "3rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {getMoteEffect(mote)}
                </div>

                {/* Restriction warning */}
                {!canEquip && (
                  <div className="text-xs text-red-400 mt-2 text-center font-medium">
                    Already equipped on another weapon
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default MoteSelector;
