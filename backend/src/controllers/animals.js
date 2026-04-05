import pool from '../database/pool.js';

export const getAnimals = async (req, res) => {
  try {
    const { status, species_id, branch_id, health_status } = req.query;
    
    let query = `
      SELECT a.*, s.species_name, b.branch_name, c.city_name
      FROM animal a
      JOIN species s ON a.species_id = s.species_id
      JOIN branch b ON a.branch_id = b.branch_id
      JOIN city c ON b.city_id = c.city_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (species_id) {
      query += ` AND a.species_id = $${paramCount}`;
      params.push(species_id);
      paramCount++;
    }

    if (branch_id) {
      query += ` AND a.branch_id = $${paramCount}`;
      params.push(branch_id);
      paramCount++;
    }

    if (health_status) {
      query += ` AND a.health_status = $${paramCount}`;
      params.push(health_status);
      paramCount++;
    }

    query += ` ORDER BY a.intake_date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get animals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAnimalById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT a.*, s.species_name, b.branch_name, c.city_name
       FROM animal a
       JOIN species s ON a.species_id = s.species_id
       JOIN branch b ON a.branch_id = b.branch_id
       JOIN city c ON b.city_id = c.city_id
       WHERE a.animal_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get animal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAnimal = async (req, res) => {
  try {
    const {
      name, species_id, breed, gender, date_of_birth, colour,
      weight_kg, health_status, status, branch_id, intake_method
    } = req.body;

    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO animal 
       (name, species_id, breed, gender, date_of_birth, colour, weight_kg,
        health_status, status, branch_id, intake_method, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [name, species_id, breed, gender, date_of_birth, colour, weight_kg,
       health_status || 'Unknown', status || 'In Shelter', branch_id, intake_method, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create animal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, breed, gender, date_of_birth, colour, weight_kg,
      health_status, status, branch_id
    } = req.body;

    let image_url = undefined;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `UPDATE animal
       SET name = COALESCE($1, name),
           breed = COALESCE($2, breed),
           gender = COALESCE($3, gender),
           date_of_birth = COALESCE($4, date_of_birth),
           colour = COALESCE($5, colour),
           weight_kg = COALESCE($6, weight_kg),
           health_status = COALESCE($7, health_status),
           status = COALESCE($8, status),
           branch_id = COALESCE($9, branch_id),
           image_url = COALESCE($10, image_url)
       WHERE animal_id = $11
       RETURNING *`,
      [name, breed, gender, date_of_birth, colour, weight_kg,
       health_status, status, branch_id, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update animal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAnimal = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM animal WHERE animal_id = $1 RETURNING animal_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Animal not found' });
    }

    res.json({ message: 'Animal deleted successfully' });
  } catch (error) {
    console.error('Delete animal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
