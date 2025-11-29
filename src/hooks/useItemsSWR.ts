import useSWR from 'swr';
import { Item, SlotType, Vocation } from '../types/infotypes';

const API_BASE_URL = 'http://localhost:5757/api';

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

// Função para converter dados da API para o formato Item
function convertApiItemToItem(apiItem: any, slotType: SlotType): Item {
  // Determina vocação com base nos dados da API
  let vocations: string[] = ['Elite Knight', 'Royal Paladin', 'Elder Druid', 'Master Sorcerer', 'Exalted Monk'];
  if (apiItem.dados?.vocation !== undefined && apiItem.dados?.vocation !== null) {
    vocations = [];
    let rawVocations = '';

    // Verificar se vocation é uma string ou um array
    if (Array.isArray(apiItem.dados.vocation)) {
      // Se for um array, converter para string
      rawVocations = apiItem.dados.vocation.join(' ').toLowerCase();
    } else if (typeof apiItem.dados.vocation === 'string') {
      // Se for uma string, usar normalmente
      rawVocations = apiItem.dados.vocation.toLowerCase();
    } else if (typeof apiItem.dados.vocation === 'number') {
      // Se for um número, converter para string e aplicar transformações
      rawVocations = String(apiItem.dados.vocation).toLowerCase();
    } else {
      // Se for outro tipo de dado, converter para string e depois para lowercase
      rawVocations = String(apiItem.dados.vocation).toLowerCase();
    }

    if (rawVocations.includes('knight')) vocations.push('Elite Knight');
    if (rawVocations.includes('paladin')) vocations.push('Royal Paladin');
    if (rawVocations.includes('druid')) vocations.push('Elder Druid');
    if (rawVocations.includes('sorcerer')) vocations.push('Master Sorcerer');
    if (rawVocations.includes('monk')) vocations.push('Exalted Monk');

    if (rawVocations.includes('todas') || rawVocations.includes('all')) {
      vocations = ['Elite Knight', 'Royal Paladin', 'Elder Druid', 'Master Sorcerer', 'Exalted Monk'];
    }
  }
  
  // Função para converter snake_case para Title Case
  function snakeCaseToTitleCase(str: string): string {
    if (!str) return '';
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Função para converter dados de objeto para string legível
  function formatObjectData(obj: any): string {
    if (!obj) return '';

    // Se for um array, junta os elementos
    if (Array.isArray(obj)) {
      return obj.map(item => formatValue(item)).join(', ');
    }

    // Se for um objeto, formata os pares chave-valor
    if (typeof obj === 'object') {
      const entries = Object.entries(obj);
      if (entries.length === 0) return '';

      return entries
        .map(([key, value]) => {
          const formattedKey = snakeCaseToTitleCase(key);
          const formattedValue = formatValue(value);
          return `${formattedKey} ${formattedValue}`;
        })
        .join(', ');
    }

    // Retorna como string se não for nem array nem objeto
    return String(obj);
  }

  // Função auxiliar para formatar valores individuais
  function formatValue(value: any): string {
    if (typeof value === 'object' && value !== null) {
      // Para objetos aninhados, formata como string legível
      return formatObjectData(value);
    } else if (Array.isArray(value)) {
      // Para arrays, junta os elementos
      return value.map(item => formatValue(item)).join(', ');
    } else {
      // Converte outros valores para string
      return String(value);
    }
  }

  // Processa attributes (para extra slot), que pode conter atributos especiais
  let bonusString = '';
  if (slotType === SlotType.EXTRA_SLOT && apiItem.dados?.attributes && typeof apiItem.dados.attributes === 'object') {
    bonusString = formatObjectData(apiItem.dados.attributes);
  } else if (apiItem.dados?.bonus) {
    // Processa bonus para outros slots
    if (typeof apiItem.dados.bonus === 'string') {
      bonusString = snakeCaseToTitleCase(apiItem.dados.bonus);
    } else {
      bonusString = formatObjectData(apiItem.dados.bonus);
    }
  }

  let protectionString = '';
  if (apiItem.dados?.protection) {
    // Processa protection
    if (typeof apiItem.dados.protection === 'string') {
      protectionString = snakeCaseToTitleCase(apiItem.dados.protection);
    } else {
      protectionString = formatObjectData(apiItem.dados.protection);
    }
  }
  
  // Processa campos numéricos com verificação de tipo
  const defense = apiItem.dados?.defense !== undefined && apiItem.dados?.defense !== null ?
    Number(apiItem.dados.defense) : 0;
  const armor = apiItem.dados?.armor !== undefined && apiItem.dados?.armor !== null ?
    Number(apiItem.dados.armor) : 0;
  const attack = apiItem.dados?.attack !== undefined && apiItem.dados?.attack !== null ?
    Number(apiItem.dados.attack) : undefined;
  const duration = apiItem.dados?.duration !== undefined && apiItem.dados?.duration !== null &&
    apiItem.dados?.duration !== 0 ? Number(apiItem.dados.duration) : undefined;
  
  return {
    id: `api-${apiItem.id}`,
    name: apiItem.name || 'Item Desconhecido',
    slot: slotType,
    image: apiItem.dados?.imageUrl || '',
    defense: isNaN(defense) ? 0 : defense,
    armor: isNaN(armor) ? 0 : armor,
    attack: attack !== undefined && !isNaN(attack) ? attack : undefined,
    duration: duration !== undefined && !isNaN(duration) ? duration : undefined,
    bonus: bonusString,
    protection: protectionString,
    vocations: vocations as any,
  };
}

// Função para converter uma lista de itens da API para o formato Item
function convertApiItemsToItems(apiItems: any[], slotType: SlotType): Item[] {
  return apiItems
    .filter(item => item.ativo !== false) // Filtrar apenas itens ativos
    .slice(0, 20) // Limitar a 20 itens
    .map(apiItem => convertApiItemToItem(apiItem, slotType));
}

// Função para buscar itens (sem ETag para evitar problemas com SWR)
const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Resposta não é JSON');
  }

  const data = await response.json();
  return data;
};

// Hook personalizado para buscar itens por vocação e tipo de slot com SWR
export const useItemsByVocationAndSlot = (vocation: Vocation, slotType: SlotType | null) => {
  // Usar SWR com uma chave condicional - se slotType for nulo, não executar
  const shouldFetch = slotType !== null;

  // Determinar os endpoints com base na vocação e no tipo de slot (apenas se necessário)
  const urls = shouldFetch ? (() => {
    let endpoints: string[] = [];
    
    if (slotType === SlotType.WEAPON) {
      endpoints = vocationWeaponSlots[vocation] || [slotToEndpoint[slotType]];
    } else if (slotType === SlotType.SHIELD) {
      endpoints = vocationShieldSlots[vocation] || [slotToEndpoint[slotType]];
    } else {
      endpoints = [slotToEndpoint[slotType]];
    }
    
    // Criar URLs para todos os endpoints relevantes
    return endpoints.map(endpoint => `${API_BASE_URL}/${endpoint}`);
  })() : null;

  // Usar SWR com a key condicional
  const { data, error, mutate } = useSWR(
    urls || null, // Passar null como key faz o SWR não executar a requisição
    async (urlList: string[]) => {
      // Fazer requisições para todos os endpoints
      const responses = await Promise.all(
        urlList.map(url => fetcher(url))
      );

      // Processar respostas
      const allItems = [];
      for (let i = 0; i < responses.length; i++) {
        const apiItems = responses[i];

        // Se houver erro na requisição, pular este endpoint
        if (!apiItems) continue;

        // Converter os itens com o tipo de slot apropriado
        try {
          const convertedItems = convertApiItemsToItems(apiItems, slotType);
          allItems.push(...convertedItems);
        } catch (error) {
          console.error(`[useItemsByVocationAndSlot] Erro ao converter itens do endpoint ${i}:`, error);
          throw error; // Re-lançar o erro para que o SWR o capture
        }
      }

      // Se estamos buscando itens para uma vocação específica, filtrar os resultados
      let filteredItems = [];
      try {
        filteredItems = allItems.filter(item => 
          item.vocations.includes(vocation as any) || item.vocations.length === 5 // "All vocations" (todas as vocações)
        );
      } catch (filterError) {
        console.error(`[useItemsByVocationAndSlot] Erro no filtro de vocação:`, filterError);
        throw filterError;
      }

      // Limitar a 20 itens após filtrar por vocação
      return filteredItems.slice(0, 20);
    },
    {
      refreshInterval: 604800000, // Atualiza automaticamente a cada 1 semana (7 dias * 24 horas * 60 minutos * 60 segundos * 1000 ms)
      errorRetryCount: 3, // Tenta novamente 3 vezes em caso de erro
      revalidateOnFocus: false, // Não revalida automaticamente quando a janela ganha foco
      revalidateOnReconnect: true, // Revalida quando a conexão é restabelecida
    }
  );

  return {
    items: shouldFetch ? (data || []) : [],
    isLoading: shouldFetch ? (!error && !data) : false,
    isError: shouldFetch ? !!error : false,
    mutate // Função para forçar uma nova requisição
  };
};