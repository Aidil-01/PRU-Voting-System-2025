const { pool } = require('../config/database');

// Get all voters with pagination and search
exports.getAllVoters = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', village = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        v.id, 
        v.name, 
        v.ic_number, 
        v.has_voted, 
        v.voted_at,
        vil.name as village_name,
        p.name as party_name,
        p.color as party_color
      FROM voters v
      LEFT JOIN villages vil ON v.village_id = vil.id
      LEFT JOIN parties p ON v.party_voted_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      query += ` AND (v.name LIKE ? OR v.ic_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (village) {
      // Check if village is ID (number) or name (string)
      if (/^\d+$/.test(village)) {
        query += ` AND v.village_id = ?`;
        params.push(parseInt(village));
      } else {
        query += ` AND vil.name = ?`;
        params.push(village);
      }
    }
    
    query += ` ORDER BY v.name LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [voters] = await pool.execute(query, params);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM voters v LEFT JOIN villages vil ON v.village_id = vil.id WHERE 1=1`;
    const countParams = [];
    
    if (search) {
      countQuery += ` AND (v.name LIKE ? OR v.ic_number LIKE ?)`;
      countParams.push(`%${search}%`, `%${search}%`);
    }
    
    if (village) {
      // Check if village is ID (number) or name (string)
      if (/^\d+$/.test(village)) {
        countQuery += ` AND v.village_id = ?`;
        countParams.push(parseInt(village));
      } else {
        countQuery += ` AND vil.name = ?`;
        countParams.push(village);
      }
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
      voters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching voters:', error);
    res.status(500).json({ error: 'Failed to fetch voters' });
  }
};

// Add new voter
exports.addVoter = async (req, res) => {
  try {
    const { name, ic_number, village_id } = req.body;
    
    // Validate required fields
    if (!name || !ic_number || !village_id) {
      return res.status(400).json({ error: 'Name, IC number, and village are required' });
    }
    
    // Validate IC number format (Malaysian IC: 12 digits)
    if (!/^\d{12}$/.test(ic_number)) {
      return res.status(400).json({ error: 'IC number must be 12 digits' });
    }
    
    const query = `
      INSERT INTO voters (name, ic_number, village_id) 
      VALUES (?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [name, ic_number, village_id]);
    
    // Get the created voter
    const [newVoter] = await pool.execute(`
      SELECT 
        v.id, 
        v.name, 
        v.ic_number, 
        v.has_voted,
        vil.name as village_name
      FROM voters v
      LEFT JOIN villages vil ON v.village_id = vil.id
      WHERE v.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      message: 'Voter added successfully',
      voter: newVoter[0]
    });
    
  } catch (error) {
    console.error('Error adding voter:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'IC number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add voter' });
    }
  }
};

// Cast vote
exports.castVote = async (req, res) => {
  try {
    const { voter_id, party_id } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent') || '';
    
    if (!voter_id || !party_id) {
      return res.status(400).json({ error: 'Voter ID and Party ID are required' });
    }
    
    // Use stored procedure for secure voting
    const query = 'CALL CastVote(?, ?, ?, ?)';
    await pool.execute(query, [voter_id, party_id, ip_address, user_agent]);
    
    res.json({ message: 'Vote cast successfully' });
    
    // Emit real-time update (will be handled by socket.io)
    if (req.io) {
      const stats = await getVotingStats();
      req.io.emit('voteUpdate', stats);
    }
    
  } catch (error) {
    console.error('Error casting vote:', error);
    if (error.message.includes('Voter not found or has already voted')) {
      res.status(400).json({ error: 'Voter not found or has already voted' });
    } else {
      res.status(500).json({ error: 'Failed to cast vote' });
    }
  }
};

// Get voting statistics
exports.getVotingStats = async (req, res) => {
  try {
    const stats = await getVotingStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Get voter by ID
exports.getVoterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        v.id, 
        v.name, 
        v.ic_number, 
        v.village_id,
        v.has_voted, 
        v.voted_at,
        v.party_voted_id,
        vil.name as village_name,
        p.name as party_name,
        p.color as party_color
      FROM voters v
      LEFT JOIN villages vil ON v.village_id = vil.id
      LEFT JOIN parties p ON v.party_voted_id = p.id
      WHERE v.id = ?
    `;
    
    const [voters] = await pool.execute(query, [id]);
    
    if (voters.length === 0) {
      return res.status(404).json({ error: 'Voter not found' });
    }
    
    res.json(voters[0]);
  } catch (error) {
    console.error('Error fetching voter:', error);
    res.status(500).json({ error: 'Failed to fetch voter' });
  }
};

// Update voter
exports.updateVoter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, ic_number, village_id } = req.body;
    
    if (!name || !ic_number || !village_id) {
      return res.status(400).json({ error: 'Name, IC number, and village ID are required' });
    }
    
    // Check if voter has already voted
    const [existingVoter] = await pool.execute(
      'SELECT has_voted FROM voters WHERE id = ?',
      [id]
    );
    
    if (existingVoter.length === 0) {
      return res.status(404).json({ error: 'Voter not found' });
    }
    
    if (existingVoter[0].has_voted) {
      return res.status(400).json({ error: 'Cannot edit voter who has already voted' });
    }
    
    // Check IC number uniqueness (excluding current voter)
    const [icCheck] = await pool.execute(
      'SELECT id FROM voters WHERE ic_number = ? AND id != ?',
      [ic_number, id]
    );
    
    if (icCheck.length > 0) {
      return res.status(400).json({ error: 'IC number already exists' });
    }
    
    // Update voter
    await pool.execute(
      'UPDATE voters SET name = ?, ic_number = ?, village_id = ? WHERE id = ?',
      [name, ic_number, village_id, id]
    );
    
    // Return updated voter
    const [updatedVoter] = await pool.execute(
      `SELECT v.*, vil.name as village_name 
       FROM voters v 
       LEFT JOIN villages vil ON v.village_id = vil.id 
       WHERE v.id = ?`,
      [id]
    );
    
    res.json(updatedVoter[0]);
  } catch (error) {
    console.error('Error updating voter:', error);
    res.status(500).json({ error: 'Failed to update voter' });
  }
};

// Delete voter
exports.deleteVoter = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if voter exists and has voted
    const [existingVoter] = await pool.execute(
      'SELECT has_voted FROM voters WHERE id = ?',
      [id]
    );
    
    if (existingVoter.length === 0) {
      return res.status(404).json({ error: 'Voter not found' });
    }
    
    if (existingVoter[0].has_voted) {
      return res.status(400).json({ error: 'Cannot delete voter who has already voted' });
    }
    
    // Delete voter
    await pool.execute('DELETE FROM voters WHERE id = ?', [id]);
    
    res.json({ message: 'Voter deleted successfully' });
  } catch (error) {
    console.error('Error deleting voter:', error);
    res.status(500).json({ error: 'Failed to delete voter' });
  }
};

// Helper function to get voting statistics
async function getVotingStats() {
  // Overall stats
  const [overallStats] = await pool.execute('SELECT * FROM overall_stats');
  
  // Party stats
  const [partyStats] = await pool.execute('SELECT * FROM vote_stats_by_party');
  
  // Village stats
  const [villageStats] = await pool.execute('SELECT * FROM vote_stats_by_village');
  
  // Recent votes (last 10)
  const [recentVotes] = await pool.execute(`
    SELECT 
      v.name as voter_name,
      p.name as party_name,
      p.color as party_color,
      vil.name as village_name,
      vl.voted_at
    FROM vote_logs vl
    JOIN voters v ON vl.voter_id = v.id
    JOIN parties p ON vl.party_id = p.id
    JOIN villages vil ON vl.village_id = vil.id
    ORDER BY vl.voted_at DESC
    LIMIT 10
  `);
  
  return {
    overall: overallStats[0] || {
      total_voters: 0,
      total_votes_cast: 0,
      remaining_voters: 0,
      overall_turnout_percentage: 0
    },
    by_party: partyStats,
    by_village: villageStats,
    recent_votes: recentVotes
  };
}

module.exports = exports;