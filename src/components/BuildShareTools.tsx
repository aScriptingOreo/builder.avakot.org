import localforage from "localforage";
import React, { useState } from "react";
import { SelectedItems } from "../types/build";
import {
    buildToString,
    parseBuildString,
    restoreBuildFromIdentifiers,
    serializeBuild,
} from "../utils/buildUtils";

interface BuildShareToolsProps {
  selectedItems: SelectedItems;
  playerStats: {
    masteryRank: number;
    virtuePoints: { grace: number; spirit: number; courage: number };
  };
  onImportFullBuild: (build: { selectedItems: SelectedItems; playerStats: { masteryRank: number; virtuePoints: { grace: number; spirit: number; courage: number } } }) => void;
}

const BuildShareTools: React.FC<BuildShareToolsProps> = ({
  selectedItems,
  playerStats,
  onImportFullBuild,
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [importError, setImportError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Export build to clipboard
  const exportBuild = () => {
    try {
      const fullBuild = serializeBuild(selectedItems, playerStats);
      const hash = buildToString(fullBuild);
      navigator.clipboard.writeText(hash).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
      return hash;
    } catch (error) {
      console.error("Error exporting build:", error);
      return "";
    }
  };

  // Import a build from a hash
  const importBuild = async (hash: string) => {
    setIsImporting(true);
    setImportError("");
    try {
      const fullBuild = parseBuildString(hash.trim());
      if (!fullBuild || !fullBuild.equipment || !fullBuild.playerStats) {
        throw new Error("Invalid build data format");
      }
      const restored = await restoreBuildFromIdentifiers(fullBuild);
      onImportFullBuild(restored);
      setShowImportModal(false);
      setImportCode("");
    } catch (error) {
      console.error("Error importing build:", error);
      setImportError(
        "Failed to import build. Please check the code and try again."
      );
    } finally {
      setIsImporting(false);
    }
  };

  // Clear all localforage data and reload
  const clearAllData = async () => {
    if (window.confirm("Are you sure you want to clear all saved Soulframe builder data? This cannot be undone.")) {
      await localforage.clear();
      window.location.reload();
    }
  };

  return (
    <>
      <div className="flex space-x-2 items-center">
        <button
          onClick={() => exportBuild()}
          className="px-3 py-1 text-sm rounded flex items-center gap-1 shadow-md transition-all duration-100 hover:scale-105 hover:bg-opacity-90 active:scale-95 active:brightness-90"
          style={{
            backgroundColor: "var(--spirit-color)",
            color: "white",
            minWidth: 90,
            whiteSpace: "nowrap"
          }}
          title="Export build to clipboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            <path d="M8 13h8"></path>
            <path d="M8 17h8"></path>
            <path d="M8 9h8"></path>
          </svg>
          {copied ? "Copied!" : "Export"}
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          className="px-3 py-1 text-sm rounded flex items-center gap-1 shadow-md transition-all duration-100 hover:scale-105 hover:bg-opacity-90 active:scale-95 active:brightness-90"
          style={{
            backgroundColor: "var(--grace-color)",
            color: "white",
            minWidth: 90,
            whiteSpace: "nowrap"
          }}
          title="Import build from code"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          Import
        </button>
        <button
          onClick={clearAllData}
          className="px-3 py-1 text-sm rounded flex items-center gap-1 shadow-md transition-all duration-100 hover:scale-105 hover:bg-opacity-90 active:scale-95 active:brightness-90"
          style={{
            backgroundColor: "#b91c1c",
            color: "white",
            minWidth: 120,
            whiteSpace: "nowrap"
          }}
          title="Clear all saved builder data (reset)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9l6 6M15 9l-6 6"/></svg>
          Clear Data
        </button>
        <a
          href="https://ko-fi.com/ascriptingoreo"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 text-sm rounded flex items-center gap-2 shadow-md transition-all duration-100 hover:scale-105 hover:bg-opacity-90 active:scale-95 active:brightness-90"
          style={{
            backgroundColor: "var(--courage-color)",
            color: "white",
            minWidth: 130,
            whiteSpace: "nowrap",
            justifyContent: "center"
          }}
          title="Support the developer on Ko-Fi"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
          <span className="font-medium whitespace-nowrap">Send Love</span>
        </a>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md flex flex-col gap-4"
            style={{
              backgroundColor: "var(--bg-darker)",
              border: "1px solid var(--accent-subtle)",
            }}
          >
            <h3 className="text-xl font-medium text-yellow-shiny">
              Import Build
            </h3>
            <p className="text-sm text-gray-300">
              Paste a build code below to import a shared build.
            </p>

            <textarea
              className="w-full p-3 text-sm font-mono rounded"
              style={{
                backgroundColor: "var(--bg-dark)",
                borderColor: importError ? "red" : "var(--accent-subtle)",
                color: "var(--text-primary)",
                height: "120px",
              }}
              value={importCode}
              onChange={(e) => {
                setImportCode(e.target.value);
                setImportError("");
              }}
              placeholder="Paste build code here..."
              disabled={isImporting}
            />

            {importError && (
              <p className="text-red-400 text-sm">{importError}</p>
            )}

            <div className="flex justify-end gap-2 mt-2">
              <button
                className="px-4 py-2 text-gray-300 hover:text-white"
                onClick={() => setShowImportModal(false)}
                disabled={isImporting}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded flex items-center gap-2"
                style={{
                  backgroundColor: "var(--grace-color)",
                  color: "white",
                  opacity: isImporting ? 0.7 : 1,
                }}
                onClick={() => importBuild(importCode)}
                disabled={!importCode.trim() || isImporting}
              >
                {isImporting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Import"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BuildShareTools;
