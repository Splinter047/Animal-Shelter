import bcrypt from 'bcrypt';
import pool from './database/pool.js';

const SALT_ROUNDS = 10;

async function seedPasswords() {
  const client = await pool.connect();
  try {
    const defaultPassword = await bcrypt.hash('password123', SALT_ROUNDS);

    await client.query(`
      UPDATE employee 
      SET password_hash = $1 
      WHERE password_hash IS NULL
    `, [defaultPassword]);

    console.log('Passwords seeded successfully');
    console.log('Default password: password123');
  } catch (error) {
    console.error('Error seeding passwords:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedPasswords();
