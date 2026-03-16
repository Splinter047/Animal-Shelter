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
