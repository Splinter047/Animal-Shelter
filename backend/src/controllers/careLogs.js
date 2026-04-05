import pool from '../database/pool.js';

export const getCareLogs = async (req, res) => {
  try {
    const { animal_id } = req.params;

    const result = await pool.query(
      `SELECT acl.*, e.first_name || ' ' || e.last_name as employee_name,
              a.name as animal_name
       FROM animal_care_log acl
       JOIN employee e ON acl.employee_id = e.employee_id
       JOIN animal a ON acl.animal_id = a.animal_id
       WHERE acl.animal_id = $1
       ORDER BY acl.log_date DESC`,
      [animal_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get care logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCareLog = async (req, res) => {
  try {
    const { animal_id } = req.params;
    const { care_type, notes, cost } = req.body;

    const result = await pool.query(
      `INSERT INTO animal_care_log (animal_id, employee_id, care_type, notes, cost)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [animal_id, req.user.employeeId, care_type, notes, cost || 0]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create care log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCareLog = async (req, res) => {
  try {
    const { animal_id, log_id } = req.params;
    const { care_type, notes, cost } = req.body;

    const sets = [];
    const values = [];
    let p = 1;

    if (care_type !== undefined) {
      sets.push(`care_type = $${p++}`);
      values.push(care_type);
    }
    if (notes !== undefined) {
      sets.push(`notes = $${p++}`);
      values.push(notes);
    }
    if (cost !== undefined) {
      sets.push(`cost = $${p++}`);
      values.push(cost);
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(log_id, animal_id);
    const result = await pool.query(
      `UPDATE animal_care_log SET ${sets.join(', ')}
       WHERE log_id = $${p++} AND animal_id = $${p}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Care log not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update care log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCareLog = async (req, res) => {
  try {
    const { animal_id, log_id } = req.params;

    const result = await pool.query(
      'DELETE FROM animal_care_log WHERE log_id = $1 AND animal_id = $2 RETURNING log_id',
      [log_id, animal_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Care log not found' });
    }

    res.json({ message: 'Care log deleted' });
  } catch (error) {
    console.error('Delete care log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
