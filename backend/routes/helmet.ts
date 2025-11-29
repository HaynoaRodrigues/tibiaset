import express from 'express';
import supabase from './db';
import { HelmetDB, CreateHelmetDB, UpdateHelmetDB } from '../../src/types/datatypes';
import { etagCacheMiddleware } from '../utils/globalCache';

const router = express.Router();

// GET /helmet - Listar todos os helmets
router.get('/', etagCacheMiddleware('helmet'), async (req, res) => {
  console.log('Rota GET /helmet acionada');
  try {
    // Esta função só será chamada se os dados não estiverem em cache
    const { data, error } = await supabase
      .from('helmet')
      .select('*')
      .eq('ativo', true)
      .limit(20);

    if (error) {
      console.error('Erro ao buscar helmets:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`Encontrados ${data?.length || 0} helmets`);
    // O middleware etagCacheMiddleware irá automaticamente:
    // 1. Armazenar os dados no cache com um ETag
    // 2. Definir o header ETag na resposta
    // 3. Enviar os dados como JSON
    res.json(data);
  } catch (err) {
    console.error('Erro interno do servidor ao buscar helmets:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /helmet/:id - Obter um helmet específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('helmet')
      .select('*')
      .eq('id', id)
      .eq('ativo', true)
      .single();

    if (error) {
      return res.status(404).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /helmet - Criar um novo helmet
router.post('/', async (req, res) => {
  const { name, dados, ativo = true }: CreateHelmetDB = req.body;

  try {
    const { data, error } = await supabase
      .from('helmet')
      .insert([{ name, dados, ativo }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Invalidar o cache após criação
    invalidateCache('helmet');

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /helmet/:id - Atualizar um helmet existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, dados, ativo }: UpdateHelmetDB = req.body;

  try {
    const updateData: Partial<HelmetDB> = {};
    if (name !== undefined) updateData.name = name;
    if (dados !== undefined) updateData.dados = dados;
    if (ativo !== undefined) updateData.ativo = ativo;

    const { data, error } = await supabase
      .from('helmet')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Invalidar o cache após atualização
    invalidateCache('helmet');

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /helmet/:id - Desativar um helmet (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('helmet')
      .update({ ativo: false })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Invalidar o cache após desativação
    invalidateCache('helmet');

    res.json({ message: 'Helmet desativado com sucesso', data });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;