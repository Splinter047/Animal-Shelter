import pool from '../pool.js';

const migrate = async () => {
  try {
    console.log('Adding last_care_date column to animal table...');
    await pool.query('ALTER TABLE animal ADD COLUMN IF NOT EXISTS last_care_date DATE DEFAULT CURRENT_DATE');
    
    // Initialize with most recent care log date if available
    await pool.query(`
      UPDATE animal a
      SET last_care_date = (
        SELECT MAX(log_date)
        FROM animal_care_log
        WHERE animal_id = a.animal_id
      )
      WHERE EXISTS (
        SELECT 1 FROM animal_care_log WHERE animal_id = a.animal_id
      )
    `);
    
    console.log('Successfully updated last_care_date.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
