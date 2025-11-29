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

// Função para carregar URLs do arquivo images.json
async function loadImagesData(): Promise<string[]> {
  try {
    const dataPath = path.join('data', 'images.json');
    const fileContent = await fs.readFile(dataPath, 'utf8');
    const jsonData = JSON.parse(fileContent);

    // Certificar-se de que os dados estão no formato correto (array de strings)
    if (!Array.isArray(jsonData)) {
      throw new Error('Formato inválido: dados não são um array');
    }

    return jsonData;
  } catch (error) {
    console.error('Erro ao carregar dados do arquivo images.json:', error);
    throw error;
  }
}

// Função para obter os IDs dos registros existentes na tabela 'fist'
async function getFistIds() {
  const { data, error } = await supabase
    .from('fist')
    .select('id, dados, name')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erro ao buscar IDs dos fist:', error);
    throw error;
  }

  return data;
}

// Função para atualizar a tabela 'fist' com as URLs como imageUrl na coluna 'dados'
async function updateFistWithImages() {
  console.log('Carregando URLs de images.json...');
  const imageUrls = await loadImagesData();

  console.log('Buscando registros existentes na tabela fist...');
  const existingFist = await getFistIds();

  if (imageUrls.length > 0 && existingFist.length > 0) {
    const maxUpdates = Math.min(imageUrls.length, existingFist.length);
    console.log(`Atualizando ${maxUpdates} registros de fist com URLs de imagens...`);

    // Atualizar cada registro existente com a URL correspondente
    for (let i = 0; i < maxUpdates; i++) {
      const fistId = existingFist[i].id;
      const imageUrl = imageUrls[i];
      
      // Combinar o imageUrl com os dados existentes
      const existingDados = existingFist[i].dados || {};
      const updatedDados = { ...existingDados, imageUrl };

      const { error } = await supabase
        .from('fist')
        .update({ dados: updatedDados })
        .eq('id', fistId);

      if (error) {
        console.error(`Erro ao atualizar fist com ID ${fistId}:`, error);
        throw error;
      } else {
        console.log(`✓ Fist com ID ${fistId} (${existingFist[i].name}) atualizado com imagem: ${imageUrl}`);
      }
    }

    console.log(`✓ ${maxUpdates} registros de fist atualizados com URLs de imagens.`);
  } else if (existingFist.length === 0) {
    console.log('Nenhum registro encontrado na tabela fist.');
  } else if (imageUrls.length === 0) {
    console.log('Nenhum URL encontrado em images.json.');
  }
}

// Script principal
async function main() {
  try {
    console.log('Iniciando processo de atualização da tabela fist com URLs de imagens...');
    await updateFistWithImages();
    console.log('Processo de atualização concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o processo de atualização:', error);
  }
}

// Executar o script
main();