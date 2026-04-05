import pool from '../database/pool.js';

export const getMedicalRecords = async (req, res) => {
  try {
    const { animal_id } = req.params;
    const result = await pool.query(
      `SELECT mr.*, e.first_name || ' ' || e.last_name as employee_name,
              a.name as animal_name
       FROM medical_record mr
       JOIN employee e ON mr.employee_id = e.employee_id
       JOIN animal a ON mr.animal_id = a.animal_id
       WHERE mr.animal_id = $1
       ORDER BY mr.visit_date DESC`,
      [animal_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMedicalRecord = async (req, res) => {
  try {
    const { animal_id } = req.params;
    const { diagnosis, treatment_plan, medication_prescribed, cost, next_visit_date, visit_date } = req.body;

    const result = await pool.query(
      `INSERT INTO medical_record 
       (animal_id, employee_id, visit_date, diagnosis, treatment_plan, medication_prescribed, cost, next_visit_date)
       VALUES ($1, $2, COALESCE($3, CURRENT_DATE), $4, $5, $6, $7, $8)
       RETURNING *`,
      [animal_id, req.user.employeeId, visit_date, diagnosis, treatment_plan, medication_prescribed, cost || 0, next_visit_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, treatment_plan, medication_prescribed, cost, next_visit_date, visit_date } = req.body;

    const result = await pool.query(
      `UPDATE medical_record
       SET diagnosis = COALESCE($1, diagnosis),
           treatment_plan = COALESCE($2, treatment_plan),
           medication_prescribed = COALESCE($3, medication_prescribed),
           cost = COALESCE($4, cost),
           next_visit_date = COALESCE($5, next_visit_date),
           visit_date = COALESCE($6, visit_date)
       WHERE record_id = $7
       RETURNING *`,
      [diagnosis, treatment_plan, medication_prescribed, cost, next_visit_date, visit_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM medical_record WHERE record_id = $1 RETURNING record_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    res.json({ message: 'Medical record deleted' });
  } catch (error) {
    console.error('Delete medical record error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUpcomingVisits = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mr.*, a.name as animal_name
       FROM medical_record mr
       JOIN animal a ON mr.animal_id = a.animal_id
       WHERE mr.next_visit_date >= CURRENT_DATE
       ORDER BY mr.next_visit_date ASC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get upcoming visits error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
