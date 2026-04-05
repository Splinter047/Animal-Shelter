import pool from '../database/pool.js';

export const getReports = async (req, res) => {
  try {
    const { status, city_id } = req.query;
    
    let query = `
      SELECT r.*, c.city_name, rt.team_name
      FROM report r
      JOIN city c ON r.city_id = c.city_id
      LEFT JOIN rescue_team rt ON r.assigned_team_id = rt.team_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND r.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (city_id) {
      query += ` AND r.city_id = $${paramCount}`;
      params.push(city_id);
      paramCount++;
    }

    query += ` ORDER BY r.reported_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createReport = async (req, res) => {
  try {
    const {
      channel,
      reporter_name,
      reporter_contact,
      description,
      location,
      location_text,
      city_id
    } = req.body;

    if (!description || !city_id) {
      return res.status(400).json({ error: 'Description and city_id are required' });
    }

    const finalLocation = location_text || location;
    if (!finalLocation) {
      return res.status(400).json({ error: 'Location is required' });
    }

    const result = await pool.query(
      `INSERT INTO report 
       (channel, reporter_name, reporter_contact, description, location_text, city_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [channel || 'Other', reporter_name, reporter_contact, description, finalLocation, city_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMissions = async (req, res) => {
  try {
    const { outcome, team_id } = req.query;
    
    let query = `
      SELECT rm.*, rt.team_name, r.description as report_description,
             a.name as animal_name
      FROM rescue_mission rm
      JOIN rescue_team rt ON rm.team_id = rt.team_id
      LEFT JOIN report r ON rm.report_id = r.report_id
      LEFT JOIN animal a ON rm.animal_id = a.animal_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (outcome) {
      query += ` AND rm.outcome = $${paramCount}`;
      params.push(outcome);
      paramCount++;
    }

    if (team_id) {
      query += ` AND rm.team_id = $${paramCount}`;
      params.push(team_id);
      paramCount++;
    }

    query += ` ORDER BY rm.dispatched_at DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMission = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { report_id, team_id } = req.body;

    if (!team_id) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    await client.query('BEGIN');

    const teamCheck = await client.query(
      'SELECT team_id, is_active FROM rescue_team WHERE team_id = $1 FOR SHARE',
      [team_id]
    );

    if (teamCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Team not found' });
    }

    if (!teamCheck.rows[0].is_active) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Team is not active' });
    }

    if (report_id) {
      await client.query(
        `UPDATE report 
         SET assigned_team_id = $1, status = 'Assigned'
         WHERE report_id = $2`,
        [team_id, report_id]
      );
    }

    const missionResult = await client.query(
      `INSERT INTO rescue_mission (report_id, team_id, outcome)
       VALUES ($1, $2, 'Ongoing')
       RETURNING *`,
      [report_id, team_id]
    );

    await client.query('COMMIT');

    res.status(201).json(missionResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create mission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_team_id } = req.body;

    const sets = [];
    const values = [];
    let p = 1;

    if (status !== undefined) {
      sets.push(`status = $${p++}`);
      values.push(status);
    }
    if (assigned_team_id !== undefined) {
      sets.push(`assigned_team_id = $${p++}`);
      values.push(assigned_team_id);
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE report SET ${sets.join(', ')} WHERE report_id = $${p} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMission = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { outcome, animal_id, notes, completed_at, animal_data } = req.body;

    await client.query('BEGIN');

    let finalAnimalId = animal_id;

    // If outcome is Rescued and we have animal data, create the animal
    if (outcome === 'Rescued' && animal_data && !animal_id) {
      let data = typeof animal_data === 'string' ? JSON.parse(animal_data) : animal_data;
      
      const image_url = req.file ? `/uploads/${req.file.filename}` : null;

      // Get branch_id from the mission's team
      const missionInfo = await client.query(
        'SELECT team_id FROM rescue_mission WHERE mission_id = $1',
        [id]
      );
      
      if (missionInfo.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Mission not found' });
      }

      const teamInfo = await client.query(
        'SELECT branch_id FROM rescue_team WHERE team_id = $1',
        [missionInfo.rows[0].team_id]
      );

      const branch_id = data.branch_id || teamInfo.rows[0].branch_id;

      const animalResult = await client.query(
        `INSERT INTO animal 
         (name, species_id, breed, gender, date_of_birth, colour, weight_kg,
          health_status, status, branch_id, intake_method, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING animal_id`,
        [
          data.name || null,
          data.species_id,
          data.breed || null,
          data.gender || 'U',
          data.date_of_birth || null,
          data.colour || null,
          data.weight_kg || null,
          data.health_status || 'Injured',
          'In Shelter',
          branch_id,
          'Rescue',
          image_url
        ]
      );
      finalAnimalId = animalResult.rows[0].animal_id;
    }

    const result = await client.query(
      `UPDATE rescue_mission
       SET outcome = COALESCE($1, outcome),
           animal_id = COALESCE($2, animal_id),
           notes = COALESCE($3, notes),
           completed_at = COALESCE($4, completed_at)
       WHERE mission_id = $5
       RETURNING *`,
      [outcome, finalAnimalId, notes, completed_at, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Mission not found' });
    }

    // Also update the report status to Resolved if mission is Rescued
    if (outcome === 'Rescued' && result.rows[0].report_id) {
      await client.query(
        "UPDATE report SET status = 'Resolved' WHERE report_id = $1",
        [result.rows[0].report_id]
      );
    }

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update mission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
