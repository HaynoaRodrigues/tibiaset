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

// Função para obter os IDs dos registros existentes na tabela 'amulet_necklace'
async function getAmuletNecklaceIds() {
  const { data, error } = await supabase
    .from('amulet_necklace')
    .select('id, dados, name')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erro ao buscar IDs dos amulet_necklace:', error);
    throw error;
  }

  return data;
}

// Função para atualizar a tabela 'amulet_necklace' com as URLs como imageUrl na coluna 'dados'
async function updateAmuletNecklaceWithImages() {
  console.log('Carregando URLs de images.json...');
  const imageUrls = await loadImagesData();

  console.log('Buscando registros existentes na tabela amulet_necklace...');
  const existingAmuletNecklace = await getAmuletNecklaceIds();

  if (imageUrls.length > 0 && existingAmuletNecklace.length > 0) {
    const maxUpdates = Math.min(imageUrls.length, existingAmuletNecklace.length);
    console.log(`Atualizando ${maxUpdates} registros de amulet_necklace com URLs de imagens...`);

    // Atualizar cada registro existente com a URL correspondente
    for (let i = 0; i < maxUpdates; i++) {
      const amuletNecklaceId = existingAmuletNecklace[i].id;
      const imageUrl = imageUrls[i];
      
      // Combinar o imageUrl com os dados existentes
      const existingDados = existingAmuletNecklace[i].dados || {};
      const updatedDados = { ...existingDados, imageUrl };

      const { error } = await supabase
        .from('amulet_necklace')
        .update({ dados: updatedDados })
        .eq('id', amuletNecklaceId);

      if (error) {
        console.error(`Erro ao atualizar amulet_necklace com ID ${amuletNecklaceId}:`, error);
        throw error;
      } else {
        console.log(`✓ Amuleto/corrente com ID ${amuletNecklaceId} (${existingAmuletNecklace[i].name}) atualizado com imagem: ${imageUrl}`);
      }
    }

    console.log(`✓ ${maxUpdates} registros de amulet_necklace atualizados com URLs de imagens.`);
  } else if (existingAmuletNecklace.length === 0) {
    console.log('Nenhum registro encontrado na tabela amulet_necklace.');
  } else if (imageUrls.length === 0) {
    console.log('Nenhum URL encontrado em images.json.');
  }
}

// Script principal
async function main() {
  try {
    console.log('Iniciando processo de atualização da tabela amulet_necklace com URLs de imagens...');
    await updateAmuletNecklaceWithImages();
    console.log('Processo de atualização concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o processo de atualização:', error);
  }
}

// Executar o script
main();