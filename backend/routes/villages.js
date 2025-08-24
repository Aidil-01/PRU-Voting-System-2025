const express = require('express');
const router = express.Router();
const villagesController = require('../controllers/villagesController');

// GET /api/villages - Get all villages
router.get('/', villagesController.getAllVillages);

// POST /api/villages - Add new village
router.post('/', villagesController.addVillage);

// GET /api/villages/:id - Get village by ID with voters
router.get('/:id', villagesController.getVillageById);

// PUT /api/villages/:id - Update village
router.put('/:id', villagesController.updateVillage);

// DELETE /api/villages/:id - Delete village
router.delete('/:id', villagesController.deleteVillage);

module.exports = router;