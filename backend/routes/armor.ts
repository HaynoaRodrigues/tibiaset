import express from 'express';
import supabase from './db';
import { ArmorDB, CreateArmorDB, UpdateArmorDB } from '../../src/types/datatypes';
import { etagCacheMiddleware, invalidateCache } from '../utils/globalCache';

const router = express.Router();

// GET /armor - Listar todos os armors
router.get('/', etagCacheMiddleware('armor'), async (req, res) => {
  try {
    // Esta função só será chamada se os dados não estiverem em cache
    const { data, error } = await supabase
      .from('armor')
      .select('*')
      .eq('ativo', true);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // O middleware etagCacheMiddleware irá automaticamente:
    // 1. Armazenar os dados no cache com um ETag
    // 2. Definir o header ETag na resposta
    // 3. Enviar os dados como JSON
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /armor/:id - Obter um armor específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('armor')
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

// POST /armor - Criar um novo armor
router.post('/', async (req, res) => {
  const { name, dados, ativo = true }: CreateArmorDB = req.body;

  try {
    const { data, error } = await supabase
      .from('armor')
      .insert([{ name, dados, ativo }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Invalidar o cache após criação
    invalidateCache('armor');

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /armor/:id - Atualizar um armor existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, dados, ativo }: UpdateArmorDB = req.body;

  try {
    const updateData: Partial<ArmorDB> = {};
    if (name !== undefined) updateData.name = name;
    if (dados !== undefined) updateData.dados = dados;
    if (ativo !== undefined) updateData.ativo = ativo;

    const { data, error } = await supabase
      .from('armor')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Invalidar o cache após atualização
    invalidateCache('armor');

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /armor/:id - Desativar um armor (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('armor')
      .update({ ativo: false })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Invalidar o cache após desativação
    invalidateCache('armor');

    res.json({ message: 'Armor desativado com sucesso', data });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;