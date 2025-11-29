export enum SlotType {
  HELMET = 'helmet',
  ARMOR = 'armor',
  LEGS = 'legs',
  BOOTS = 'boots',
  WEAPON = 'weapon',
  SHIELD = 'shield',
  AMULET = 'amulet',
  RING = 'ring',
  BACKPACK = 'backpack',
  EXTRA_SLOT = 'extra-slot',
  AMMO = 'ammo',
}

export enum Vocation {
  KNIGHT = 'Elite Knight',
  PALADIN = 'Royal Paladin',
  DRUID = 'Elder Druid',
  SORCERER = 'Master Sorcerer',
  MONK = 'Exalted Monk',
}

export interface Item {
  id: string;
  name: string;
  slot: SlotType;
  image: string; // URL to image
  defense: number;
  armor: number;
  attack?: number; // Added for weapons
  bonus?: string; // e.g., "Magic Level +2"
  protection?: string; // e.g., "Fire +5%"
  duration?: number; // Duration in minutes, if applicable and not 0
  vocations: Vocation[]; // Allowed vocations
}

export type EquippedItems = {
  [key in SlotType]?: Item | null;
};