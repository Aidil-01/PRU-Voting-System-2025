const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

// Get all parties
exports.getAllParties = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.abbreviation,
        p.color,
        p.logo_path,
        p.description,
        COUNT(v.id) as vote_count
      FROM parties p
      LEFT JOIN voters v ON p.id = v.party_voted_id AND v.has_voted = TRUE
      GROUP BY p.id, p.name, p.abbreviation, p.color, p.logo_path, p.description
      ORDER BY p.name
    `;
    
    const [parties] = await pool.execute(query);
    res.json(parties);
  } catch (error) {
    console.error('Error fetching parties:', error);
    res.status(500).json({ error: 'Failed to fetch parties' });
  }
};

// Add new party
exports.addParty = async (req, res) => {
  try {
    const { name, abbreviation = '', color = '#3B82F6', description = '' } = req.body;
    const logoPath = req.file ? `/uploads/party-flags/${req.file.filename}` : null;
    
    if (!name) {
      return res.status(400).json({ error: 'Party name is required' });
    }
    
    // Validate color format (hex color)
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return res.status(400).json({ error: 'Color must be a valid hex color code' });
    }
    
    const query = `
      INSERT INTO parties (name, abbreviation, color, logo_path, description) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [name, abbreviation, color, logoPath, description]);
    
    // Get the created party
    const [newParty] = await pool.execute(
      'SELECT * FROM parties WHERE id = ?', 
      [result.insertId]
    );
    
    res.status(201).json({
      message: 'Party added successfully',
      party: newParty[0]
    });
    
  } catch (error) {
    console.error('Error adding party:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Party name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add party' });
    }
  }
};

// Get party by ID with vote details
exports.getPartyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get party info with vote count
    const [party] = await pool.execute(`
      SELECT 
        p.id,
        p.name,
        p.abbreviation,
        p.color,
        p.description,
        COUNT(v.id) as vote_count,
        ROUND((COUNT(v.id) * 100.0 / (SELECT COUNT(*) FROM voters WHERE has_voted = TRUE)), 2) as percentage
      FROM parties p
      LEFT JOIN voters v ON p.id = v.party_voted_id AND v.has_voted = TRUE
      WHERE p.id = ?
      GROUP BY p.id, p.name, p.abbreviation, p.color, p.description
    `, [id]);
    
    if (party.length === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }
    
    // Get voters who voted for this party
    const [voters] = await pool.execute(`
      SELECT 
        v.id,
        v.name,
        v.ic_number,
        v.voted_at,
        vil.name as village_name
      FROM voters v
      JOIN villages vil ON v.village_id = vil.id
      WHERE v.party_voted_id = ? AND v.has_voted = TRUE
      ORDER BY v.voted_at DESC
    `, [id]);
    
    // Get vote distribution by village for this party
    const [villageDistribution] = await pool.execute(`
      SELECT 
        vil.name as village_name,
        COUNT(v.id) as vote_count
      FROM voters v
      JOIN villages vil ON v.village_id = vil.id
      WHERE v.party_voted_id = ? AND v.has_voted = TRUE
      GROUP BY vil.id, vil.name
      ORDER BY vote_count DESC
    `, [id]);
    
    res.json({
      party: party[0],
      voters,
      village_distribution: villageDistribution
    });
    
  } catch (error) {
    console.error('Error fetching party:', error);
    res.status(500).json({ error: 'Failed to fetch party' });
  }
};

// Update party
exports.updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, abbreviation, color, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Party name is required' });
    }
    
    // Validate color format if provided
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return res.status(400).json({ error: 'Color must be a valid hex color code' });
    }
    
    const query = `
      UPDATE parties 
      SET name = ?, abbreviation = ?, color = ?, description = ? 
      WHERE id = ?
    `;
    
    const [result] = await pool.execute(query, [name, abbreviation, color, description, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }
    
    // Get updated party
    const [updatedParty] = await pool.execute(
      'SELECT * FROM parties WHERE id = ?', 
      [id]
    );
    
    res.json({
      message: 'Party updated successfully',
      party: updatedParty[0]
    });
    
  } catch (error) {
    console.error('Error updating party:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Party name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update party' });
    }
  }
};

// Delete party
exports.deleteParty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if party has votes
    const [votes] = await pool.execute(
      'SELECT COUNT(*) as count FROM voters WHERE party_voted_id = ? AND has_voted = TRUE', 
      [id]
    );
    
    if (votes[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete party that has received votes' 
      });
    }
    
    const query = 'DELETE FROM parties WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Party not found' });
    }
    
    res.json({ message: 'Party deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting party:', error);
    res.status(500).json({ error: 'Failed to delete party' });
  }
};

// Upload logo for existing party
exports.uploadLogo = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    // Get current party to remove old logo
    const [currentParty] = await pool.execute('SELECT logo_path FROM parties WHERE id = ?', [id]);
    
    if (currentParty.length === 0) {
      // Delete uploaded file if party doesn't exist
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
      return res.status(404).json({ error: 'Party not found' });
    }
    
    const logoPath = `/uploads/party-flags/${req.file.filename}`;
    
    // Update party with new logo
    await pool.execute('UPDATE parties SET logo_path = ? WHERE id = ?', [logoPath, id]);
    
    // Delete old logo file if exists
    if (currentParty[0].logo_path) {
      const oldLogoPath = path.join(__dirname, '..', currentParty[0].logo_path);
      fs.unlink(oldLogoPath, (err) => {
        if (err) console.error('Error deleting old logo:', err);
      });
    }
    
    // Get updated party
    const [updatedParty] = await pool.execute('SELECT * FROM parties WHERE id = ?', [id]);
    
    res.json({
      message: 'Logo uploaded successfully',
      party: updatedParty[0]
    });
    
  } catch (error) {
    console.error('Error uploading logo:', error);
    
    // Clean up uploaded file if error occurs
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    
    res.status(500).json({ error: 'Failed to upload logo' });
  }
};

// Get party colors for frontend
exports.getPartyColors = async (req, res) => {
  try {
    const [parties] = await pool.execute(
      'SELECT id, name, abbreviation, color, logo_path FROM parties ORDER BY name'
    );
    
    const colorMap = {};
    parties.forEach(party => {
      colorMap[party.id] = {
        name: party.name,
        abbreviation: party.abbreviation,
        color: party.color,
        logo_path: party.logo_path
      };
    });
    
    res.json(colorMap);
  } catch (error) {
    console.error('Error fetching party colors:', error);
    res.status(500).json({ error: 'Failed to fetch party colors' });
  }
};

module.exports = exports;