import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' }); // Carregar variáveis de ambiente do arquivo .env
import { QuiverDB } from '../src/types/datatypes';

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

// Função para carregar dados do arquivo JSON
async function loadQuiverData(): Promise<Omit<QuiverDB, 'id'>[]> {
  try {
    const dataPath = path.join('data', 'quivers.json');
    const fileContent = await fs.readFile(dataPath, 'utf8');
    const jsonData = JSON.parse(fileContent);

    // Certificar-se de que os dados estão no formato correto
    if (!Array.isArray(jsonData)) {
      throw new Error('Formato inválido: dados não são um array');
    }

    return jsonData;
  } catch (error) {
    console.error('Erro ao carregar dados do arquivo:', error);
    throw error;
  }
}

// Função para inserir dados na tabela 'quiver'
async function insertQuiverData() {
  console.log('Carregando dados de quivers...');
  const quiverData = await loadQuiverData();

  if (quiverData.length > 0) {
    console.log(`Inserindo ${quiverData.length} quivers no banco de dados...`);

    // Primeiro, limpar a tabela (opcional - remover se quiser apenas adicionar)
    // await supabase.from('quiver').delete().gt('id', 0);

    // Depois inserir os novos dados
    const { data, error } = await supabase
      .from('quiver')
      .insert(quiverData)
      .select();

    if (error) {
      console.error('Erro ao inserir dados na tabela quiver:', error);
      throw error;
    } else {
      console.log(`✓ ${data?.length || 0} quivers inseridos na tabela quiver.`);
    }
  } else {
    console.log('Nenhum dado encontrado para quivers.');
  }
}

// Script principal
async function main() {
  try {
    console.log('Iniciando processo de inserção de dados na tabela quiver...');
    await insertQuiverData();
    console.log('Processo de inserção concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o processo de inserção:', error);
  }
}

// Executar o script
main();