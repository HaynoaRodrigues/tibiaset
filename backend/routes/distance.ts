import express from 'express';
import supabase from './db';
import { DistanceDB, CreateDistanceDB, UpdateDistanceDB } from '../../src/types/datatypes';

const router = express.Router();

// GET /distance - Listar todos os distance weapons
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('distance')
      .select('*')
      .eq('ativo', true);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /distance/:id - Obter um distance weapon específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('distance')
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

// POST /distance - Criar um novo distance weapon
router.post('/', async (req, res) => {
  const { name, dados, ativo = true }: CreateDistanceDB = req.body;

  try {
    const { data, error } = await supabase
      .from('distance')
      .insert([{ name, dados, ativo }])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /distance/:id - Atualizar um distance weapon existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, dados, ativo }: UpdateDistanceDB = req.body;

  try {
    const updateData: Partial<DistanceDB> = {};
    if (name !== undefined) updateData.name = name;
    if (dados !== undefined) updateData.dados = dados;
    if (ativo !== undefined) updateData.ativo = ativo;

    const { data, error } = await supabase
      .from('distance')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /distance/:id - Desativar um distance weapon (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('distance')
      .update({ ativo: false })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Distance weapon desativado com sucesso', data });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;