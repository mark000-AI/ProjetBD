require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  const [tables] = await connection.query('SHOW TABLES');
  
  for (const row of tables) {
    const tableName = Object.values(row)[0];
    try {
      await connection.query(`ALTER TABLE \`${tableName}\` ADD COLUMN isDelete tinyint(1) UNSIGNED NOT NULL DEFAULT 0`);
      console.log(`Added isDelete to ${tableName}`);
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.error(`Error adding isDelete to ${tableName}:`, e.message);
      } else {
        console.log(`isDelete already exists in ${tableName}`);
      }
    }
  }

  try {
    await connection.query('ALTER TABLE `Session` ADD COLUMN data_passage date NULL');
    console.log('Added data_passage to Session');
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') {
      console.error('Error adding data_passage to Session:', e.message);
    } else {
      console.log('data_passage already exists in Session');
    }
  }

  await connection.end();
}

migrate().catch(console.error);
