const express = require('express');
const router = express.Router();
const votersController = require('../controllers/votersController');

console.log('Voters routes file loaded');

// GET /api/voters - Get all voters with pagination and search
router.get('/', votersController.getAllVoters);

// POST /api/voters - Add new voter
router.post('/', votersController.addVoter);

// POST /api/voters/vote - Cast vote
router.post('/vote', votersController.castVote);

// GET /api/voters/stats - Get voting statistics
router.get('/stats', votersController.getVotingStats);

// GET /api/voters/:id - Get voter by ID
router.get('/:id', votersController.getVoterById);

// PUT /api/voters/:id - Update voter
router.put('/:id', votersController.updateVoter);

// DELETE /api/voters/:id - Delete voter
router.delete('/:id', votersController.deleteVoter);

module.exports = router;