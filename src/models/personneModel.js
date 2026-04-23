const pool = require('../config/db');

/**
 * Trouve une Personne par son username.
 * @param {string} username
 * @returns {object|null}
 */
const findByUsername = async (username) => {
  const [rows] = await pool.query(
    'SELECT * FROM Personne WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0] || null;
};

/**
 * Trouve une Personne par son ID (sans le password).
 * @param {number} id
 * @returns {object|null}
 */
const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT idPers, nom, prenom, dateNaissance, lieuNaissance,
            mobile, phone, typePersonne, username, alanyaID, created_at
     FROM Personne WHERE idPers = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

module.exports = { findByUsername, findById };
