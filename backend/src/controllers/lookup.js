import pool from '../database/pool.js';

export const getSpecies = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT species_id, species_name FROM species ORDER BY species_name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Lookup species error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCities = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT city_id, city_name, province FROM city ORDER BY city_name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Lookup cities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBranches = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.branch_id, b.branch_name, b.city_id, c.city_name
       FROM branch b
       JOIN city c ON b.city_id = c.city_id
       WHERE b.is_active = TRUE
       ORDER BY b.branch_name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Lookup branches error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRoles = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT role_id, role_name, base_salary FROM role ORDER BY role_name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Lookup roles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRescueTeams = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT team_id, team_name, branch_id, is_active
       FROM rescue_team
       WHERE is_active = TRUE
       ORDER BY team_name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Lookup rescue teams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
