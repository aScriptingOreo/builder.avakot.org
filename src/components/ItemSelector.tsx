import { SelectedItems } from "@types/build";
import React from "react";
import EquipmentSlot from "./EquipmentSlot";

interface MoteItem {
  MoteID: string;
  DisplayName?: string;
  Img?: {
    Icon?: string;
  };
  Effect?: string | string[];
  Slot?: string;
}

interface ItemSelectorProps {
  selectedItems: SelectedItems;
  onItemSelect: (slot: keyof SelectedItems, item: any) => void;
  onItemRemove: (slot: keyof SelectedItems) => void;
  onMoteSelect?: (
    slot: keyof SelectedItems,
    moteIndex: number,
    mote: MoteItem
  ) => void;
  onMoteRemove?: (slot: keyof SelectedItems, moteIndex: number) => void;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({
  selectedItems,
  onItemSelect,
  onItemRemove,
  onMoteSelect,
  onMoteRemove,
}) => {
  // Wrapper functions to prevent event propagation issues
  const handleItemSelect = (slot: keyof SelectedItems) => (item: any) => {
    onItemSelect(slot, item);
  };

  const handleItemRemove = (slot: keyof SelectedItems) => () => {
    onItemRemove(slot);
  };

  const handleMoteSelect =
    (slot: keyof SelectedItems) => (moteIndex: number, mote: MoteItem) => {
      if (onMoteSelect) {
        onMoteSelect(slot, moteIndex, mote);
      }
    };

  const handleMoteRemove =
    (slot: keyof SelectedItems) => (moteIndex: number) => {
      if (onMoteRemove) {
        onMoteRemove(slot, moteIndex);
      }
    };

  return (
    <div className="space-y-4">
      {/* Armor Section */}
      <div>
        <h3 className="equipment-slot-header mb-3 text-lg font-semibold text-shadow-heavy text-spirit">
          Armor
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <EquipmentSlot
            slotName="helm"
            slotType="armor"
            selectedItem={selectedItems.helm}
            onItemSelect={handleItemSelect("helm")}
            onItemRemove={handleItemRemove("helm")}
          />
          <EquipmentSlot
            slotName="upperbody"
            slotType="armor"
            selectedItem={selectedItems.upperBody}
            onItemSelect={handleItemSelect("upperBody")}
            onItemRemove={handleItemRemove("upperBody")}
          />
          <EquipmentSlot
            slotName="lowerbody"
            slotType="armor"
            selectedItem={selectedItems.lowerBody}
            onItemSelect={handleItemSelect("lowerBody")}
            onItemRemove={handleItemRemove("lowerBody")}
          />
          <EquipmentSlot
            slotName="totem"
            slotType="armor"
            selectedItem={selectedItems.totem}
            onItemSelect={handleItemSelect("totem")}
            onItemRemove={handleItemRemove("totem")}
          />
        </div>
      </div>

      {/* Weapons Section */}
      <div>
        <h3 className="equipment-slot-header mb-3 text-lg font-semibold text-shadow-heavy text-courage">
          Weapons
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <EquipmentSlot
            slotName="primary"
            slotType="weapon"
            selectedItem={selectedItems.primary}
            onItemSelect={handleItemSelect("primary")}
            onItemRemove={handleItemRemove("primary")}
            onMoteSelect={handleMoteSelect("primary")}
            onMoteRemove={handleMoteRemove("primary")}
          />
          <EquipmentSlot
            slotName="secondary"
            slotType="weapon"
            selectedItem={selectedItems.sidearm}
            onItemSelect={handleItemSelect("sidearm")}
            onItemRemove={handleItemRemove("sidearm")}
            onMoteSelect={handleMoteSelect("sidearm")}
            onMoteRemove={handleMoteRemove("sidearm")}
          />
        </div>
      </div>

      {/* Pact Section */}
      <div>
        <h3 className="equipment-slot-header mb-3 text-lg font-semibold text-shadow-heavy text-grace">
          Pact
        </h3>
        <div className="grid grid-cols-1">
          <EquipmentSlot
            slotName="pact"
            slotType="pact"
            selectedItem={selectedItems.pact}
            onItemSelect={handleItemSelect("pact")}
            onItemRemove={handleItemRemove("pact")}
            onMoteSelect={handleMoteSelect("pact")}
            onMoteRemove={handleMoteRemove("pact")}
          />
        </div>
      </div>
    </div>
  );
};

export default ItemSelector;
