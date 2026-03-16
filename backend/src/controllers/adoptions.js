import pool from '../database/pool.js';

export const getAdoptions = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT ad.*, a.name as animal_name, a.species_id,
             e.first_name || ' ' || e.last_name as employee_name
      FROM adoption ad
      JOIN animal a ON ad.animal_id = a.animal_id
      JOIN employee e ON ad.employee_id = e.employee_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND ad.status = $1`;
      params.push(status);
    }

    query += ` ORDER BY ad.adoption_date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get adoptions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdoptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT ad.*, a.name as animal_name, a.species_id,
              e.first_name || ' ' || e.last_name as employee_name
       FROM adoption ad
       JOIN animal a ON ad.animal_id = a.animal_id
       JOIN employee e ON ad.employee_id = e.employee_id
       WHERE ad.adoption_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Adoption not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get adoption error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAdoption = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      animal_id,
      adopter_name,
      adopter_cnic,
      adopter_contact,
      adopter_address,
      adoption_fee,
      status
    } = req.body;

    await client.query('BEGIN');

    const animalCheck = await client.query(
      'SELECT animal_id, name, status FROM animal WHERE animal_id = $1 FOR UPDATE',
      [animal_id]
    );

    if (animalCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Animal not found' });
    }

    if (animalCheck.rows[0].status !== 'In Shelter') {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Animal is not available for adoption (current status: ${animalCheck.rows[0].status})` 
      });
    }

    const adoptionResult = await client.query(
      `INSERT INTO adoption 
       (animal_id, adopter_name, adopter_cnic, adopter_contact, adopter_address,
        employee_id, adoption_fee, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [animal_id, adopter_name, adopter_cnic, adopter_contact, adopter_address,
       req.user.employeeId, adoption_fee || 0, status || 'Pending']
    );

    if (status === 'Completed') {
      await client.query(
        `UPDATE animal SET status = 'Adopted' WHERE animal_id = $1`,
        [animal_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(adoptionResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create adoption error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const updateAdoptionStatus = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    await client.query('BEGIN');

    const adoptionResult = await client.query(
      'SELECT animal_id FROM adoption WHERE adoption_id = $1',
      [id]
    );

    if (adoptionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Adoption not found' });
    }

    const animalId = adoptionResult.rows[0].animal_id;

    const updateResult = await client.query(
      'UPDATE adoption SET status = $1 WHERE adoption_id = $2 RETURNING *',
      [status, id]
    );

    if (status === 'Completed') {
      await client.query(
        `UPDATE animal SET status = 'Adopted' WHERE animal_id = $1`,
        [animalId]
      );
    }

    await client.query('COMMIT');

    res.json(updateResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update adoption status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
