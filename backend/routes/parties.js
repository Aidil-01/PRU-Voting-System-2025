const express = require('express');
const router = express.Router();
const partiesController = require('../controllers/partiesController');
const upload = require('../middleware/upload');

// GET /api/parties - Get all parties
router.get('/', partiesController.getAllParties);

// POST /api/parties - Add new party with optional logo upload
router.post('/', upload.single('logo'), partiesController.addParty);

// GET /api/parties/colors - Get party colors for frontend
router.get('/colors', partiesController.getPartyColors);

// GET /api/parties/:id - Get party by ID with vote details
router.get('/:id', partiesController.getPartyById);

// PUT /api/parties/:id - Update party with optional logo upload
router.put('/:id', upload.single('logo'), partiesController.updateParty);

// POST /api/parties/:id/upload-logo - Upload logo for existing party
router.post('/:id/upload-logo', upload.single('logo'), partiesController.uploadLogo);

// DELETE /api/parties/:id - Delete party
router.delete('/:id', partiesController.deleteParty);

module.exports = router;