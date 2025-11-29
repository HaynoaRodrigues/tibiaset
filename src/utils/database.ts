import { createClient } from '@supabase/supabase-js';
import { ArmorDB } from '../src/types/datatypes';
import { readFileSync } from 'fs';

// Inicializar o cliente do Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

// Função para inserir dados no banco de dados
export async function insertArmorData(armorData: Omit<ArmorDB, 'id'>[]): Promise<boolean> {
  try {
    console.log(`Inserindo ${armorData.length} itens no banco de dados...`);
    
    // Inserir os dados na tabela 'armor'
    const { data, error } = await supabase
      .from('armor')
      .insert(armorData)
      .select();
    
    if (error) {
      console.error('Erro ao inserir dados no banco:', error);
      return false;
    }
    
    console.log(`Sucesso! ${data?.length || 0} itens inseridos no banco de dados.`);
    return true;
  } catch (err) {
    console.error('Erro durante a inserção:', err);
    return false;
  }
}

// Função para testar a conexão com o banco
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('armor')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Erro ao testar conexão com o banco:', error);
      return false;
    }
    
    console.log('Conexão com o banco de dados bem-sucedida.');
    return true;
  } catch (err) {
    console.error('Erro durante o teste de conexão:', err);
    return false;
  }
}

// Função para carregar dados de um arquivo JSON e inserir no banco
export async function loadAndInsertFromJson(jsonFilePath: string): Promise<boolean> {
  try {
    // Ler o arquivo JSON
    const jsonData = readFileSync(jsonFilePath, 'utf8');
    const armorData: Omit<ArmorDB, 'id'>[] = JSON.parse(jsonData);
    
    console.log(`Dados carregados do arquivo ${jsonFilePath}: ${armorData.length} itens`);
    
    // Inserir no banco
    return await insertArmorData(armorData);
  } catch (err) {
    console.error('Erro ao carregar e inserir dados do arquivo JSON:', err);
    return false;
  }
}

// Função para limpar dados de teste (útil para testes repetidos)
export async function clearTestData(names: string[]): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('armor')
      .delete()
      .in('name', names);
    
    if (error) {
      console.error('Erro ao limpar dados de teste:', error);
      return false;
    }
    
    console.log(`Dados de teste com nomes ${names.join(', ')} removidos.`);
    return true;
  } catch (err) {
    console.error('Erro durante a limpeza de dados de teste:', err);
    return false;
  }
}