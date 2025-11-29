import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CacheEntry {
  data: any;
  etag: string;
  timestamp: number;
}

class GlobalCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly ttl: number; // Time to live em milissegundos

  constructor(ttl: number = 10 * 60 * 1000) { // Padrão: 10 minutos
    this.ttl = ttl;
  }

  /**
   * Gera um ETag baseado no conteúdo e timestamp
   */
  private generateETag(data: any): string {
    const content = JSON.stringify(data);
    const hash = crypto.createHash('md5').update(content).digest('hex');
    return `"${hash}"`;
  }

  /**
   * Verifica se uma entrada de cache é válida
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.ttl;
  }

  /**
   * Armazena dados no cache
   */
  set(key: string, data: any): string {
    const etag = this.generateETag(data);
    this.cache.set(key, {
      data,
      etag,
      timestamp: Date.now()
    });
    return etag;
  }

  /**
   * Recupera dados do cache
   */
  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (!this.isCacheValid(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Limpa o cache expirado periodicamente
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtém todas as chaves do cache
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Invalida uma chave específica do cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Instância singleton do cache global
const globalCache = new GlobalCache();

// Mapa para armazenar funções de atualização de cache
const cacheUpdateFunctions: Map<string, () => Promise<any>> = new Map();

/**
 * Registra uma função de atualização de cache para uma chave específica
 */
export const registerCacheUpdateFunction = (cacheKey: string, updateFunction: () => Promise<any>): void => {
  cacheUpdateFunctions.set(cacheKey, updateFunction);
};

/**
 * Atualiza o cache para uma chave específica
 */
export const updateCacheWithFunction = async (cacheKey: string): Promise<void> => {
  const updateFunction = cacheUpdateFunctions.get(cacheKey);
  if (updateFunction) {
    try {
      const data = await updateFunction();
      updateCache(cacheKey, data);
    } catch (error) {
      console.error(`Erro ao atualizar cache para ${cacheKey}:`, error);
    }
  } else {
    console.warn(`Nenhuma função de atualização registrada para a chave: ${cacheKey}`);
  }
};

/**
 * Inicia atualizações periódicas de cache para todas as chaves registradas
 */
export const startPeriodicCacheUpdates = (intervalMinutes: number = 30): void => {
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`Iniciando atualizações periódicas de cache a cada ${intervalMinutes} minutos`);

  setInterval(async () => {
    console.log('Iniciando atualização periódica de cache...');
    for (const [cacheKey] of cacheUpdateFunctions) {
      console.log(`Atualizando cache para: ${cacheKey}`);
      await updateCacheWithFunction(cacheKey);
    }
  }, intervalMs);
};

/**
 * Middleware para implementar ETag e cache condicional
 */
export const etagCacheMiddleware = (cacheKey: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Verifica se o cliente enviou um header If-None-Match
    const clientETag = req.headers['if-none-match'];

    // Tenta obter dados do cache
    const cachedEntry = globalCache.get(cacheKey);

    if (cachedEntry) {
      // Se o cliente enviou um ETag e é igual ao do cache, retorna 304
      if (clientETag && clientETag === cachedEntry.etag) {
        return res.status(304).end();
      }

      // Adiciona o ETag aos headers e envia os dados em cache
      res.set('ETag', cachedEntry.etag);
      return res.json(cachedEntry.data);
    }

    // Armazena a função original de json para interceptar a resposta
    const originalJson = res.json;
    
    res.json = function(data: any) {
      // Armazena os dados no cache antes de enviá-los
      const etag = globalCache.set(cacheKey, data);
      res.set('ETag', etag);
      
      // Chama a função original
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Função para atualizar o cache manualmente
 */
export const updateCache = (cacheKey: string, data: any): string => {
  return globalCache.set(cacheKey, data);
};

/**
 * Função para invalidar o cache manualmente
 */
export const invalidateCache = (cacheKey: string): void => {
  globalCache.invalidate(cacheKey);
};

/**
 * Middleware para limpar caches expirados periodicamente
 */
export const cacheCleanupMiddleware = () => {
  return (_req: Request, res: Response, next: NextFunction) => {
    // Limpa o cache expirado a cada requisição (opcional, pode ser feito em intervalo separado)
    globalCache.cleanup();
    next();
  };
};

export default globalCache;