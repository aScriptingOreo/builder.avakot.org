import React, { useEffect, useState } from "react";
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
}

const MoteSelector: React.FC<MoteSelectorProps> = ({
  slotType,
  isOpen,
  onClose,
  onMoteSelect,
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

  // Helper function to get mote image
  const getMoteImage = (mote: MoteItem) => {
    return mote.Img?.Icon || null;
  };

  // Helper function to get mote effect as string
  const getMoteEffect = (mote: MoteItem): string => {
    return mote.Effect || "";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Select ${slotType === "weapon" ? "Weapon" : "Pact"} Mote`}
    >
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
          {motes.map((mote) => (
            <div
              key={mote.MoteID}
              className="item-card"
              onClick={() => onMoteSelect(mote)}
            >
              {/* Mote image with layered background */}
              <div className="item-image-container">
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
              </div>

              {/* Mote Name */}
              <div
                className="item-name"
                style={{ color: "var(--text-primary)" }}
              >
                {mote.MoteID}
              </div>

              {/* Mote Effect */}
              <div
                className="item-slot text-xs"
                style={{
                  height: "3rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {getMoteEffect(mote)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default MoteSelector;
