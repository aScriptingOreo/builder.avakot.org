import React from "react";
import { SelectedItems } from "../types/build";
import EquipmentSlot from "./EquipmentSlot";

interface ItemSelectorProps {
  selectedItems: SelectedItems;
  onItemSelect: (slot: keyof SelectedItems, item: any) => void;
  onItemRemove: (slot: keyof SelectedItems) => void;
  onMoteSelect: (
    slot: keyof SelectedItems,
    moteIndex: number,
    mote: any
  ) => void;
  onMoteRemove: (slot: keyof SelectedItems, moteIndex: number) => void;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({
  selectedItems,
  onItemSelect,
  onItemRemove,
  onMoteSelect,
  onMoteRemove,
}) => {
  return (
    <div className="space-y-8">
      {/* Armor Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-blue-300">Armor</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Important: Use specific slot types like "helm", not generic "armor" */}
          <EquipmentSlot
            slotType="helm"
            selectedItem={selectedItems.helm}
            selectedItems={selectedItems}
            onItemSelect={(item) => onItemSelect("helm", item)}
            onItemRemove={() => onItemRemove("helm")}
            onMoteSelect={(moteIndex, mote) =>
              onMoteSelect("helm", moteIndex, mote)
            }
            onMoteRemove={(moteIndex) => onMoteRemove("helm", moteIndex)}
          />
          <EquipmentSlot
            slotType="upperBody"
            selectedItem={selectedItems.upperBody}
            selectedItems={selectedItems}
            onItemSelect={(item) => onItemSelect("upperBody", item)}
            onItemRemove={() => onItemRemove("upperBody")}
            onMoteSelect={(moteIndex, mote) =>
              onMoteSelect("upperBody", moteIndex, mote)
            }
            onMoteRemove={(moteIndex) => onMoteRemove("upperBody", moteIndex)}
          >
            <span className="equipment-slot-label">Cuirass</span>
          </EquipmentSlot>
          <EquipmentSlot
            slotType="lowerBody"
            selectedItem={selectedItems.lowerBody}
            selectedItems={selectedItems}
            onItemSelect={(item) => onItemSelect("lowerBody", item)}
            onItemRemove={() => onItemRemove("lowerBody")}
            onMoteSelect={(moteIndex, mote) =>
              onMoteSelect("lowerBody", moteIndex, mote)
            }
            onMoteRemove={(moteIndex) => onMoteRemove("lowerBody", moteIndex)}
          >
            <span className="equipment-slot-label">Leggings</span>
          </EquipmentSlot>
          <EquipmentSlot
            slotType="totem"
            selectedItem={selectedItems.totem}
            selectedItems={selectedItems}
            onItemSelect={(item) => onItemSelect("totem", item)}
            onItemRemove={() => onItemRemove("totem")}
            onMoteSelect={(moteIndex, mote) =>
              onMoteSelect("totem", moteIndex, mote)
            }
            onMoteRemove={(moteIndex) => onMoteRemove("totem", moteIndex)}
          />
        </div>
      </div>

      {/* Pact Section - Moved up before weapons */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-purple-300">Pact</h2>
        <div className="grid grid-cols-1 gap-4">
          <EquipmentSlot
            slotType="pact"
            selectedItem={selectedItems.pact}
            selectedItems={selectedItems}
            onItemSelect={(item) => onItemSelect("pact", item)}
            onItemRemove={() => onItemRemove("pact")}
            onMoteSelect={(moteIndex, mote) =>
              onMoteSelect("pact", moteIndex, mote)
            }
            onMoteRemove={(moteIndex) => onMoteRemove("pact", moteIndex)}
          />
        </div>
      </div>

      {/* Weapons Section - Moved to last */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-red-300">Weapons</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Important: Use specific slot types like "primary", not generic "weapon" */}
          <EquipmentSlot
            slotType="primary"
            selectedItem={selectedItems.primary}
            selectedItems={selectedItems}
            onItemSelect={(item) => onItemSelect("primary", item)}
            onItemRemove={() => onItemRemove("primary")}
            onMoteSelect={(moteIndex, mote) =>
              onMoteSelect("primary", moteIndex, mote)
            }
            onMoteRemove={(moteIndex) => onMoteRemove("primary", moteIndex)}
          />
          <EquipmentSlot
            slotType="sidearm"
            selectedItem={selectedItems.sidearm}
            selectedItems={selectedItems}
            onItemSelect={(item) => onItemSelect("sidearm", item)}
            onItemRemove={() => onItemRemove("sidearm")}
            onMoteSelect={(moteIndex, mote) =>
              onMoteSelect("sidearm", moteIndex, mote)
            }
            onMoteRemove={(moteIndex) => onMoteRemove("sidearm", moteIndex)}
          />
        </div>
      </div>
    </div>
  );
};

export default ItemSelector;
