const pool = require('../config/db');

/**
 * Récupère toutes les sessions
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT s.*, t.libelle AS trimestreLibelle, a.libelle AS anneeLibelle, p.nom, p.prenom
    FROM Session s
    LEFT JOIN Trimestre t ON s.idTrimestre = t.idTrimes
    LEFT JOIN AnneeAcademique a ON t.idAca = a.idAnnee
    LEFT JOIN Personne p ON s.idPers = p.idPers
    WHERE s.isDelete = 0 AND 1=1
  `;
  const params = [];

  if (filters.idTrimestre !== undefined) query += ' AND s.idTrimestre = ?', params.push(filters.idTrimestre);
  if (filters.idPers !== undefined) query += ' AND s.idPers = ?', params.push(filters.idPers);

  query += ' ORDER BY s.libelle ASC';
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère une session par son ID
 */
const findById = async (idSession) => {
  const [rows] = await pool.query(
    `SELECT s.*, t.libelle AS trimestreLibelle, a.libelle AS anneeLibelle, p.nom, p.prenom
     FROM Session s
     LEFT JOIN Trimestre t ON s.idTrimestre = t.idTrimes
     LEFT JOIN AnneeAcademique a ON t.idAca = a.idAnnee
     LEFT JOIN Personne p ON s.idPers = p.idPers
     WHERE s.isDelete = 0 AND s.idSession = ? LIMIT 1`,
    [idSession]
  );
  return rows[0] || null;
};

/**
 * Crée une nouvelle session
 */
const create = async (data) => {
  const { libelle, description, idTrimestre, idPers } = data;
  const [result] = await pool.query(
    `INSERT INTO Session (libelle, description, idTrimestre, idPers)
     VALUES (?, ?, ?, ?)`,
    [libelle, description || null, idTrimestre, idPers]
  );
  return result.insertId;
};

/**
 * Met à jour une session
 */
const update = async (idSession, data) => {
  const allowedFields = ['libelle', 'description', 'idTrimestre', 'idPers'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return false;

  values.push(idSession);
  const [result] = await pool.query(
    `UPDATE Session SET ${updates.join(', ')} WHERE idSession = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Supprime une session
 */
const remove = async (idSession) => {
  const [result] = await pool.query('UPDATE Session SET isDelete = 1 WHERE idSession = ?', [idSession]);
  return result.affectedRows > 0;
};

/**
 * Récupère les sessions d'un trimestre
 */
const findByTrimestre = async (idTrimestre) => {
  const [rows] = await pool.query(
    `SELECT s.* FROM Session s WHERE s.isDelete = 0 AND s.idTrimestre = ? ORDER BY s.libelle ASC`,
    [idTrimestre]
  );
  return rows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findByTrimestre,
};
