import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

// Supabase client setup
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

// Função para carregar dados de um arquivo JSON
async function loadJsonData(filename: string) {
  try {
    const dataPath = path.join('data', filename);
    const fileContent = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Erro ao carregar ${filename}:`, error);
    return [];
  }
}

// Função para inserir dados na tabela 'ammo'
async function insertAmmoData() {
  console.log('Inserindo dados na tabela ammo...');
  const ammoData = await loadJsonData('ammo.json');

  if (ammoData.length > 0) {
    // Primeiro, limpar a tabela
    await supabase.from('ammo').delete().gt('id', 0);

    // Depois inserir os novos dados
    const { data, error } = await supabase
      .from('ammo')
      .insert(ammoData)
      .select();

    if (error) {
      console.error('Erro ao inserir dados na tabela ammo:', error);
    } else {
      console.log(`✓ ${data?.length || 0} itens inseridos na tabela ammo.`);
    }
  } else {
    console.log('Nenhum dado encontrado para ammo.');
  }
}

// Função para inserir dados na tabela 'axe'
async function insertAxeData() {
  console.log('Inserindo dados na tabela axe...');
  const axeData = await loadJsonData('axes.json');

  if (axeData.length > 0) {
    // Primeiro, limpar a tabela
    await supabase.from('axe').delete().gt('id', 0);

    // Depois inserir os novos dados
    const { data, error } = await supabase
      .from('axe')
      .insert(axeData)
      .select();

    if (error) {
      console.error('Erro ao inserir dados na tabela axe:', error);
    } else {
      console.log(`✓ ${data?.length || 0} itens inseridos na tabela axe.`);
    }
  } else {
    console.log('Nenhum dado encontrado para axe.');
  }
}

// Função para inserir dados na tabela 'quiver'
async function insertQuiverData() {
  console.log('Inserindo dados na tabela quiver...');
  const quiverData = await loadJsonData('quivers.json');

  if (quiverData.length > 0) {
    // Primeiro, limpar a tabela
    await supabase.from('quiver').delete().gt('id', 0);

    // Depois inserir os novos dados
    const { data, error } = await supabase
      .from('quiver')
      .insert(quiverData)
      .select();

    if (error) {
      console.error('Erro ao inserir dados na tabela quiver:', error);
    } else {
      console.log(`✓ ${data?.length || 0} itens inseridos na tabela quiver.`);
    }
  } else {
    console.log('Nenhum dado encontrado para quiver.');
  }
}

// Função para inserir dados na tabela 'club'
async function insertClubData() {
  console.log('Inserindo dados na tabela club...');
  const clubData = await loadJsonData('clubs.json');
  
  if (clubData.length > 0) {
    // Primeiro, limpar a tabela
    await supabase.from('club').delete().gt('id', 0);
    
    // Depois inserir os novos dados
    const { data, error } = await supabase
      .from('club')
      .insert(clubData)
      .select();
      
    if (error) {
      console.error('Erro ao inserir dados na tabela club:', error);
    } else {
      console.log(`✓ ${data?.length || 0} itens inseridos na tabela club.`);
    }
  } else {
    console.log('Nenhum dado encontrado para club.');
  }
}

// Função para inserir dados na tabela 'sword'
async function insertSwordData() {
  console.log('Inserindo dados na tabela sword...');
  try {
    const swordData = await loadJsonData('swords.json');

    if (swordData.length > 0) {
      // Primeiro, limpar a tabela
      await supabase.from('sword').delete().gt('id', 0);

      // Depois inserir os novos dados
      const { data, error } = await supabase
        .from('sword')
        .insert(swordData)
        .select();

      if (error) {
        console.error('Erro ao inserir dados na tabela sword:', error);
      } else {
        console.log(`✓ ${data?.length || 0} itens inseridos na tabela sword.`);
      }
    } else {
      console.log('Nenhum dado encontrado para sword.');
    }
  } catch (error) {
    console.error('Erro ao processar dados da tabela sword:', error);
  }
}

// Função para inserir dados na tabela 'distance'
async function insertDistanceData() {
  console.log('Inserindo dados na tabela distance...');
  try {
    const distanceData = await loadJsonData('distance.json');

    if (distanceData.length > 0) {
      // Primeiro, limpar a tabela
      await supabase.from('distance').delete().gt('id', 0);

      // Depois inserir os novos dados
      const { data, error } = await supabase
        .from('distance')
        .insert(distanceData)
        .select();

      if (error) {
        console.error('Erro ao inserir dados na tabela distance:', error);
      } else {
        console.log(`✓ ${data?.length || 0} itens inseridos na tabela distance.`);
      }
    } else {
      console.log('Nenhum dado encontrado para distance.');
    }
  } catch (error) {
    console.error('Erro ao processar dados da tabela distance:', error);
  }
}

// Função para inserir dados na tabela 'rod'
async function insertRodData() {
  console.log('Inserindo dados na tabela rod...');
  try {
    const rodData = await loadJsonData('rods.json');

    if (rodData.length > 0) {
      // Primeiro, limpar a tabela
      await supabase.from('rod').delete().gt('id', 0);

      // Depois inserir os novos dados
      const { data, error } = await supabase
        .from('rod')
        .insert(rodData)
        .select();

      if (error) {
        console.error('Erro ao inserir dados na tabela rod:', error);
      } else {
        console.log(`✓ ${data?.length || 0} itens inseridos na tabela rod.`);
      }
    } else {
      console.log('Nenhum dado encontrado para rod.');
    }
  } catch (error) {
    console.error('Erro ao processar dados da tabela rod:', error);
  }
}

// Função para inserir dados na tabela 'wand'
async function insertWandData() {
  console.log('Inserindo dados na tabela wand...');
  const wandData = await loadJsonData('wands.json');
  
  if (wandData.length > 0) {
    // Primeiro, limpar a tabela
    await supabase.from('wand').delete().gt('id', 0);
    
    // Depois inserir os novos dados
    const { data, error } = await supabase
      .from('wand')
      .insert(wandData)
      .select();
      
    if (error) {
      console.error('Erro ao inserir dados na tabela wand:', error);
    } else {
      console.log(`✓ ${data?.length || 0} itens inseridos na tabela wand.`);
    }
  } else {
    console.log('Nenhum dado encontrado para wand.');
  }
}

// Função para inserir dados na tabela 'fist'
async function insertFistData() {
  console.log('Inserindo dados na tabela fist...');
  const fistData = await loadJsonData('fists.json');
  
  if (fistData.length > 0) {
    // Primeiro, limpar a tabela
    await supabase.from('fist').delete().gt('id', 0);
    
    // Depois inserir os novos dados
    const { data, error } = await supabase
      .from('fist')
      .insert(fistData)
      .select();
      
    if (error) {
      console.error('Erro ao inserir dados na tabela fist:', error);
    } else {
      console.log(`✓ ${data?.length || 0} itens inseridos na tabela fist.`);
    }
  } else {
    console.log('Nenhum dado encontrado para fist.');
  }
}

// Função principal para executar todas as inserções
async function insertAllNewData() {
  console.log('Iniciando inserção de dados para novas tabelas...\n');

  await insertAmmoData();
  await insertAxeData();
  await insertClubData();
  await insertSwordData();
  await insertDistanceData();
  await insertRodData();
  await insertWandData();
  await insertFistData();
  await insertQuiverData();

  console.log('\n✅ Inserção de dados concluída com sucesso!');
}

// Executar a inserção
insertAllNewData().catch(error => {
  console.error('Erro crítico:', error);
  process.exit(1);
});