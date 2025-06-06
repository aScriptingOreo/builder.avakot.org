import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { purgeImageCache } from "./utils/imageCache";

console.log("Starting Soulframe Builder...");

const IMAGE_CACHE_VERSION = "v1"; // Increment this to force cache purge on deploy
const CACHE_MARKER_KEY = "imageCacheVersion";

(async () => {
  const currentVersion = localStorage.getItem(CACHE_MARKER_KEY);
  if (currentVersion !== IMAGE_CACHE_VERSION) {
    console.log("Purging image cache: version changed or missing");
    await purgeImageCache();
    localStorage.setItem(CACHE_MARKER_KEY, IMAGE_CACHE_VERSION);
  }

  // Create root and render app
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
})();

console.log("Soulframe Builder initialized!");
