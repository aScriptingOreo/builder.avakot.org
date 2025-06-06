// Centralized icon URL utility for Soulframe builder

export const VIRTUE_ICONS: Record<string, string> = {
  grace: "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/HUD/GraceSunIcon.png",
  spirit: "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/HUD/SpiritMoonIcon.png",
  courage: "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/HUD/CourageSunIcon.png",
  allvirtues: "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/HUD/AllVirtuesIcon.png"
};

export const STAT_ICONS = {
  physicalDefence: "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/Equipment/Stats/PhysicalIcon.png",
  magickDefence: "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/Equipment/Stats/MagicIcon.png",
  stability: "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/Equipment/Stats/StabilityIcon.png",
  bonusHP: "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/HUD/HealthBar/CharmedHeart.png",
  unarmedDamage: "https://s3.7thseraph.org/wiki.avakot.org/soulframe.icons/release/Graphics/Runes/Ode/OdeSpirit003.png",
};

export function getVirtueIcon(type: string): string {
  return VIRTUE_ICONS[type.toLowerCase()] || VIRTUE_ICONS.grace;
}

export function getStatIcon(stat: string): string {
  return STAT_ICONS[stat] || "";
}
