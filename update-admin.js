const { pool } = require('./server/db.js');

async function updateAdmin() {
  try {
    const client = await pool.connect();
    
    // Update user 1 to admin role
    const result = await client.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
      ['admin', 1]
    );
    
    console.log('Updated user:', result.rows[0]);
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
}

updateAdmin();
