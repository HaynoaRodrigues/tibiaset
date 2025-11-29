import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' }); // Carregar variáveis de ambiente do arquivo .env

// Interface para o formato de dados extraídos de armas e armaduras
interface ScrapedItem {
  name: string;           // Nome do item
  image: string;          // URL da imagem
  level?: number;         // Nível necessário
  vocation?: string;      // Vocação exigida
  armor?: number;         // Valor de armadura
  bonus?: string;         // Bônus do item
  protection?: string;    // Proteções
  slots?: number;         // Slots de encantamento
  tier?: string;          // Tier do item
  weight?: number;        // Peso do item
}

// Interface para o formato do banco de dados
interface ArmorDB {
  id: number;
  name: string | null;      // O nome fica fora do JSON
  dados: Record<string, any> | null; // Todos os outros campos vão para este objeto JSON
  ativo: boolean | null;    // Status do item
}

// Carregar variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias.');
  process.exit(1);
}

// Criar cliente do Supabase com a chave de serviço
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

// Função para converter os dados para o formato do banco de dados
function convertToArmorDBFormat(items: ScrapedItem[]): Omit<ArmorDB, 'id'>[] {
  return items.map(item => ({
    name: item.name,      // O nome do item fica fora do JSON
    dados: {              // Todos os outros atributos vão para o campo JSON 'dados'
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
    ativo: true          // Presumindo que itens extraídos estejam ativos
  }));
}

// Função para carregar dados do arquivo JSON
async function loadScrapedData(filePath: string): Promise<ScrapedItem[]> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    
    // Se os dados estiverem no formato do banco de dados (com 'name' e 'dados'), converter de volta
    if (jsonData.length > 0 && jsonData[0].hasOwnProperty('name') && jsonData[0].hasOwnProperty('dados')) {
      return jsonData.map((item: any) => ({
        name: item.name,
        image: item.dados.imageUrl,
        level: item.dados.level,
        vocation: item.dados.vocation,
        armor: item.dados.armor,
        bonus: item.dados.bonus,
        protection: item.dados.protection,
        slots: item.dados.slots,
        tier: item.dados.tier,
        weight: item.dados.weight
      }));
    }
    
    return jsonData;
  } catch (error) {
    console.error('Erro ao carregar dados do arquivo:', error);
    throw error;
  }
}

// Função para inserir dados no banco de dados
async function insertArmorData(armorData: Omit<ArmorDB, 'id'>[]): Promise<boolean> {
  try {
    console.log(`Inserindo ${armorData.length} armaduras no banco de dados...`);

    // Inserir dados na tabela 'armor'
    const { data, error } = await supabase
      .from('armor')
      .insert(armorData)
      .select();

    if (error) {
      console.error('Erro ao inserir dados no banco:', error);
      return false;
    }

    console.log(`✓ ${data?.length || 0} armaduras inseridas com sucesso no banco de dados!`);
    return true;
  } catch (error) {
    console.error('Erro durante a inserção no banco:', error);
    return false;
  }
}

// Função principal para executar a inserção
async function insertScrapedArmorsToDatabase() {
  try {
    // Encontrar o arquivo mais recente de armaduras extraídas
    const dataDir = path.join(process.cwd(), 'data');
    const files = await fs.readdir(dataDir);
    const armorFiles = files.filter(file => file.startsWith('scraped_armors_for_database'));
    
    if (armorFiles.length === 0) {
      console.error('Nenhum arquivo de armaduras extraídas encontrado na pasta data/');
      return;
    }
    
    // Pegar o arquivo mais recente
    const latestFile = armorFiles.sort().pop();
    const filePath = path.join(dataDir, latestFile!);
    
    console.log(`Carregando dados de: ${filePath}`);
    
    // Carregar dados extraídos
    const scrapedArmors: ScrapedItem[] = await loadScrapedData(filePath);
    
    console.log(`Dados carregados: ${scrapedArmors.length} armaduras`);
    
    // Converter para formato do banco de dados
    const armorDBFormat = convertToArmorDBFormat(scrapedArmors);
    
    // Inserir no banco de dados
    const success = await insertArmorData(armorDBFormat);
    
    if (success) {
      console.log('✅ Inserção no banco de dados concluída com sucesso!');
    } else {
      console.log('❌ Falha na inserção no banco de dados.');
    }
  } catch (error) {
    console.error('Erro na execução da inserção:', error);
  }
}

// Executar a inserção
insertScrapedArmorsToDatabase().catch(error => {
  console.error('Erro crítico:', error);
});