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
  return (
    <div className="space-y-6">
      {/* Armor Section */}
      <div>
        <h3
          className="text-lg font-semibold mb-4 text-shadow"
          style={{ color: "var(--spirit-color)" }}
        >
          Armor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EquipmentSlot
            slotName="helm"
            slotType="armor"
            selectedItem={selectedItems.helm}
            onItemSelect={(item) => onItemSelect("helm", item)}
            onItemRemove={() => onItemRemove("helm")}
          />
          <EquipmentSlot
            slotName="upperbody"
            slotType="armor"
            selectedItem={selectedItems.upperBody}
            onItemSelect={(item) => onItemSelect("upperBody", item)}
            onItemRemove={() => onItemRemove("upperBody")}
          />
          <EquipmentSlot
            slotName="lowerbody"
            slotType="armor"
            selectedItem={selectedItems.lowerBody}
            onItemSelect={(item) => onItemSelect("lowerBody", item)}
            onItemRemove={() => onItemRemove("lowerBody")}
          />
          <EquipmentSlot
            slotName="totem"
            slotType="armor"
            selectedItem={selectedItems.totem}
            onItemSelect={(item) => onItemSelect("totem", item)}
            onItemRemove={() => onItemRemove("totem")}
          />
        </div>
      </div>

      {/* Weapons Section */}
      <div>
        <h3
          className="text-lg font-semibold mb-4 text-shadow"
          style={{ color: "var(--courage-color)" }}
        >
          Weapons
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EquipmentSlot
            slotName="primary"
            slotType="weapon"
            selectedItem={selectedItems.primary}
            onItemSelect={(item) => onItemSelect("primary", item)}
            onItemRemove={() => onItemRemove("primary")}
          />
          <EquipmentSlot
            slotName="secondary"
            slotType="weapon"
            selectedItem={selectedItems.sidearm}
            onItemSelect={(item) => onItemSelect("sidearm", item)}
            onItemRemove={() => onItemRemove("sidearm")}
          />
        </div>
      </div>

      {/* Pact Section */}
      <div>
        <h3
          className="text-lg font-semibold mb-4 text-shadow"
          style={{ color: "var(--grace-color)" }}
        >
          Pact
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <EquipmentSlot
            slotName="pact"
            slotType="pact"
            selectedItem={selectedItems.pact}
            onItemSelect={(item) => onItemSelect("pact", item)}
            onItemRemove={() => onItemRemove("pact")}
          />
        </div>
      </div>
    </div>
  );
};

export default ItemSelector;
