import pool from '../database/pool.js';

/** Minimal branch list for self-registration (no auth). */
export const getPublicCities = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT city_id, city_name, province FROM city ORDER BY city_name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Public cities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPublicBranches = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.branch_id, b.branch_name, c.city_name
       FROM branch b
       JOIN city c ON b.city_id = c.city_id
       WHERE b.is_active = TRUE
       ORDER BY b.branch_name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Public branches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
