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

// Função para obter os IDs dos registros existentes na tabela 'helmet'
async function getHelmetIds() {
  const { data, error } = await supabase
    .from('helmet')
    .select('id, dados, name')
    .order('id', { ascending: true });

  if (error) {
    console.error('Erro ao buscar IDs dos helmet:', error);
    throw error;
  }

  return data;
}

// Função para atualizar a tabela 'helmet' com as URLs como imageUrl na coluna 'dados'
async function updateHelmetWithImages() {
  console.log('Carregando URLs de images.json...');
  const imageUrls = await loadImagesData();

  console.log('Buscando registros existentes na tabela helmet...');
  const existingHelmet = await getHelmetIds();

  if (imageUrls.length > 0 && existingHelmet.length > 0) {
    const maxUpdates = Math.min(imageUrls.length, existingHelmet.length);
    console.log(`Atualizando ${maxUpdates} registros de helmet com URLs de imagens...`);

    // Atualizar cada registro existente com a URL correspondente
    for (let i = 0; i < maxUpdates; i++) {
      const helmetId = existingHelmet[i].id;
      const imageUrl = imageUrls[i];
      
      // Combinar o imageUrl com os dados existentes
      const existingDados = existingHelmet[i].dados || {};
      const updatedDados = { ...existingDados, imageUrl };

      const { error } = await supabase
        .from('helmet')
        .update({ dados: updatedDados })
        .eq('id', helmetId);

      if (error) {
        console.error(`Erro ao atualizar helmet com ID ${helmetId}:`, error);
        throw error;
      } else {
        console.log(`✓ Helmet com ID ${helmetId} (${existingHelmet[i].name}) atualizado com imagem: ${imageUrl}`);
      }
    }

    console.log(`✓ ${maxUpdates} registros de helmet atualizados com URLs de imagens.`);
  } else if (existingHelmet.length === 0) {
    console.log('Nenhum registro encontrado na tabela helmet.');
  } else if (imageUrls.length === 0) {
    console.log('Nenhum URL encontrado em images.json.');
  }
}

// Script principal
async function main() {
  try {
    console.log('Iniciando processo de atualização da tabela helmet com URLs de imagens...');
    await updateHelmetWithImages();
    console.log('Processo de atualização concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o processo de atualização:', error);
  }
}

// Executar o script
main();