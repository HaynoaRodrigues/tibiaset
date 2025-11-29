import express from 'express';
import supabase from './db';
import { AxeDB, CreateAxeDB, UpdateAxeDB } from '../../src/types/datatypes';

const router = express.Router();

// GET /axe - Listar todos os axes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('axe')
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

// GET /axe/:id - Obter um axe específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('axe')
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

// POST /axe - Criar um novo axe
router.post('/', async (req, res) => {
  const { name, dados, ativo = true }: CreateAxeDB = req.body;

  try {
    const { data, error } = await supabase
      .from('axe')
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

// PUT /axe/:id - Atualizar um axe existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, dados, ativo }: UpdateAxeDB = req.body;

  try {
    const updateData: Partial<AxeDB> = {};
    if (name !== undefined) updateData.name = name;
    if (dados !== undefined) updateData.dados = dados;
    if (ativo !== undefined) updateData.ativo = ativo;

    const { data, error } = await supabase
      .from('axe')
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

// DELETE /axe/:id - Desativar um axe (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('axe')
      .update({ ativo: false })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Axe desativado com sucesso', data });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;