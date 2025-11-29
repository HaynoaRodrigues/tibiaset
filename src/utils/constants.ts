import { SlotType, Vocation } from '../types/infotypes';

// Helper to get image from Tibia Fandom Wiki (Special:FilePath redirect)
export const getWikiImg = (name: string) => `https://tibia.fandom.com/wiki/Special:FilePath/${name.replace(/ /g, '_')}.gif`;

// Vocation Groups
export const ALL_VOCATIONS = [Vocation.KNIGHT, Vocation.PALADIN, Vocation.DRUID, Vocation.SORCERER, Vocation.MONK];
export const MAGES = [Vocation.DRUID, Vocation.SORCERER];
export const KNIGHT_PALADIN_MONK = [Vocation.KNIGHT, Vocation.PALADIN, Vocation.MONK];
export const KNIGHT_PALADIN = [Vocation.KNIGHT, Vocation.PALADIN];