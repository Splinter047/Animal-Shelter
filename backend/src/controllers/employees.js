import pool from '../database/pool.js';
import { hashPassword } from '../utils/password.js';

export const getEmployees = async (req, res) => {
  try {
    const { branch_id, role_id, is_active } = req.query;
    
    let query = `
      SELECT e.employee_id, e.first_name, e.last_name, e.cnic, e.email,
             e.phone, e.hire_date, e.salary, e.is_active,
             r.role_name, b.branch_name
      FROM employee e
      JOIN role r ON e.role_id = r.role_id
      JOIN branch b ON e.branch_id = b.branch_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (branch_id) {
      query += ` AND e.branch_id = $${paramCount}`;
      params.push(branch_id);
      paramCount++;
    }

    if (role_id) {
      query += ` AND e.role_id = $${paramCount}`;
      params.push(role_id);
      paramCount++;
    }

    if (is_active !== undefined) {
      query += ` AND e.is_active = $${paramCount}`;
      params.push(is_active === 'true');
      paramCount++;
    }

    query += ` ORDER BY e.hire_date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      cnic,
      email,
      phone,
      branch_id,
      role_id,
      salary,
      password
    } = req.body;

    const passwordHash = await hashPassword(password || 'password123');

    const result = await pool.query(
      `INSERT INTO employee 
       (first_name, last_name, cnic, email, phone, branch_id, role_id, salary, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING employee_id, first_name, last_name, email, branch_id, role_id, salary`,
      [first_name, last_name, cnic, email, phone, branch_id, role_id, salary, passwordHash]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email or CNIC already in use' });
    }
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { salary, is_active, branch_id, role_id } = req.body;

    const result = await pool.query(
      `UPDATE employee
       SET salary = COALESCE($1, salary),
           is_active = COALESCE($2, is_active),
           branch_id = COALESCE($3, branch_id),
           role_id = COALESCE($4, role_id)
       WHERE employee_id = $5
       RETURNING employee_id, first_name, last_name, email, salary, is_active`,
      [salary, is_active, branch_id, role_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
