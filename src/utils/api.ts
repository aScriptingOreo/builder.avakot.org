const API_BASE_URL = 'https://wiki.avakot.org/linkus';

// Helper function to fetch data from an endpoint
export async function fetchData(endpoint: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) {
      console.error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching or parsing ${endpoint}:`, error);
    return [];
  }
}

// Cache for defaultDict to avoid repeated requests
let defaultDictCache: any[] | null = null;

export async function getDefaultDict(): Promise<any[]> {
  if (defaultDictCache) {
    return defaultDictCache;
  }
  
  defaultDictCache = await fetchData('defaultDict');
  return defaultDictCache;
}

export async function resolveDisplayName(linkusAlias: string): Promise<string> {
  try {
    const defaultDict = await getDefaultDict();
    const entry = defaultDict.find(item => item.LinkusMap === linkusAlias);
    if (entry && entry.LinkusAlias) {
      return Array.isArray(entry.LinkusAlias) ? entry.LinkusAlias[0] : entry.LinkusAlias;
    }
    return linkusAlias;
  } catch (error) {
    console.error('Error resolving display name:', error);
    return linkusAlias;
  }
}

export async function resolveCraftingItemName(itemString: string): Promise<string> {
  const [key, value] = itemString.split(':');
  if (!key) return itemString;
  
  const displayName = await resolveDisplayName(key);
  return value ? `${displayName}:${value}` : displayName;
}
