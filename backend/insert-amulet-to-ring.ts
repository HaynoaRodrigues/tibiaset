import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' }); // Carregar variáveis de ambiente do arquivo .env

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

// Função para carregar dados do arquivo amulet_necklace.json
async function loadAmuletNecklaceData(): Promise<any[]> {
  try {
    const dataPath = path.join('data', 'amulet_necklace.json');
    const fileContent = await fs.readFile(dataPath, 'utf8');
    const jsonData = JSON.parse(fileContent);

    // Certificar-se de que os dados estão no formato correto (array de objetos)
    if (!Array.isArray(jsonData)) {
      throw new Error('Formato inválido: dados não são um array');
    }

    return jsonData;
  } catch (error) {
    console.error('Erro ao carregar dados do arquivo amulet_necklace.json:', error);
    throw error;
  }
}

// Função para inserir ou atualizar dados na tabela 'ring'
async function insertRingData() {
  console.log('Carregando dados de amulet_necklace para inserir em ring...');
  const amuletNecklaceData = await loadAmuletNecklaceData();

  if (amuletNecklaceData.length > 0) {
    console.log(`Inserindo/atualizando ${amuletNecklaceData.length} anéis no banco de dados a partir dos dados de amuletos...`);

    // Para cada item de amuleto/corrente, verificar se já existe e fazer upsert na tabela de ring
    for (const item of amuletNecklaceData) {
      // Verificar se já existe um item com o mesmo nome
      const { data: existingData, error: selectError } = await supabase
        .from('ring')
        .select('id')
        .eq('name', item.name)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 é quando nenhum resultado é encontrado
        console.error('Erro ao verificar existência do anel:', selectError);
        throw selectError;
      }

      let result;
      if (existingData) {
        // Atualizar o registro existente
        result = await supabase
          .from('ring')
          .update({
            dados: item.dados,
            ativo: item.ativo
          })
          .eq('name', item.name);
      } else {
        // Inserir novo registro
        result = await supabase
          .from('ring')
          .insert([{
            name: item.name,
            dados: item.dados,
            ativo: item.ativo
          }]);
      }

      if (result.error) {
        console.error(`Erro ao ${existingData ? 'atualizar' : 'inserir'} anel ${item.name}:`, result.error);
        throw result.error;
      } else {
        console.log(`✓ Anel ${item.name} ${existingData ? 'atualizado' : 'inserido'} com sucesso.`);
      }
    }
  } else {
    console.log('Nenhum dado encontrado para inserir em ring.');
  }
}

// Script principal
async function main() {
  try {
    console.log('Iniciando processo de inserção/atualização de dados na tabela ring a partir de amulet_necklace.json...');
    await insertRingData();
    console.log('Processo de inserção/atualização concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o processo de inserção/atualização:', error);
  }
}

// Executar o script
main();