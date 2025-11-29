// ===========================
// TABELA: armor
// ===========================

// Tipo principal para leitura
export interface ArmorDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo defesa, armadura, bônus, proteção, vocações, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateArmorDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateArmorDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: helmet
// ===========================

// Tipo principal para leitura
export interface HelmetDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, armadura, bônus, proteção, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateHelmetDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateHelmetDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: shield
// ===========================

// Tipo principal para leitura
export interface ShieldDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, defesa, bônus, proteção, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateShieldDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateShieldDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: spellbook
// ===========================

// Tipo principal para leitura
export interface SpellbookDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, defesa, bônus, proteção, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateSpellbookDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateSpellbookDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: legs
// ===========================

// Tipo principal para leitura
export interface LegsDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, defesa, bônus, proteção, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateLegsDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateLegsDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: boots
// ===========================

// Tipo principal para leitura
export interface BootsDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, defesa, bônus, proteção, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateBootsDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateBootsDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: amulet_necklace
// ===========================

// Tipo principal para leitura
export interface AmuletNecklaceDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, defesa, bônus, proteção, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateAmuletNecklaceDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateAmuletNecklaceDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: ring
// ===========================

// Tipo principal para leitura
export interface RingDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, defesa, bônus, proteção, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateRingDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateRingDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: extra_slot
// ===========================

// Tipo principal para leitura
export interface ExtraSlotDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, defesa, bônus, proteção, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateExtraSlotDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateExtraSlotDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: axe
// ===========================

// Tipo principal para leitura
export interface AxeDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, attack, defense, bonus, protection, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateAxeDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateAxeDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: club
// ===========================

// Tipo principal para leitura
export interface ClubDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, attack, defense, bonus, protection, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateClubDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateClubDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: sword
// ===========================

// Tipo principal para leitura
export interface SwordDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, attack, defense, bonus, protection, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateSwordDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateSwordDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: rod
// ===========================

// Tipo principal para leitura
export interface RodDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, magic level, hit points, bonus, protection, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateRodDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateRodDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: wand
// ===========================

// Tipo principal para leitura
export interface WandDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, magic level, hit points, bonus, protection, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateWandDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateWandDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: distance
// ===========================

// Tipo principal para leitura
export interface DistanceDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, attack, defense, bonus, protection, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateDistanceDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateDistanceDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: ammo
// ===========================

// Tipo principal para leitura
export interface AmmoDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, attack, defense, bonus, protection, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateAmmoDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateAmmoDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: fist
// ===========================

// Tipo principal para leitura
export interface FistDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, attack, defense, bonus, protection, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateFistDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateFistDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

// ===========================
// TABELA: quiver
// ===========================

// Tipo principal para leitura
export interface QuiverDB {
  id: number;           // bigint no banco
  name: string | null;  // text no banco
  dados: Record<string, any> | null; // json no banco - contendo level, vocation, attack, defense, bonus, protection, slots, tier, peso, etc.
  ativo: boolean | null; // boolean no banco
}

// Tipos para operações de criação/atualização
export interface CreateQuiverDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}

export interface UpdateQuiverDB {
  name?: string | null;
  dados?: Record<string, any> | null;
  ativo?: boolean | null;
}