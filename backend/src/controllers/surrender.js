import pool from '../database/pool.js';

export const surrenderAnimal = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      name,
      species_id,
      breed,
      gender,
      date_of_birth,
      colour,
      weight_kg,
      health_status,
      branch_id,
      counterparty_name,
      counterparty_contact,
      notes
    } = req.body;

    if (!name || !species_id || !branch_id) {
      return res.status(400).json({ error: 'name, species_id, and branch_id are required' });
    }

    await client.query('BEGIN');

    const animalResult = await client.query(
      `INSERT INTO animal
       (name, species_id, breed, gender, date_of_birth, colour, weight_kg,
        health_status, status, branch_id, intake_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'In Shelter', $9, 'Owner Surrender')
       RETURNING *`,
      [name, species_id, breed, gender, date_of_birth, colour, weight_kg,
       health_status || 'Unknown', branch_id]
    );

    const animalId = animalResult.rows[0].animal_id;

    await client.query(
      `INSERT INTO animal_sale
       (animal_id, sale_type, counterparty_name, counterparty_contact,
        employee_id, amount, notes)
       VALUES ($1, 'Donation Received', $2, $3, $4, 0, $5)`,
      [animalId, counterparty_name, counterparty_contact, req.user.employeeId, notes]
    );

    await client.query(
      `INSERT INTO animal_care_log
       (animal_id, employee_id, care_type, notes)
       VALUES ($1, $2, 'Check-up', 'Initial assessment upon owner surrender intake')`,
      [animalId, req.user.employeeId]
    );

    await client.query('COMMIT');

    res.status(201).json(animalResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Surrender animal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
