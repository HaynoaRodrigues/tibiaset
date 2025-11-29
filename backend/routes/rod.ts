import express from 'express';
import supabase from './db';
import { RodDB, CreateRodDB, UpdateRodDB } from '../../src/types/datatypes';

const router = express.Router();

// GET /rod - Listar todos os rods
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rod')
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

// GET /rod/:id - Obter um rod específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('rod')
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

// POST /rod - Criar um novo rod
router.post('/', async (req, res) => {
  const { name, dados, ativo = true }: CreateRodDB = req.body;

  try {
    const { data, error } = await supabase
      .from('rod')
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

// PUT /rod/:id - Atualizar um rod existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, dados, ativo }: UpdateRodDB = req.body;

  try {
    const updateData: Partial<RodDB> = {};
    if (name !== undefined) updateData.name = name;
    if (dados !== undefined) updateData.dados = dados;
    if (ativo !== undefined) updateData.ativo = ativo;

    const { data, error } = await supabase
      .from('rod')
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

// DELETE /rod/:id - Desativar um rod (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('rod')
      .update({ ativo: false })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Rod desativado com sucesso', data });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;