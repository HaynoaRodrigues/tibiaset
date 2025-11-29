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

// Função para obter os IDs dos registros existentes na tabela 'wand'
async function getWandIds() {
  const { data, error } = await supabase
    .from('wand')
    .select('id, dados, name')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erro ao buscar IDs dos wand:', error);
    throw error;
  }

  return data;
}

// Função para atualizar a tabela 'wand' com as URLs como imageUrl na coluna 'dados'
async function updateWandWithImages() {
  console.log('Carregando URLs de images.json...');
  const imageUrls = await loadImagesData();

  console.log('Buscando registros existentes na tabela wand...');
  const existingWand = await getWandIds();

  if (imageUrls.length > 0 && existingWand.length > 0) {
    const maxUpdates = Math.min(imageUrls.length, existingWand.length);
    console.log(`Atualizando ${maxUpdates} registros de wand com URLs de imagens...`);

    // Atualizar cada registro existente com a URL correspondente
    for (let i = 0; i < maxUpdates; i++) {
      const wandId = existingWand[i].id;
      const imageUrl = imageUrls[i];
      
      // Combinar o imageUrl com os dados existentes
      const existingDados = existingWand[i].dados || {};
      const updatedDados = { ...existingDados, imageUrl };

      const { error } = await supabase
        .from('wand')
        .update({ dados: updatedDados })
        .eq('id', wandId);

      if (error) {
        console.error(`Erro ao atualizar wand com ID ${wandId}:`, error);
        throw error;
      } else {
        console.log(`✓ Wand com ID ${wandId} (${existingWand[i].name}) atualizado com imagem: ${imageUrl}`);
      }
    }

    console.log(`✓ ${maxUpdates} registros de wand atualizados com URLs de imagens.`);
  } else if (existingWand.length === 0) {
    console.log('Nenhum registro encontrado na tabela wand.');
  } else if (imageUrls.length === 0) {
    console.log('Nenhum URL encontrado em images.json.');
  }
}

// Script principal
async function main() {
  try {
    console.log('Iniciando processo de atualização da tabela wand com URLs de imagens...');
    await updateWandWithImages();
    console.log('Processo de atualização concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o processo de atualização:', error);
  }
}

// Executar o script
main();