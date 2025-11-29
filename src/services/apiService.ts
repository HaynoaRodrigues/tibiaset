import { Item, SlotType } from '../types/infotypes';

const API_BASE_URL = 'http://localhost:5757/api';

// Este serviço agora é apenas para operações que não usam SWR
// como compartilhamento de sets, que não são itens de equipamento

// Mapeamento de vocação para tipos específicos de armas
const vocationWeaponSlots: Record<string, string[]> = {
  'Elite Knight': ['sword', 'axe', 'club'],
  'Royal Paladin': ['distance'], // Apenas armas de distância
  'Master Sorcerer': ['wand'],
  'Elder Druid': ['rod'],
  'Exalted Monk': ['fist'] // Monk usa fist fighting
};

// Mapeamento de vocação para tipos específicos de escudos
const vocationShieldSlots: Record<string, string[]> = {
  'Elite Knight': ['shield'],
  'Royal Paladin': ['quiver'], // Apenas quivers, sem shields
  'Master Sorcerer': ['spellbook'],
  'Elder Druid': ['spellbook'],
  'Exalted Monk': ['fist'] // Para Monk, o slot de escudo também usa fist
};

// Mapeamento de tipos de slot para endpoints da API
const slotToEndpoint: Record<SlotType, string> = {
  [SlotType.HELMET]: 'helmet',
  [SlotType.ARMOR]: 'armor',
  [SlotType.LEGS]: 'legs',
  [SlotType.BOOTS]: 'boots',
  [SlotType.WEAPON]: 'sword', // Padrão para armas, pode ser expandido para armas específicas
  [SlotType.SHIELD]: 'shield',
  [SlotType.AMULET]: 'amulet-necklace',
  [SlotType.RING]: 'ring',
  [SlotType.BACKPACK]: 'backpack',
  [SlotType.EXTRA_SLOT]: 'extra-slot',
  [SlotType.AMMO]: 'ammo',
};

// Função para obter os endpoints corretos com base na vocação e no tipo de slot
function getEndpointsForVocationAndSlot(vocation: string, slotType: SlotType): string[] {
  if (slotType === SlotType.WEAPON) {
    return vocationWeaponSlots[vocation] || [slotToEndpoint[slotType]];
  } else if (slotType === SlotType.SHIELD) {
    return vocationShieldSlots[vocation] || [slotToEndpoint[slotType]];
  } else {
    return [slotToEndpoint[slotType]];
  }
}

// Interface para dados vindos da API
interface ApiItem {
  id: number;
  name: string | null;
  dados: {
    imageUrl?: string;
    level?: number;
    vocation?: string;
    armor?: number;
    defense?: number;
    attack?: number;
    bonus?: string;
    protection?: string;
    slots?: number;
    tier?: string;
    weight?: number;
  } | null;
  ativo: boolean | null;
}

// Função para converter dados da API para o formato Item
function convertApiItemToItem(apiItem: ApiItem, slotType: SlotType): Item {
  // Extrai dados do campo 'dados'
  const itemData = apiItem.dados || {};

  // Determina vocação com base nos dados da API (pode ser string ou array)
  let vocations: string[] = ['Elite Knight', 'Royal Paladin', 'Elder Druid', 'Master Sorcerer', 'Exalted Monk'];
  if (itemData.vocation) {
    vocations = [];

    if (Array.isArray(itemData.vocation)) {
      // Se vocation for um array, processa cada elemento
      itemData.vocation.forEach((voc: any) => {
        if (typeof voc === 'string') {
          const rawVoc = voc.toLowerCase();
          if (rawVoc.includes('knight') || rawVoc.includes('knights')) vocations.push('Elite Knight');
          if (rawVoc.includes('paladin') || rawVoc.includes('paladins')) vocations.push('Royal Paladin');
          if (rawVoc.includes('druid') || rawVoc.includes('druids')) vocations.push('Elder Druid');
          if (rawVoc.includes('sorcerer') || rawVoc.includes('sorcerers')) vocations.push('Master Sorcerer');
          if (rawVoc.includes('monk') || rawVoc.includes('monks')) vocations.push('Exalted Monk');

          // Adicionar "Todas" ou "All" como vocação universal
          if (rawVoc.includes('todas') || rawVoc.includes('all') || rawVoc.includes('any') || rawVoc.includes('all')) {
            vocations = ['Elite Knight', 'Royal Paladin', 'Elder Druid', 'Master Sorcerer', 'Exalted Monk'];
          }
        }
      });
    } else if (typeof itemData.vocation === 'string') {
      // Se vocation for string, mantém o comportamento anterior
      const rawVocations = itemData.vocation.toLowerCase();
      if (rawVocations.includes('knight') || rawVocations.includes('knights')) vocations.push('Elite Knight');
      if (rawVocations.includes('paladin') || rawVocations.includes('paladins')) vocations.push('Royal Paladin');
      if (rawVocations.includes('druid') || rawVocations.includes('druids')) vocations.push('Elder Druid');
      if (rawVocations.includes('sorcerer') || rawVocations.includes('sorcerers')) vocations.push('Master Sorcerer');
      if (rawVocations.includes('monk') || rawVocations.includes('monks')) vocations.push('Exalted Monk');

      // Adicionar "Todas" ou "All" como vocação universal
      if (rawVocations.includes('todas') || rawVocations.includes('all') || rawVocations.includes('any')) {
        vocations = ['Elite Knight', 'Royal Paladin', 'Elder Druid', 'Master Sorcerer', 'Exalted Monk'];
      }
    }
  }

    // Função para converter snake_case para Title Case
  function snakeCaseToTitleCase(str: string): string {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Processa bonus e protection para garantir que sejam strings válidas
  let bonusString = '';
  let protectionString = '';

  // Processa o campo attributes para extra slot, que pode conter bônus especiais
  if (slotType === 'extra-slot' && itemData.attributes && typeof itemData.attributes === 'object') {
    const attributes = itemData.attributes;
    const attributeEntries = Object.entries(attributes);
    if (attributeEntries.length > 0) {
      bonusString = attributeEntries
        .map(([key, value]) => `${snakeCaseToTitleCase(key)}: ${value}`)
        .join(', ');
    }
  }

  if (itemData.bonus && typeof itemData.bonus === 'object') {
    // Se bonus for um objeto, converte para string ou extrai propriedades relevantes
    if (Array.isArray(itemData.bonus)) {
      bonusString = itemData.bonus.join(', ');
    } else {
      // Verifica se o objeto não está vazio antes de converter para string
      const keys = Object.keys(itemData.bonus);
      if (keys.length > 0) {
        bonusString = keys.map(key => `${snakeCaseToTitleCase(key)}: ${itemData.bonus[key]}`).join(', ');
      } else {
        bonusString = '';
      }
    }
  } else if (typeof itemData.bonus === 'string') {
    // Aplica a formatação para strings em snake_case
    bonusString = snakeCaseToTitleCase(itemData.bonus);
  } else if (itemData.bonus !== null && itemData.bonus !== undefined) {
    bonusString = snakeCaseToTitleCase(String(itemData.bonus));
  }

  if (itemData.protection && typeof itemData.protection === 'object') {
    // Se protection for um objeto, converte para string ou extrai propriedades relevantes
    if (Array.isArray(itemData.protection)) {
      protectionString = itemData.protection.join(', ');
    } else {
      // Verifica se o objeto não está vazio antes de converter para string
      const keys = Object.keys(itemData.protection);
      if (keys.length > 0) {
        protectionString = keys.map(key => `${snakeCaseToTitleCase(key)}: ${itemData.protection[key]}`).join(', ');
      } else {
        protectionString = '';
      }
    }
  } else if (typeof itemData.protection === 'string') {
    // Aplica a formatação para strings em snake_case
    protectionString = snakeCaseToTitleCase(itemData.protection);
  } else if (itemData.protection !== null && itemData.protection !== undefined) {
    protectionString = snakeCaseToTitleCase(String(itemData.protection));
  }

  // Processa campos numéricos para garantir valores válidos
  const defense = itemData.defense !== undefined && itemData.defense !== null ? Number(itemData.defense) : 0;
  const armor = itemData.armor !== undefined && itemData.armor !== null ? Number(itemData.armor) : 0;
  const attack = itemData.attack !== undefined && itemData.attack !== null ? Number(itemData.attack) : undefined;
  const duration = itemData.duration !== undefined && itemData.duration !== null && itemData.duration !== 0 ? Number(itemData.duration) : undefined;

  // Manter o nome do item conforme vem do banco de dados
  const formattedName = apiItem.name || 'Item Desconhecido';

  return {
    id: `api-${apiItem.id}`,
    name: formattedName,
    slot: slotType,
    image: itemData.imageUrl || '', // Pode precisar de fallback para imagens
    defense: isNaN(defense) ? 0 : defense,
    armor: isNaN(armor) ? 0 : armor,
    attack: attack !== undefined && !isNaN(attack as number) ? attack : undefined,
    duration: duration !== undefined && !isNaN(duration) ? duration : undefined,
    bonus: bonusString,
    protection: protectionString,
    vocations: vocations as any, // Type assertion porque a conversão pode não ser perfeita
  };
}

// Função para buscar itens por tipo de slot - mantida para compatibilidade
export async function fetchItemsBySlotType(slotType: SlotType): Promise<Item[]> {
  console.log(`Buscando itens para o slot: ${slotType}`);
  try {
    const endpoint = slotToEndpoint[slotType];
    console.log(`Endpoint sendo chamado: ${API_BASE_URL}/${endpoint}`);

    const response = await fetch(`${API_BASE_URL}/${endpoint}`);

    if (!response.ok) {
      console.error(`Erro HTTP ao buscar itens do tipo ${slotType}: ${response.status} - ${response.statusText}`);
      throw new Error(`Erro ao buscar itens do tipo ${slotType}: ${response.status} - ${response.statusText}`);
    }

    // Verificar se o conteúdo é JSON antes de fazer o parse
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Resposta inesperada para ${endpoint}:`, text);

      // Verificar se a resposta parece ser HTML (indica erro 404 ou página não encontrada)
      if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
        console.error(`Endpoint não encontrado ou erro no servidor para: ${endpoint}`);
        return []; // Retorna array vazio em vez de lançar erro
      }

      throw new Error(`Resposta não é JSON para o endpoint: ${endpoint}`);
    }

    const apiItems: ApiItem[] = await response.json();
    console.log(`Recebidos ${apiItems.length} itens do endpoint ${endpoint} para o slot ${slotType}`);

    // Filtrar apenas itens ativos e limitar a 20 itens
    const activeApiItems = apiItems.filter(item => item.ativo !== false).slice(0, 20);
    console.log(`Filtrados para ${activeApiItems.length} itens ativos para o slot ${slotType}`);

    // Converter para o formato Item
    const convertedItems = activeApiItems.map(apiItem => convertApiItemToItem(apiItem, slotType));
    console.log(`Itens convertidos para o slot ${slotType}:`, convertedItems);

    return convertedItems;
  } catch (error) {
    // Verificar se o erro é do tipo "Unexpected token '<'" que indica resposta HTML
    if (error instanceof SyntaxError && error.message.includes("Unexpected token '<'")) {
      console.error(`Recebida resposta HTML em vez de JSON para o endpoint: ${slotToEndpoint[slotType]}`);
      return []; // Retorna array vazio ao invés de propagar o erro
    }

    console.error(`Erro ao buscar itens do tipo ${slotType}:`, error);
    // Retornar array vazio em caso de erro
    return [];
  }
}

// Função para buscar todos os itens (pode ser útil para inicializar o aplicativo)
export async function fetchAllItems(): Promise<Item[]> {
  const allItems: Item[] = [];

  // Buscar itens de cada tipo de slot
  for (const slotType of Object.values(SlotType)) {
    try {
      const items = await fetchItemsBySlotType(slotType as SlotType);
      allItems.push(...items);
    } catch (error) {
      console.error(`Erro ao buscar itens do tipo ${slotType}:`, error);
    }
  }

  return allItems;
}

// Função para buscar itens específicos por vocação e slot - mantida para compatibilidade
export async function fetchItemsByVocationAndSlot(vocation: string, slotType: SlotType): Promise<Item[]> {
  console.log(`Buscando itens para vocação: ${vocation} e slot: ${slotType}`);
  try {
    // Obter os endpoints corretos com base na vocação e slot
    const endpoints = getEndpointsForVocationAndSlot(vocation, slotType);
    console.log(`Endpoints a serem chamados: ${endpoints.join(', ')}`);

    // Buscar itens de todos os endpoints relevantes
    let allItems: Item[] = [];
    for (const endpoint of endpoints) {
      try {
        console.log(`Buscando do endpoint: ${endpoint}`);
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);

        if (!response.ok) {
          console.error(`Erro HTTP ao buscar itens do endpoint ${endpoint}: ${response.status} - ${response.statusText}`);
          continue; // Continuar com o próximo endpoint
        }

        // Verificar se o conteúdo é JSON antes de fazer o parse
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error(`Resposta inesperada para ${endpoint}:`, text);

          // Verificar se a resposta parece ser HTML (indica erro 404 ou página não encontrada)
          if (text.startsWith('<!DOCTYPE') || text.startsWith('<html')) {
            console.error(`Endpoint não encontrado ou erro no servidor para: ${endpoint}`);
            continue; // Continuar com o próximo endpoint
          }

          continue; // Continuar com o próximo endpoint
        }

        const apiItems: ApiItem[] = await response.json();
        console.log(`Recebidos ${apiItems.length} itens do endpoint ${endpoint}`);

        // Filtrar apenas itens ativos
        const activeApiItems = apiItems.filter(item => item.ativo !== false);
        console.log(`Filtrados para ${activeApiItems.length} itens ativos do endpoint ${endpoint}`);

        // Converter para o formato Item e adicionar ao array
        const convertedItems = activeApiItems.map(apiItem => convertApiItemToItem(apiItem, slotType));
        allItems.push(...convertedItems);
      } catch (error) {
        // Verificar se o erro é do tipo "Unexpected token '<'" que indica resposta HTML
        if (error instanceof SyntaxError && error.message.includes("Unexpected token '<'")) {
          console.error(`Recebida resposta HTML em vez de JSON para o endpoint: ${endpoint}`);
          continue; // Continuar com o próximo endpoint
        }

        console.error(`Erro ao buscar itens do endpoint ${endpoint}:`, error);
        // Continuar com o próximo endpoint em caso de erro
      }
    }

    console.log(`Total de itens de todos os endpoints: ${allItems.length}`);

    // Filtrar itens pela vocação específica
    const filteredItems = allItems.filter(item =>
      item.vocations.includes(vocation as any)
    );

    console.log(`Itens filtrados por vocação ${vocation}: ${filteredItems.length}`);

    // Se não encontrar itens para a vocação específica, retorna itens de todas as vocações (ou um máximo de 20)
    let finalItems = [];
    if (filteredItems.length === 0) {
      console.log(`Nenhum item encontrado para a vocação ${vocation}, retornando todos os itens válidos`);
      finalItems = allItems.slice(0, 20);
    } else {
      // Limitar a 20 itens após filtrar por vocação
      finalItems = filteredItems.slice(0, 20);
    }

    console.log(`Itens finais retornados: ${finalItems.length}`);

    return finalItems;
  } catch (error) {
    console.error(`Erro ao buscar itens do tipo ${slotType} para ${vocation}:`, error);
    return [];
  }
}