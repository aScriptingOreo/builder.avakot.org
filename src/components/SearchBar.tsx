import React, { useEffect, useRef, useState } from 'react';
import { SelectedItems } from "../types/build";
import Modal from "./Modal";
import StatIcon from "./StatIcon";

// Define colors for each armor slot to match StatsDisplay
const ARMOR_SLOT_COLORS = {
  helm: "#3b82f6", // Blue
  upperBody: "#10b981", // Green
  lowerBody: "#8b5cf6", // Purple
  totem: "#f59e0b", // Amber/gold
};

// Add color for pact
const PACT_COLOR = "#ef4444"; // Red

// Define filter types and their options
const FILTER_OPTIONS = {
  type: [
    { value: 'armor', label: 'Armor', color: '#3b82f6' }, // Blue
    { value: 'weapon', label: 'Weapon', color: '#ef4444' }, // Red
    { value: 'pact', label: 'Pact', color: '#8b5cf6' }, // Purple
  ],
  slot: [
    { value: 'helm', label: 'Helm', color: ARMOR_SLOT_COLORS.helm },
    { value: 'upperBody', label: 'Cuirass', color: ARMOR_SLOT_COLORS.upperBody },
    { value: 'lowerBody', label: 'Leggings', color: ARMOR_SLOT_COLORS.lowerBody },
    { value: 'totem', label: 'Totem', color: ARMOR_SLOT_COLORS.totem },
    { value: 'primary', label: 'Primary', color: '#ef4444' },
    { value: 'sidearm', label: 'Sidearm', color: '#dc2626' },
  ],
  stat: [
    { value: 'physicalDefence', label: 'Physical Defence', color: '#6b7280' },
    { value: 'magickDefence', label: 'Magick Defence', color: '#5b21b6' },
    { value: 'stability', label: 'Stability', color: '#047857' },
    { value: 'bonusHP', label: 'Bonus HP', color: '#b91c1c' },
  ],
  virtue: [
    { value: 'grace', label: 'Grace', color: 'var(--grace-color)' },
    { value: 'spirit', label: 'Spirit', color: 'var(--spirit-color)' },
    { value: 'courage', label: 'Courage', color: 'var(--courage-color)' },
  ],
  set: [] // Dynamic based on data
};

// Interface for filter pills
interface FilterPill {
  type: string;
  value: string;
  label: string;
  color: string;
}

interface SearchBarProps {
  selectedItems: SelectedItems;
  onItemSelect: (slot: keyof SelectedItems, item: any) => void;
  onItemRemove?: (slot: keyof SelectedItems) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  selectedItems, 
  onItemSelect,
  onItemRemove = (slot) => {} // Default empty function if not provided
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilterType, setActiveFilterType] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterPills, setFilterPills] = useState<FilterPill[]>([]);
  
  const [allItems, setAllItems] = useState<{
    weapons: any[];
    armors: any[];
    pacts: any[];
  }>({
    weapons: [],
    armors: [],
    pacts: []
  });
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Add state for screen width detection
  const [isWideEnough, setIsWideEnough] = useState(window.innerWidth >= 640);
  
  // Add effect for screen width monitoring
  useEffect(() => {
    const handleResize = () => {
      setIsWideEnough(window.innerWidth >= 640);
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial data fetching
  useEffect(() => {
    if (isOpen && (allItems.weapons.length === 0 || allItems.armors.length === 0 || allItems.pacts.length === 0)) {
      fetchAllItems();
    }
  }, [isOpen]);

  const fetchAllItems = async () => {
    setIsLoading(true);
    try {
      const [weapons, armors, pacts] = await Promise.all([
        fetchItems('weapons'),
        fetchItems('armors'),
        fetchItems('pacts')
      ]);
      
      console.log("Fetched items:", { weapons: weapons.length, armors: armors.length, pacts: pacts.length });
      
      setAllItems({
        weapons,
        armors,
        pacts
      });
      
      // Extract unique sets for the set filter options
      const sets = new Set<string>();
      armors.forEach(armor => {
        if (armor.Set && typeof armor.Set === 'string') {
          sets.add(armor.Set);
        }
      });
      
      FILTER_OPTIONS.set = Array.from(sets).map(set => ({
        value: set.toLowerCase(),
        label: set,
        color: '#d97706' // Amber
      }));
      
      // Apply initial filters
      filterItemsWithPills(weapons, armors, pacts, filterPills, searchTerm);
    } catch (error) {
      console.error('Error fetching items for search:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generic item fetching function
  const fetchItems = async (queryName: string): Promise<any[]> => {
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query Get${queryName.charAt(0).toUpperCase() + queryName.slice(1)} {
              ${queryName} {
                LinkusAlias
                LinkusMap
                DisplayName
                ${queryName !== 'pacts' ? 'Slot' : ''}
                ${queryName === 'weapons' ? 'Art Rarity' : queryName === 'armors' ? 'Set' : ''}
                Stats {
                  ${queryName === 'weapons' ? 'Smite lvl0 { Stagger Attack ChargedAttack DamageAttuneCap }' : 
                    queryName === 'armors' ? 'MagickDefence PhysicalDefence StabilityIncrease Virtue { Type Value }' : 
                    'BonusHP BonusVirtue { Type Value } UnarmedDmg MagickDefence PhysicalDefence StabilityIncrease'
                  }
                }
                Img {
                  Preview
                  Icon
                }
              }
            }
          `
        }),
      });

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors.map((e: any) => e.message).join(', '));
      }
      return result.data[queryName] || [];
    } catch (error) {
      console.error(`Error fetching ${queryName}:`, error);
      return [];
    }
  };

  // Filter items using pills and search term
  const filterItemsWithPills = (weapons: any[], armors: any[], pacts: any[], pills: FilterPill[], term: string) => {
    let results: any[] = [];
    
    // Collect filter values by type
    const filters = {
      type: pills.filter(p => p.type === 'type').map(p => p.value),
      slot: pills.filter(p => p.type === 'slot').map(p => p.value),
      stat: pills.filter(p => p.type === 'stat').map(p => p.value),
      virtue: pills.filter(p => p.type === 'virtue').map(p => p.value),
      set: pills.filter(p => p.type === 'set').map(p => p.value),
    };
    
    // Apply item type filter
    if (filters.type.length === 0 || filters.type.includes('armor')) {
      results = [...results, ...armors];
    }
    if (filters.type.length === 0 || filters.type.includes('weapon')) {
      results = [...results, ...weapons];
    }
    if (filters.type.length === 0 || filters.type.includes('pact')) {
      results = [...results, ...pacts];
    }
    
    // Apply slot filter
    if (filters.slot.length > 0) {
      results = results.filter(item => {
        const slotValue = item.Slot?.toLowerCase();
        return slotValue && filters.slot.some(s => slotValue === s);
      });
    }
    
    // Apply search term filter (case-insensitive)
    if (term) {
      const termLower = term.toLowerCase();
      results = results.filter(item => {
        return (
          (item.DisplayName && item.DisplayName.toLowerCase().includes(termLower)) ||
          (item.LinkusAlias && item.LinkusAlias.toLowerCase().includes(termLower)) ||
          (item.Set && item.Set.toLowerCase().includes(termLower)) ||
          (item.Art && item.Art.toLowerCase().includes(termLower))
        );
      });
    }
    
    // Apply stat filter
    if (filters.stat.length > 0) {
      results = results.filter(item => {
        if (!item.Stats) return false;
        
        return filters.stat.some(statType => {
          if (statType === 'physicalDefence') {
            return item.Stats.PhysicalDefence && parseFloat(item.Stats.PhysicalDefence) > 0;
          }
          if (statType === 'magickDefence') {
            return item.Stats.MagickDefence && parseFloat(item.Stats.MagickDefence) > 0;
          }
          if (statType === 'stability') {
            return item.Stats.StabilityIncrease && parseFloat(item.Stats.StabilityIncrease) > 0;
          }
          if (statType === 'bonusHP') {
            return item.Stats.BonusHP && parseFloat(item.Stats.BonusHP) > 0;
          }
          return false;
        });
      });
    }
    
    // Apply virtue filter
    if (filters.virtue.length > 0) {
      results = results.filter(item => {
        if (!item.Stats) return false;
        
        return filters.virtue.some(virtueType => {
          // Check for Totem virtue
          if (item.Stats.Virtue && item.Stats.Virtue.Type) {
            return item.Stats.Virtue.Type.toLowerCase() === virtueType;
          }
          
          // Check for Pact bonus virtue
          if (item.Stats.BonusVirtue && item.Stats.BonusVirtue.Type) {
            return item.Stats.BonusVirtue.Type.toLowerCase() === virtueType;
          }
          
          return false;
        });
      });
    }
    
    // Apply set filter
    if (filters.set.length > 0) {
      results = results.filter(item => {
        if (!item.Set) return false;
        const setLower = item.Set.toLowerCase();
        return filters.set.some(s => setLower.includes(s));
      });
    }
    
    setSearchResults(results);
  };

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Check if input contains filter syntax (e.g., "type:")
    const filterMatch = value.match(/(\w+):$/);
    if (filterMatch) {
      const filterType = filterMatch[1].toLowerCase();
      
      // Check if it's a valid filter type
      if (FILTER_OPTIONS[filterType as keyof typeof FILTER_OPTIONS]) {
        setActiveFilterType(filterType);
        setSuggestions(FILTER_OPTIONS[filterType as keyof typeof FILTER_OPTIONS]);
        setShowSuggestions(true);
        setActiveSuggestion(0);
      } else {
        setActiveFilterType(null);
        setShowSuggestions(false);
      }
    } else {
      // If no filter syntax, just update the search term
      if (!value.includes(':')) {
        setSearchTerm(value);
        if (allItems.weapons.length > 0) {
          // Apply only term filter with existing pills
          filterItemsWithPills(
            allItems.weapons, 
            allItems.armors, 
            allItems.pacts, 
            filterPills,
            value
          );
        }
      }
      setActiveFilterType(null);
      setShowSuggestions(false);
    }
  };

  // Handle key down events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If suggestions are shown, handle navigation
    if (showSuggestions) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveSuggestion(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveSuggestion(prev => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions.length > 0) {
            selectSuggestion(suggestions[activeSuggestion]);
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (suggestions.length > 0) {
            selectSuggestion(suggestions[activeSuggestion]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
        default:
          break;
      }
    } else if (e.key === 'Enter') {
      // If no suggestions shown but Enter pressed, treat as search query
      e.preventDefault();
      const value = searchInput.trim();
      
      // Check if it's a filter command (has colon)
      if (value.includes(':')) {
        const [type, val] = value.split(':');
        if (type && val && FILTER_OPTIONS[type as keyof typeof FILTER_OPTIONS]) {
          const filterType = type.toLowerCase();
          const filterValue = val.trim().toLowerCase();
          
          // Find matching option
          const option = FILTER_OPTIONS[filterType as keyof typeof FILTER_OPTIONS].find(
            opt => opt.value === filterValue || opt.label.toLowerCase() === filterValue
          );
          
          if (option) {
            addFilterPill(filterType, option.value, option.label, option.color);
            setSearchInput('');
          }
        }
      } else {
        // Simple search term
        setSearchTerm(value);
        // Apply filters
        filterItemsWithPills(
          allItems.weapons,
          allItems.armors,
          allItems.pacts,
          filterPills,
          value
        );
      }
    }
  };

  // Select a suggestion from the dropdown
  const selectSuggestion = (suggestion: any) => {
    addFilterPill(
      activeFilterType!, 
      suggestion.value, 
      suggestion.label,
      suggestion.color
    );
    
    setSearchInput('');
    setShowSuggestions(false);
    setActiveFilterType(null);
    
    // Focus back on the input
    searchInputRef.current?.focus();
  };

  // Filter and search logic - Define filterItems function to properly call filterItemsWithPills
  const filterItems = () => {
    if (!allItems.weapons.length) return; // Skip if data hasn't loaded yet
    
    setIsLoading(true);
    setTimeout(() => { // Use setTimeout to ensure UI updates with loading state
      filterItemsWithPills(
        allItems.weapons, 
        allItems.armors, 
        allItems.pacts, 
        filterPills, 
        searchTerm
      );
      setIsLoading(false);
    }, 10);
  };

  // Add a filter pill - Modified to trigger filtering immediately
  const addFilterPill = (type: string, value: string, label: string, color: string) => {
    // Check if pill already exists
    const exists = filterPills.some(
      pill => pill.type === type && pill.value === value
    );
    
    if (!exists) {
      const newPill: FilterPill = { type, value, label, color };
      const updatedPills = [...filterPills, newPill];
      setFilterPills(updatedPills);
      
      // Apply filters if we have data - Call filterItemsWithPills directly
      if (allItems.weapons.length > 0) {
        filterItemsWithPills(
          allItems.weapons,
          allItems.armors,
          allItems.pacts,
          updatedPills,
          searchTerm
        );
      }
    }
  };

  // Remove a filter pill - Modified to trigger filtering immediately
  const removeFilterPill = (index: number) => {
    const updatedPills = filterPills.filter((_, i) => i !== index);
    setFilterPills(updatedPills);
    
    // Apply updated filters immediately
    if (allItems.weapons.length > 0) {
      filterItemsWithPills(
        allItems.weapons,
        allItems.armors,
        allItems.pacts,
        updatedPills,
        searchTerm
      );
    }
  };

  // Clear all filters - Ensure this immediately updates results
  const clearFilters = () => {
    setFilterPills([]);
    setSearchTerm('');
    setSearchInput('');
    
    if (allItems.weapons.length > 0) {
      filterItemsWithPills(
        allItems.weapons,
        allItems.armors,
        allItems.pacts,
        [],
        ''
      );
    }
  };

  // Modified item selection handler to handle unequipping
  const handleItemSelect = (item: any) => {
    // Check if item is already equipped in any slot
    let isEquipped = false;
    let equippedSlot: keyof SelectedItems | undefined;
    
    Object.entries(selectedItems).forEach(([slot, slotItem]) => {
      if (slotItem && slotItem.LinkusAlias === item.LinkusAlias) {
        isEquipped = true;
        equippedSlot = slot as keyof SelectedItems;
      }
    });
    
    // If the item is already equipped, unequip it
    if (isEquipped && equippedSlot) {
      onItemRemove(equippedSlot);
      return;
    }
    
    // Otherwise determine appropriate slot and equip it
    let targetSlot: keyof SelectedItems | null = null;
    
    if (item.Slot) {
      // For armors and weapons that have a Slot property
      switch (item.Slot) {
        case 'Helm':
          targetSlot = 'helm';
          break;
        case 'UpperBody':
          targetSlot = 'upperBody';
          break;
        case 'LowerBody':
          targetSlot = 'lowerBody';
          break;
        case 'Totem':
          targetSlot = 'totem';
          break;
        case 'Primary':
          targetSlot = 'primary';
          break;
        case 'Sidearm':
          targetSlot = 'sidearm';
          break;
        default:
          break;
      }
    } else {
      // For pacts (which don't have a Slot property)
      targetSlot = 'pact';
    }
    
    if (targetSlot) {
      onItemSelect(targetSlot, item);
    }
  };
  
  // Get color for slot
  const getSlotColor = (slot: string): string => {
    switch (slot) {
      case 'Helm': return ARMOR_SLOT_COLORS.helm;
      case 'UpperBody': return ARMOR_SLOT_COLORS.upperBody;
      case 'LowerBody': return ARMOR_SLOT_COLORS.lowerBody;
      case 'Totem': return ARMOR_SLOT_COLORS.totem;
      case 'Pact': return PACT_COLOR;
      default: return 'var(--text-primary)';
    }
  };

  // Helper function to get the best available image
  const getItemImage = (item: any) => {
    if (!item.Img) return null;
    return item.Img.Preview || item.Img.Icon || null;
  };

  // Helper function to get virtue color
  const getVirtueColor = (type: string): string => {
    switch (type?.toLowerCase()) {
      case "grace": return "var(--grace-color)";
      case "spirit": return "var(--spirit-color)";
      case "courage": return "var(--courage-color)";
      default: return "var(--yellow-shiny)";
    }
  };

  // Helper function to get virtue icon URL
  const getVirtueIcon = (type: string): string => {
    switch (type?.toLowerCase()) {
      case "grace": return "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/HUD/GraceSunIcon.png";
      case "spirit": return "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/HUD/SpiritMoonIcon.png";
      case "courage": return "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/HUD/CourageSunIcon.png";
      default: return "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Icons/StarIcon.png";
    }
  };

  // Helper to get user-facing slot display name
  const getSlotDisplayName = (slot: string): string => {
    switch (slot) {
      case 'Helm':
      case 'helm':
        return 'Helm';
      case 'UpperBody':
      case 'upperBody':
        return 'Cuirass';
      case 'LowerBody':
      case 'lowerBody':
        return 'Leggings';
      case 'Totem':
      case 'totem':
        return 'Totem';
      case 'Primary':
      case 'primary':
        return 'Primary';
      case 'Sidearm':
      case 'sidearm':
        return 'Sidearm';
      case 'Pact':
      case 'pact':
        return 'Pact';
      default:
        return slot;
    }
  };

  return (
    <div className="search-container mb-4">
      <button 
        className="btn-primary w-full"
        onClick={() => setIsOpen(true)}
      >
        Search All Items
      </button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Search Equipment"
        className="search-modal"
      >
        <div className="search-content fixed-search-layout">
          {/* Fixed Search Bar Section */}
          <div className="search-bar-fixed">
            {/* Filter Pills */}
            <div className="filter-pills flex flex-wrap gap-2 mb-2">
              {filterPills.map((pill, index) => (
                <div 
                  key={`${pill.type}-${pill.value}-${index}`}
                  className="filter-pill flex items-center gap-1.5 px-2 py-0.5 rounded-full text-white text-sm"
                  style={{ backgroundColor: pill.color }}
                >
                  <span className="font-medium">{pill.type}:</span>
                  <span>{pill.type === 'slot' ? getSlotDisplayName(pill.label) : pill.label}</span>
                  <button
                    className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center"
                    onClick={() => removeFilterPill(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
              {filterPills.length > 0 && (
                <button
                  className="clear-filters text-xs text-gray-400 hover:text-white px-2 underline"
                  onClick={clearFilters}
                >
                  Clear all
                </button>
              )}
            </div>
            
            {/* Search Input - Modified with spacing and circular button */}
            <div className="flex items-center">
              <input 
                type="text"
                ref={searchInputRef}
                className="flex-grow p-2 rounded border border-gray-600 bg-gray-700 text-white"
                placeholder={filterPills.length > 0 
                  ? "Continue searching..." 
                  : "Search by name or use type:, slot:, stat:, virtue:, set:"}
                value={searchInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <button 
                className="search-button ml-3 flex items-center justify-center rounded-full"
                onClick={filterItems}
                title="Search"
                aria-label="Search"
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
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="suggestions-dropdown absolute left-0 right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded shadow-lg z-20"
              >
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={suggestion.value}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-700 flex items-center gap-2 ${
                        index === activeSuggestion ? 'bg-gray-700' : ''
                      }`}
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: suggestion.color }}
                      ></span>
                      <span>{suggestion.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Search Hints */}
            <div className="search-hints text-xs text-gray-400 mb-4">
              <p>
                Search by item name, or use filters like <span className="text-yellow-500">type:</span> (armor, weapon, pact), 
                <span className="text-yellow-500"> slot:</span> (helm, totem, etc.), 
                <span className="text-yellow-500"> stat:</span>, 
                <span className="text-yellow-500"> virtue:</span>, or 
                <span className="text-yellow-500"> set:</span>
              </p>
              
              {/* Search Results Summary */}
              <p className="mt-2 flex justify-between items-center">
                <span className="font-medium">{searchResults.length} items found</span>
                <span>Click an item to {isWideEnough ? 'equip or unequip it' : 'equip it'}</span>
              </p>
            </div>
          </div>
          
          {/* Scrollable Results Section */}
          <div className="search-results-scrollable">
            {isLoading ? (
              <div className="loading-indicator text-center py-8">
                <div className="spinner"></div>
                <p className="mt-2 text-white">Loading items...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="no-results text-center py-8 text-gray-400">
                {searchTerm || filterPills.length > 0 ? 
                  'No items match your search criteria' : 
                  'Enter search terms or select filters to find items'}
              </div>
            ) : (
              <div className="item-grid p-2">
                {searchResults.map((item) => {
                  const itemKey = item.LinkusMap || item.LinkusAlias || Math.random();
                  const displayName = item.DisplayName || item.LinkusAlias;
                  const itemImage = getItemImage(item);
                  const slotType = item.Slot || 'Pact';
                  const isPact = !item.Slot;
                  const isWeapon = item.Slot === 'Primary' || item.Slot === 'Sidearm';
                  
                  // Check if item is already equipped in any slot
                  let isEquipped = false;
                  let equippedSlot = '';
                  
                  Object.entries(selectedItems).forEach(([slot, slotItem]) => {
                    if (slotItem && slotItem.LinkusAlias === item.LinkusAlias) {
                      isEquipped = true;
                      equippedSlot = slot;
                    }
                  });
                  
                  return (
                    <div 
                      key={itemKey}
                      className={`item-card relative ${isEquipped ? 'border-yellow-500 bg-yellow-900 bg-opacity-10' : ''}`}
                      onClick={() => handleItemSelect(item)}
                      title={isEquipped 
                        ? `${displayName} (Currently equipped as ${equippedSlot}. Click to unequip)`  
                        : `${displayName} (${slotType}. Click to equip)`
                      }
                    >
                      {isEquipped && (
                        <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs py-0.5 px-2 rounded-full flex items-center gap-1 z-30">
                          <span>Equipped</span>
                          <span className="text-xs">&times;</span>
                        </div>
                      )}
                      
                      <div className="item-image-container">
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={displayName}
                            className="item-image"
                          />
                        ) : (
                          <div className="item-image-placeholder">?</div>
                        )}
                      </div>
                      
                      <div 
                        className="item-name font-semibold text-sm"
                        style={{ color: getSlotColor(slotType) }}
                      >
                        {displayName}
                      </div>
                      
                      {(item.Set || item.Art || item.Rarity) && (
                        <div className="item-details text-xs text-gray-400">
                          {item.Set || item.Art || item.Rarity}
                        </div>
                      )}
                      
                      <div className="item-slot text-xs text-gray-500">
                        {getSlotDisplayName(slotType)}
                      </div>
                      
                      {/* Show stats based on item type */}
                      {item.Stats && (
                        <div className="item-stats mt-1 flex flex-wrap justify-center gap-1">
                          {/* Standard armor stats */}
                          {item.Stats.PhysicalDefence && (
                            <StatIcon
                              iconUrl="https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/Equipment/Stats/PhysicalIcon.png"
                              value={item.Stats.PhysicalDefence}
                              alt="Physical"
                              size="small"
                            />
                          )}
                          {item.Stats.MagickDefence && (
                            <StatIcon
                              iconUrl="https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/Equipment/Stats/MagicIcon.png"
                              value={item.Stats.MagickDefence}
                              alt="Magick"
                              size="small"
                            />
                          )}
                          {item.Stats.StabilityIncrease && (
                            <StatIcon
                              iconUrl="https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/Equipment/Stats/StabilityIcon.png"
                              value={item.Stats.StabilityIncrease}
                              alt="Stability"
                              size="small"
                            />
                          )}
                          
                          {/* Pact specific stats */}
                          {isPact && item.Stats.BonusHP && (
                            <StatIcon
                              iconUrl="https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/HUD/HealthBar/CharmedHeart.png"
                              value={item.Stats.BonusHP}
                              alt="Bonus HP"
                              size="small"
                            />
                          )}
                          {isPact && item.Stats.UnarmedDmg && (
                            <StatIcon
                              iconUrl="https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/Runes/Ode/OdeSpirit003.png"
                              value={item.Stats.UnarmedDmg}
                              alt="Unarmed Damage"
                              size="small"
                            />
                          )}
                          
                          {/* Weapon specific stats */}
                          {isWeapon && item.Stats.lvl0?.Attack && (
                            <StatIcon
                              iconUrl="https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/Equipment/Stats/AttackIcon.png"
                              value={item.Stats.lvl0.Attack}
                              alt="Attack"
                              size="small"
                            />
                          )}
                          {isWeapon && item.Stats.lvl0?.ChargedAttack && (
                            <StatIcon
                              iconUrl="https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/Equipment/Stats/ChargedIcon.png"
                              value={item.Stats.lvl0.ChargedAttack}
                              alt="Charged Attack"
                              size="small"
                            />
                          )}
                          {isWeapon && item.Stats.lvl0?.Stagger && (
                            <StatIcon
                              iconUrl="https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/Equipment/Stats/StaggerIcon.png"
                              value={item.Stats.lvl0.Stagger}
                              alt="Stagger"
                              size="small"
                            />
                          )}
                          
                          {/* Virtue display for both totem and pact */}
                          {item.Stats.Virtue && (
                            <StatIcon
                              iconUrl={getVirtueIcon(item.Stats.Virtue.Type)}
                              value={item.Stats.Virtue.Value}
                              alt={item.Stats.Virtue.Type}
                              size="small"
                            />
                          )}
                          {item.Stats.BonusVirtue && (
                            <StatIcon
                              iconUrl={getVirtueIcon(item.Stats.BonusVirtue.Type)}
                              value={item.Stats.BonusVirtue.Value}
                              alt={item.Stats.BonusVirtue.Type}
                              size="small"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SearchBar;
