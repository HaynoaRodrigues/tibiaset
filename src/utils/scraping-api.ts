import axios from 'axios';
import { ArmorDB } from '../src/types/datatypes';
import fs from 'fs/promises';
import path from 'path';

interface ScrapedItem {
  name: string;
  image: string;
  level?: number;
  vocation?: string;
  armor?: number;
  bonus?: string;
  protection?: string;
  slots?: number;
  tier?: string;
  weight?: number;
}

async function scrapeTibiaItemsFromAPI(limit?: number): Promise<ScrapedItem[]> {
  try {
    const items: ScrapedItem[] = [];

    // Exemplo de requisição para obter uma lista de itens específicos (não categorias)
    const searchTerms = ['Alicorn Headguard', 'Spiritthorn Helmet', 'Arcanomancer Regalia', 'Arboreal Crown', 'Ethereal Coned Hat'];

    for (const term of searchTerms) {
      if (limit && items.length >= limit) break;

      const pageUrl = `https://tibia.fandom.com/api.php?action=parse&page=${encodeURIComponent(term)}&format=json`;

      try {
        const pageResponse = await axios.get(pageUrl);
        const pageContent = pageResponse.data.parse;

        // Extrair informações da página de item individual
        const itemData = extractItemDataFromContent(pageContent, term);

        if (itemData) {
          items.push(itemData);
        }
      } catch (error) {
        console.error(`Erro ao processar página: ${term}`, error);
        continue; // Continuar com o próximo item
      }
    }

    // Salvar os dados extraídos em arquivo JSON
    await saveScrapedData(items, 'tibia_items_api');

    return items;
  } catch (error) {
    console.error('Erro ao fazer scraping via API:', error);
    throw error;
  }
}

// Função para extrair dados de itens do conteúdo parseado da página
function extractItemDataFromContent(pageContent: any, title: string): ScrapedItem | null {
  try {
    // A estrutura real da API contém o HTML parseado em pageContent.text['*']
    const htmlContent = pageContent.text['*'];

    // Criar um parser simples para extrair informações da tabela
    // Procurar pela tabela de itens (wikitable)
    const tableMatch = htmlContent.match(/<table class="wikitable[^>]*">([\s\S]*?)<\/table>/);

    if (!tableMatch) {
      // Se não encontrar uma tabela, tentar extrair informações do título e de elementos específicos
      return {
        name: title,
        image: extractItemImageFromHTML(htmlContent, title),
        level: undefined,
        vocation: extractVocationFromHTML(htmlContent),
        armor: extractArmorFromHTML(htmlContent),
        bonus: extractBonusFromHTML(htmlContent),
        protection: extractProtectionFromHTML(htmlContent),
        slots: undefined,
        tier: undefined,
        weight: extractWeightFromHTML(htmlContent)
      };
    }

    const tableContent = tableMatch[1];

    // Extrair informações específicas da tabela
    const itemData: ScrapedItem = {
      name: title,
      image: extractItemImageFromHTML(htmlContent, title),
      level: extractLevelFromTable(tableContent),
      vocation: extractVocationFromTable(tableContent),
      armor: extractArmorFromTable(tableContent),
      bonus: extractBonusFromTable(tableContent),
      protection: extractProtectionFromTable(tableContent),
      slots: extractSlotsFromTable(tableContent),
      tier: extractTierFromTable(tableContent),
      weight: extractWeightFromTable(tableContent)
    };

    return itemData;
  } catch (error) {
    console.error(`Erro ao extrair dados da página: ${title}`, error);
    return null;
  }
}

// Funções auxiliares para extrair informações específicas do HTML
function extractItemImageFromHTML(html: string, title: string): string {
  // Procurar pela imagem no infobox portátil (estrutura comum nas páginas de item)
  // Primeiro, escapar caracteres especiais no título para usar em expressão regular
  const titleEscaped = title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  // Exemplo: <a href="..." class="image image-thumbnail" title="Alicorn Headguard"><img src="..." ... /></a>
  const infoboxImagePattern = new RegExp(`<a[^>]*class=["']image image-thumbnail["'][^>]*title=["']?[^"']*?${titleEscaped}[^"']*?["']?[^>]*>\\s*<img[^>]*src=["']([^"']+)["']`, 'i');
  let imgMatch = html.match(infoboxImagePattern);

  if (imgMatch) {
    return normalizeImageUrl(imgMatch[1]);
  }

  // Procurar pela estrutura específica do infobox
  const portableInfoboxImagePattern = /<figure class="pi-item pi-image">[\s\S]*?<a[^>]*href=["']([^"']+)["'][^>]*class=["']image image-thumbnail["'][^>]*>[\s\S]*?<img[^>]*src=["']([^"']+)["']/i;
  imgMatch = html.match(portableInfoboxImagePattern);

  if (imgMatch) {
    return normalizeImageUrl(imgMatch[2]); // O segundo grupo é o src da imagem
  }

  // Procurar por qualquer imagem no infobox que contenha o título
  const imageWithAltPattern = new RegExp(`<img[^>]*alt=["']?[^"']*${titleEscaped}[^"']*["']?[^>]*src=["']([^"']+)["']`, 'i');
  imgMatch = html.match(imageWithAltPattern);

  if (imgMatch) {
    return normalizeImageUrl(imgMatch[1]);
  }

  // Procurar por outras estruturas de imagem no infobox
  const otherInfoboxPattern = new RegExp(`<div id="twbox-image"><img[^>]*src=["']([^"']+)["']`, 'i');
  imgMatch = html.match(otherInfoboxPattern);

  if (imgMatch) {
    return normalizeImageUrl(imgMatch[1]);
  }

  return '';
}

// Função para normalizar a URL da imagem (remover redimensionamentos do thumb)
function normalizeImageUrl(url: string): string {
  if (!url) return '';

  // Remover redimensionamento de imagem do Thumb
  return url.replace(/\/thumb\//, '/')
            .replace(/\/\d+px-/, '/')
            .replace(/\/images\/thumb\/([^\/]+)\/[^\/]+\//, '/images/$1/')
            .replace(/https?:\/\/static\.wikia\.nocookie\.net\/tibia\/images\/\w\/\w+\//, 'https://static.wikia.nocookie.net/tibia/images/')
            .trim();
}

function extractVocationFromHTML(html: string): string | undefined {
  if (html.includes('Paladins') || html.includes('Knight') || html.includes('Sorcerer') ||
      html.includes('Druid') || html.includes('Elite Knight') || html.includes('Royal Paladin') ||
      html.includes('Master Sorcerer') || html.includes('Elder Druid')) {
    // Extração mais complexa iria depender da estrutura exata
    return undefined; // Por enquanto, não implementado
  }
  return undefined;
}

function extractArmorFromHTML(html: string): number | undefined {
  // Procurar por padrões comuns de armadura no HTML
  const armorMatch = html.match(/(armor|arm):?\s*(\d+)/i);
  if (armorMatch) {
    return parseInt(armorMatch[2]);
  }
  return undefined;
}

function extractBonusFromHTML(html: string): string | undefined {
  // Procurar por bônus no HTML
  const bonusMatch = html.match(/(bonus|fighting|magic level|distance fighting|shielding|fist fighting|club fighting|sword fighting|axe fighting):?\s*([+−-]?\d+%?)/i);
  if (bonusMatch) {
    return `${bonusMatch[1]} ${bonusMatch[2]}`;
  }
  return undefined;
}

function extractProtectionFromHTML(html: string): string | undefined {
  // Procurar por proteções no HTML
  const protMatch = html.match(/(protection|fire|energy|ice|earth|physical|death|drowning):?\s*([+−-]?\d+%)/i);
  if (protMatch) {
    return `${protMatch[1]} ${protMatch[2]}`;
  }
  return undefined;
}

function extractWeightFromHTML(html: string): number | undefined {
  const weightMatch = html.match(/(weight|peso):\s*(\d+(?:\.\d+)?)/i);
  if (weightMatch) {
    return parseFloat(weightMatch[2]);
  }
  return undefined;
}

// Funções para extrair informações específicas da tabela
function extractLevelFromTable(tableContent: string): number | undefined {
  const levelMatch = tableContent.match(/<td[^>]*>\s*(\d+)\s*<\/td>[^<]*<td[^>]*>\s*paladins\s*<\/td>/i) ||
                    tableContent.match(/level[^>]*>\s*(\d+)/i);
  if (levelMatch) {
    return parseInt(levelMatch[1]);
  }
  return undefined;
}

function extractVocationFromTable(tableContent: string): string | undefined {
  const vocationMatch = tableContent.match(/vocation[^>]*>\s*([^<]+)/i) ||
                       tableContent.match(/<td[^>]*>\s*(paladins|knights|sorcerers|druids|monks)\s*<\/td>/i);
  if (vocationMatch) {
    return vocationMatch[1].trim();
  }
  return undefined;
}

function extractArmorFromTable(tableContent: string): number | undefined {
  const armorMatch = tableContent.match(/<td[^>]*>\s*(\d+)\s*<\/td>/);
  if (armorMatch) {
    const armorValue = parseInt(armorMatch[1]);
    // Verificar se é um valor razoável para armadura (geralmente > 0 e < 50)
    if (armorValue > 0 && armorValue < 50) {
      return armorValue;
    }
  }
  return undefined;
}

function extractBonusFromTable(tableContent: string): string | undefined {
  const bonusMatch = tableContent.match(/<td[^>]*>\s*([^<]*\+(?:fighting|magic level|distance|shielding|speed|regeneration)[^<]*)\s*<\/td>/i);
  if (bonusMatch) {
    return bonusMatch[1].trim();
  }
  return undefined;
}

function extractProtectionFromTable(tableContent: string): string | undefined {
  const protMatch = tableContent.match(/<td[^>]*>\s*([^<]*(?:fire|energy|ice|earth|physical|death)\s*[+−-]?\d+%[^<]*)\s*<\/td>/i);
  if (protMatch) {
    return protMatch[1].trim();
  }
  return undefined;
}

function extractSlotsFromTable(tableContent: string): number | undefined {
  // Pode haver informações sobre slots de encantamentos
  const slotsMatch = tableContent.match(/(\d+)\s*slot/i);
  if (slotsMatch) {
    return parseInt(slotsMatch[1]);
  }
  return undefined;
}

function extractTierFromTable(tableContent: string): string | undefined {
  // Procurar por informações de tier/classificação
  const tierMatch = tableContent.match(/<td[^>]*>\s*(\d+)\s*<\/td>/g);
  if (tierMatch && tierMatch.length > 6) {
    // Considerando que a posição 7 normalmente contém a classificação
    const tierValues = tierMatch.map(match => {
      const num = match.match(/\d+/);
      return num ? parseInt(num[0]) : null;
    }).filter(val => val !== null) as number[];

    if (tierValues.length > 6) {
      return tierValues[6].toString();
    }
  }
  return undefined;
}

function extractWeightFromTable(tableContent: string): number | undefined {
  const weightMatch = tableContent.match(/<td[^>]*>\s*(\d+(?:\.\d+)?)\s*<\/td>/g);
  if (weightMatch) {
    // Procurar por valores de peso (geralmente entre 0 e 500)
    for (const match of weightMatch) {
      const numMatch = match.match(/\d+(?:\.\d+)?/);
      if (numMatch) {
        const weight = parseFloat(numMatch[0]);
        if (weight > 0 && weight < 500) {
          return weight;
        }
      }
    }
  }
  return undefined;
}

// Função para salvar os dados extraídos em arquivo
async function saveScrapedData(data: any[], category: string): Promise<void> {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `scraped_${category}_${timestamp}.json`;
  const filepath = path.join(process.cwd(), 'data', filename);
  
  // Criar diretório de dados se não existir
  try {
    await fs.access(path.join(process.cwd(), 'data'));
  } catch {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
  }
  
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  console.log(`Dados salvos em: ${filepath}`);
}

// Função para processar pequenos lotes de itens via API
export async function scrapeTibiaItemsBatch(limit: number = 5): Promise<ScrapedItem[]> {
  return await scrapeTibiaItemsFromAPI(limit);
}

// Função para converter os dados para o formato do banco de dados
export function convertToArmorDBFormat(items: ScrapedItem[]): Omit<ArmorDB, 'id'>[] {
  return items.map(item => ({
    name: item.name,
    dados: {
      // Todas as informações do item, exceto o nome, vão para o campo JSON 'dados'
      imageUrl: item.image,
      level: item.level,
      vocation: item.vocation,
      armor: item.armor,
      bonus: item.bonus,
      protection: item.protection,
      slots: item.slots,
      tier: item.tier,
      weight: item.weight
    },
    ativo: true  // Presumindo que itens extraídos estejam ativos
  }));
}