import pool from '../database/pool.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query(
      `SELECT e.employee_id, e.first_name, e.last_name, e.email, e.password_hash, 
              r.role_name, e.branch_id, e.is_active
       FROM employee e
       JOIN role r ON e.role_id = r.role_id
       WHERE e.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      employeeId: user.employee_id,
      email: user.email,
      role: user.role_name,
      branchId: user.branch_id,
    });

    res.json({
      token,
      user: {
        employeeId: user.employee_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role_name,
        branchId: user.branch_id,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, branch_id, phone, cnic } = req.body;

    if (!email || !password || !first_name || !last_name || !branch_id) {
      return res.status(400).json({
        error: 'email, password, first_name, last_name, and branch_id are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const branchCheck = await pool.query(
      'SELECT branch_id FROM branch WHERE branch_id = $1 AND is_active = TRUE',
      [branch_id]
    );
    if (branchCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or inactive branch' });
    }

    const roleResult = await pool.query(
      `SELECT role_id, base_salary FROM role WHERE role_name = 'Caretaker'`
    );
    if (roleResult.rows.length === 0) {
      return res.status(500).json({ error: 'Caretaker role not configured' });
    }

    const { role_id, base_salary } = roleResult.rows[0];
    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO employee
       (first_name, last_name, cnic, email, phone, hire_date, branch_id, role_id, salary, password_hash)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8, $9)
       RETURNING employee_id, first_name, last_name, email, branch_id`,
      [first_name, last_name, cnic || null, email, phone || null, branch_id, role_id, base_salary, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken({
      employeeId: user.employee_id,
      email: user.email,
      role: 'Caretaker',
      branchId: user.branch_id,
    });

    res.status(201).json({
      token,
      user: {
        employeeId: user.employee_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: 'Caretaker',
        branchId: user.branch_id,
      },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.employee_id, e.first_name, e.last_name, e.email, 
              r.role_name, e.branch_id, b.branch_name
       FROM employee e
       JOIN role r ON e.role_id = r.role_id
       JOIN branch b ON e.branch_id = b.branch_id
       WHERE e.employee_id = $1`,
      [req.user.employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      employeeId: user.employee_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role_name,
      branchId: user.branch_id,
      branchName: user.branch_name,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
