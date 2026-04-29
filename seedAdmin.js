require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

async function seed() {
  try {
    const password = 'admin';
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO Admin (ID, nom, username, password, actif, typeAdmin, mobile, alanyaID, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE password = ?, nom = ?`,
      [9999, 'Admin Test', 'admin', hashedPassword, 1, 1, '12345678', 'AL001', hashedPassword, 'Admin Test']
    );
    console.log('✅ Utilisateur admin test cree (ou mis a jour) avec succes dans la BD !');
    console.log('----------------------------------------------------');
    console.log('Nom utilisateur : admin');
    console.log('Mot de passe    : admin');
    console.log('Type Utilisateur: admin');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur lors de la creation de admin :', err);
    process.exit(1);
  }
}

seed();
