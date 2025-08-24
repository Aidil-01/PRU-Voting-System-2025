const { pool } = require('../config/database');

// Get all villages
exports.getAllVillages = async (req, res) => {
  try {
    const query = `
      SELECT 
        v.id,
        v.name,
        v.description,
        COUNT(vot.id) as voter_count,
        COUNT(CASE WHEN vot.has_voted = TRUE THEN 1 END) as votes_cast
      FROM villages v
      LEFT JOIN voters vot ON v.id = vot.village_id
      GROUP BY v.id, v.name, v.description
      ORDER BY v.name
    `;
    
    const [villages] = await pool.execute(query);
    res.json(villages);
  } catch (error) {
    console.error('Error fetching villages:', error);
    res.status(500).json({ error: 'Failed to fetch villages' });
  }
};

// Add new village
exports.addVillage = async (req, res) => {
  try {
    const { name, description = '' } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Village name is required' });
    }
    
    const query = 'INSERT INTO villages (name, description) VALUES (?, ?)';
    const [result] = await pool.execute(query, [name, description]);
    
    // Get the created village
    const [newVillage] = await pool.execute(
      'SELECT * FROM villages WHERE id = ?', 
      [result.insertId]
    );
    
    res.status(201).json({
      message: 'Village added successfully',
      village: newVillage[0]
    });
    
  } catch (error) {
    console.error('Error adding village:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Village name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add village' });
    }
  }
};

// Get village by ID with voters
exports.getVillageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get village info
    const [village] = await pool.execute(
      'SELECT * FROM villages WHERE id = ?', 
      [id]
    );
    
    if (village.length === 0) {
      return res.status(404).json({ error: 'Village not found' });
    }
    
    // Get voters in this village
    const [voters] = await pool.execute(`
      SELECT 
        v.id,
        v.name,
        v.ic_number,
        v.has_voted,
        v.voted_at,
        p.name as party_name,
        p.color as party_color
      FROM voters v
      LEFT JOIN parties p ON v.party_voted_id = p.id
      WHERE v.village_id = ?
      ORDER BY v.name
    `, [id]);
    
    res.json({
      village: village[0],
      voters
    });
    
  } catch (error) {
    console.error('Error fetching village:', error);
    res.status(500).json({ error: 'Failed to fetch village' });
  }
};

// Update village
exports.updateVillage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Village name is required' });
    }
    
    const query = 'UPDATE villages SET name = ?, description = ? WHERE id = ?';
    const [result] = await pool.execute(query, [name, description, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Village not found' });
    }
    
    // Get updated village
    const [updatedVillage] = await pool.execute(
      'SELECT * FROM villages WHERE id = ?', 
      [id]
    );
    
    res.json({
      message: 'Village updated successfully',
      village: updatedVillage[0]
    });
    
  } catch (error) {
    console.error('Error updating village:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Village name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update village' });
    }
  }
};

// Delete village
exports.deleteVillage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if village has voters
    const [voters] = await pool.execute(
      'SELECT COUNT(*) as count FROM voters WHERE village_id = ?', 
      [id]
    );
    
    if (voters[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete village with registered voters' 
      });
    }
    
    const query = 'DELETE FROM villages WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Village not found' });
    }
    
    res.json({ message: 'Village deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting village:', error);
    res.status(500).json({ error: 'Failed to delete village' });
  }
};

module.exports = exports;