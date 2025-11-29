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

// Função para carregar dados do arquivo ammo.json
async function loadAmmoData(): Promise<any[]> {
  try {
    const dataPath = path.join('data', 'ammo.json');
    const fileContent = await fs.readFile(dataPath, 'utf8');
    const jsonData = JSON.parse(fileContent);

    // Certificar-se de que os dados estão no formato correto (array de objetos)
    if (!Array.isArray(jsonData)) {
      throw new Error('Formato inválido: dados não são um array');
    }

    return jsonData;
  } catch (error) {
    console.error('Erro ao carregar dados do arquivo ammo.json:', error);
    throw error;
  }
}

// Função para inserir ou atualizar dados na tabela 'ammo'
async function insertAmmoData() {
  console.log('Carregando dados de ammo...');
  const ammoData = await loadAmmoData();

  if (ammoData.length > 0) {
    console.log(`Inserindo/atualizando ${ammoData.length} ammos no banco de dados...`);

    // Para cada item de ammo, verificar se já existe e fazer upsert
    for (const ammo of ammoData) {
      // Verificar se já existe um item com o mesmo nome
      const { data: existingData, error: selectError } = await supabase
        .from('ammo')
        .select('id')
        .eq('name', ammo.name)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 é quando nenhum resultado é encontrado
        console.error('Erro ao verificar existência do ammo:', selectError);
        throw selectError;
      }

      let result;
      if (existingData) {
        // Atualizar o registro existente
        result = await supabase
          .from('ammo')
          .update({
            dados: ammo.dados,
            ativo: ammo.ativo
          })
          .eq('name', ammo.name);
      } else {
        // Inserir novo registro
        result = await supabase
          .from('ammo')
          .insert([{
            name: ammo.name,
            dados: ammo.dados,
            ativo: ammo.ativo
          }]);
      }

      if (result.error) {
        console.error(`Erro ao ${existingData ? 'atualizar' : 'inserir'} ammo ${ammo.name}:`, result.error);
        throw result.error;
      } else {
        console.log(`✓ Ammo ${ammo.name} ${existingData ? 'atualizado' : 'inserido'} com sucesso.`);
      }
    }
  } else {
    console.log('Nenhum dado encontrado para ammo.');
  }
}

// Script principal
async function main() {
  try {
    console.log('Iniciando processo de inserção/atualização de dados na tabela ammo...');
    await insertAmmoData();
    console.log('Processo de inserção/atualização concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o processo de inserção/atualização:', error);
  }
}

// Executar o script
main();