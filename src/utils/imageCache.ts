import localforage from "localforage";

const IMAGE_CACHE_KEY_PREFIX = "sf-img-cache-";
const IMAGE_CACHE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 365; // 1 year

// Helper to get the cache key for a given image URL
function getCacheKey(url: string) {
  return IMAGE_CACHE_KEY_PREFIX + url;
}

// Get a cached image as a blob URL, or fetch/cache it if not present or expired
export async function getCachedImageUrl(url: string): Promise<string> {
  const cacheKey = getCacheKey(url);
  const cached = await localforage.getItem<{ blob: Blob; timestamp: number }>(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < IMAGE_CACHE_EXPIRY_MS) {
    return URL.createObjectURL(cached.blob);
  }

  // Fetch and cache
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Failed to fetch image: " + url);
  const blob = await resp.blob();
  await localforage.setItem(cacheKey, { blob, timestamp: now });
  return URL.createObjectURL(blob);
}

// Purge all cached images
export async function purgeImageCache() {
  await localforage.iterate((value, key, iterationNumber) => {
    if (key.startsWith(IMAGE_CACHE_KEY_PREFIX)) {
      localforage.removeItem(key);
    }
  });
}
