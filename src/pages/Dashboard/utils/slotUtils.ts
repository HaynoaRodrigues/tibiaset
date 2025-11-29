import { SlotType, Vocation } from '../../../types/infotypes';

// Função para mapear slots de arma com base na vocação
export const getWeaponSlotType = (vocation: Vocation): SlotType => {
  switch(vocation) {
    case Vocation.KNIGHT:
      return SlotType.WEAPON; // Espadas, machados, clavas
    case Vocation.PALADIN:
      return SlotType.WEAPON; // Armas de distância (arco, besta)
    case Vocation.SORCERER:
      return SlotType.WEAPON; // Varinhas
    case Vocation.DRUID:
      return SlotType.WEAPON; // Varas mágicas
    case Vocation.MONK:
      return SlotType.WEAPON; // Fist fighting (mão livre)
    default:
      return SlotType.WEAPON;
  }
};

// Função para mapear slots de escudo com base na vocação
export const getShieldSlotType = (vocation: Vocation): SlotType => {
  switch(vocation) {
    case Vocation.KNIGHT:
      return SlotType.SHIELD; // Escudos
    case Vocation.PALADIN:
      return SlotType.SHIELD; // Quivers (embora na UI apareça como shield slot)
    case Vocation.SORCERER:
      return SlotType.SHIELD; // Spellbooks
    case Vocation.DRUID:
      return SlotType.SHIELD; // Spellbooks
    case Vocation.MONK:
      return SlotType.WEAPON; // Para Monk, o slot de escudo será usado para a mesma arma (fist)
    default:
      return SlotType.SHIELD;
  }
};

// Função para obter o nome exibido do slot com base na vocação
export const getSlotDisplayName = (slotType: SlotType, vocation: Vocation): string => {
  if (slotType === SlotType.WEAPON) {
    switch(vocation) {
      case Vocation.KNIGHT:
        return 'MELEE';
      case Vocation.PALADIN:
        return 'DIST';
      case Vocation.SORCERER:
        return 'WAND';
      case Vocation.DRUID:
        return 'ROD';
      case Vocation.MONK:
        return 'FIST';
      default:
        return 'WEAP';
    }
  } else if (slotType === SlotType.SHIELD) {
    switch(vocation) {
      case Vocation.KNIGHT:
        return 'SHLD';
      case Vocation.PALADIN:
        return 'QUIV';
      case Vocation.SORCERER:
      case Vocation.DRUID:
        return 'SPLB';
      case Vocation.MONK:
        return 'FIST'; // Para Monk, o slot de escudo também mostra FIST
      default:
        return 'SHLD';
    }
  }
  // Para outros slots, retornar o padrão
  return slotType === 'amulet' ? 'NECK' :
         slotType === 'backpack' ? 'BACK' :
         slotType === 'extra-slot' ? 'ATRB' :
         slotType.substring(0, 4);
};