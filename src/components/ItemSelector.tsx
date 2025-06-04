import { SelectedItems } from "@types/build";
import React from "react";
import EquipmentSlot from "./EquipmentSlot";

interface ItemSelectorProps {
  selectedItems: SelectedItems;
  onItemSelect: (slot: keyof SelectedItems, item: any) => void;
  onItemRemove: (slot: keyof SelectedItems) => void;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({
  selectedItems,
  onItemSelect,
  onItemRemove,
}) => {
  // Wrapper functions to prevent event propagation issues
  const handleItemSelect = (slot: keyof SelectedItems) => (item: any) => {
    onItemSelect(slot, item);
  };

  const handleItemRemove = (slot: keyof SelectedItems) => () => {
    onItemRemove(slot);
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
          />
          <EquipmentSlot
            slotName="secondary"
            slotType="weapon"
            selectedItem={selectedItems.sidearm}
            onItemSelect={handleItemSelect("sidearm")}
            onItemRemove={handleItemRemove("sidearm")}
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
          />
        </div>
      </div>
    </div>
  );
};

export default ItemSelector;
