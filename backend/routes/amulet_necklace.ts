import express from 'express';
import supabase from './db';
import { AmuletNecklaceDB, CreateAmuletNecklaceDB, UpdateAmuletNecklaceDB } from '../../src/types/datatypes';

const router = express.Router();

// GET /amulet-necklace - Listar todos os amulets/necklaces
router.get('/', async (req, res) => {
  console.log('Rota GET /amulet-necklace acionada');
  try {
    const { data, error } = await supabase
      .from('amulet_necklace')
      .select('*')
      .eq('ativo', true)
      .limit(20);

    if (error) {
      console.error('Erro ao buscar amulets/necklaces:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log(`Encontrados ${data?.length || 0} amulets/necklaces`);
    res.json(data);
  } catch (err) {
    console.error('Erro interno do servidor ao buscar amulets/necklaces:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /amulet-necklace/:id - Obter um amulet/necklace específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('amulet_necklace')
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

// POST /amulet-necklace - Criar um novo amulet/necklace
router.post('/', async (req, res) => {
  const { name, dados, ativo = true }: CreateAmuletNecklaceDB = req.body;

  try {
    const { data, error } = await supabase
      .from('amulet_necklace')
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

// PUT /amulet-necklace/:id - Atualizar um amulet/necklace existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, dados, ativo }: UpdateAmuletNecklaceDB = req.body;

  try {
    const updateData: Partial<AmuletNecklaceDB> = {};
    if (name !== undefined) updateData.name = name;
    if (dados !== undefined) updateData.dados = dados;
    if (ativo !== undefined) updateData.ativo = ativo;

    const { data, error } = await supabase
      .from('amulet_necklace')
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

// DELETE /amulet-necklace/:id - Desativar um amulet/necklace (soft delete)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('amulet_necklace')
      .update({ ativo: false })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Amulet/Necklace desativado com sucesso', data });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;