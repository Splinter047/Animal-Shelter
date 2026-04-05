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

export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ animals: [], employees: [] });

    const searchTerm = `%${q}%`;
    const animalId = isNaN(q) ? -1 : parseInt(q);

    const animals = await pool.query(
      `SELECT a.animal_id, a.name, s.species_name as species, a.breed, a.status 
       FROM animal a 
       JOIN species s ON a.species_id = s.species_id
       WHERE a.name ILIKE $1 OR a.breed ILIKE $1 OR a.animal_id = $2
       LIMIT 5`,
      [searchTerm, animalId]
    );

    const employees = await pool.query(
      `SELECT employee_id, first_name, last_name, email 
       FROM employee 
       WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1
       LIMIT 5`,
      [searchTerm]
    );

    res.json({
      animals: animals.rows,
      employees: employees.rows
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM audit_log ORDER BY changed_at DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
