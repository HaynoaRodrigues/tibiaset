import { insertArmorData, testConnection, clearTestData } from './database';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual do script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Função para carregar dados de um arquivo JSON e inserir no banco
async function loadAndInsertFromJson(jsonFilePath: string): Promise<boolean> {
  try {
    // Construir caminho absoluto para o arquivo
    const fullPath = join(__dirname, jsonFilePath);

    // Ler o arquivo JSON
    const jsonData = readFileSync(fullPath, 'utf8');
    const armorData = JSON.parse(jsonData);

    console.log(`Dados carregados do arquivo ${fullPath}: ${armorData.length} itens`);

    // Inserir no banco
    return await insertArmorData(armorData);
  } catch (err) {
    console.error('Erro ao carregar e inserir dados do arquivo JSON:', err);
    return false;
  }
}

// Script de teste
async function testDatabaseInsertion() {
  console.log('Iniciando teste de conexão com o banco de dados...');

  // Testar conexão
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('Falha na conexão com o banco de dados. Encerrando teste.');
    return;
  }

  // Caminho para o arquivo de dados no formato correto para o banco
  const dataFilePath = '../data/armor_db_format_2025-11-26T14-30-20.json';

  console.log('\nIniciando teste de inserção de dados...');
  const success = await loadAndInsertFromJson(dataFilePath);

  if (success) {
    console.log('\nTeste de inserção concluído com sucesso!');
    console.log('Os dados foram inseridos no banco de dados conforme o formato correto.');
  } else {
    console.error('\nFalha no teste de inserção.');
  }
}

// Executar o teste
testDatabaseInsertion();