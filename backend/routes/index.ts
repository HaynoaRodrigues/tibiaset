import express from 'express';
import armorRoutes from './armor';
import helmetRoutes from './helmet';
import shieldRoutes from './shield';
import spellbookRoutes from './spellbook';
import legsRoutes from './legs';
import bootsRoutes from './boots';
import amuletNecklaceRoutes from './amulet_necklace';
import ringRoutes from './ring';
import extraSlotRoutes from './extra_slot';
import axeRoutes from './axe';
import clubRoutes from './club';
import swordRoutes from './sword';
import rodRoutes from './rod';
import wandRoutes from './wand';
import distanceRoutes from './distance';
import ammoRoutes from './ammo';
import fistRoutes from './fist';
import quiverRoutes from './quiver';

const router = express.Router();

// Registrar todas as rotas
router.use('/armor', armorRoutes);
router.use('/helmet', helmetRoutes);
router.use('/shield', shieldRoutes);
router.use('/spellbook', spellbookRoutes);
router.use('/legs', legsRoutes);
router.use('/boots', bootsRoutes);
router.use('/amulet-necklace', amuletNecklaceRoutes);
router.use('/ring', ringRoutes);
router.use('/extra-slot', extraSlotRoutes);
router.use('/axe', axeRoutes);
router.use('/club', clubRoutes);
router.use('/sword', swordRoutes);
router.use('/rod', rodRoutes);
router.use('/wand', wandRoutes);
router.use('/distance', distanceRoutes);
router.use('/ammo', ammoRoutes);
router.use('/fist', fistRoutes);
router.use('/quiver', quiverRoutes);

export default router;