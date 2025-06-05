import React from "react";
import { SelectedItems } from "../types/build";

interface BuildSummaryTextProps {
  selectedItems: SelectedItems;
}

const BuildSummaryText: React.FC<BuildSummaryTextProps> = ({
  selectedItems,
}) => {
  const getItemDisplayName = (item: any): string => {
    if (!item) return "None";
    return item.DisplayName || item.LinkusAlias || "Unknown Item";
  };

  const getMoteDisplayName = (mote: any): string => {
    if (!mote) return "";
    return mote.MoteID || "Unknown Mote";
  };

  const hasAnyMotes = (): boolean => {
    return Boolean(
      (selectedItems.primary && selectedItems.primary.Motes?.some((m) => m)) ||
        (selectedItems.sidearm &&
          selectedItems.sidearm.Motes?.some((m) => m)) ||
        (selectedItems.pact && selectedItems.pact.Motes?.some((m) => m))
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-medium mb-2 text-green-300">Equipment</h3>
        {Object.entries(selectedItems).map(([slot, item]) => (
          <div key={slot} className="flex justify-between">
            <span className="text-gray-400 capitalize">
              {slot === "sidearm"
                ? "Sidearm"
                : slot.replace(/([A-Z])/g, " $1").trim()}
              :
            </span>
            <span className="text-white">{getItemDisplayName(item)}</span>
          </div>
        ))}
      </div>

      {hasAnyMotes() && (
        <div className="space-y-1">
          <h3 className="text-lg font-medium mb-2 text-purple-300">Motes</h3>

          {/* Primary Weapon Motes */}
          {selectedItems.primary?.Motes?.some((m) => m) && (
            <div className="mb-2">
              <div className="text-yellow-shiny font-medium">
                Primary: {getItemDisplayName(selectedItems.primary)}
              </div>
              <div className="pl-4">
                {selectedItems.primary.Motes.map((mote, index) =>
                  mote ? (
                    <div
                      key={`primary-${index}`}
                      className="flex justify-between"
                    >
                      <span className="text-gray-400">Slot {index + 1}:</span>
                      <span className="text-white">
                        {getMoteDisplayName(mote)}
                      </span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Sidearm Motes */}
          {selectedItems.sidearm?.Motes?.some((m) => m) && (
            <div className="mb-2">
              <div className="text-yellow-shiny font-medium">
                Sidearm: {getItemDisplayName(selectedItems.sidearm)}
              </div>
              <div className="pl-4">
                {selectedItems.sidearm.Motes.map((mote, index) =>
                  mote ? (
                    <div
                      key={`sidearm-${index}`}
                      className="flex justify-between"
                    >
                      <span className="text-gray-400">Slot {index + 1}:</span>
                      <span className="text-white">
                        {getMoteDisplayName(mote)}
                      </span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Pact Motes */}
          {selectedItems.pact?.Motes?.some((m) => m) && (
            <div className="mb-2">
              <div className="text-yellow-shiny font-medium">
                Pact: {getItemDisplayName(selectedItems.pact)}
              </div>
              <div className="pl-4">
                {selectedItems.pact.Motes.map((mote, index) =>
                  mote ? (
                    <div key={`pact-${index}`} className="flex justify-between">
                      <span className="text-gray-400">Slot {index + 1}:</span>
                      <span className="text-white">
                        {getMoteDisplayName(mote)}
                      </span>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BuildSummaryText;
