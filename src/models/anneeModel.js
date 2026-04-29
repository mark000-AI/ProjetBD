const pool = require('../config/db');

/**
 * Récupère toutes les années académiques
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT a.*
    FROM AnneeAcademique a
    WHERE 1=1
  `;
  const params = [];

  if (filters.idAdmin !== undefined) query += ' AND a.idAdmin = ?', params.push(filters.idAdmin);

  query += ' ORDER BY a.libelle DESC';
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère une année par son ID
 */
const findById = async (idAnnee) => {
  const [rows] = await pool.query(
    'SELECT a.* FROM AnneeAcademique a WHERE a.idAnnee = ? LIMIT 1',
    [idAnnee]
  );
  return rows[0] || null;
};

/**
 * Crée une nouvelle année
 */
const create = async (data) => {
  const { libelle, periode, idAdmin } = data;
  const [result] = await pool.query(
    `INSERT INTO AnneeAcademique (libelle, periode, idAdmin, created_at)
     VALUES (?, ?, ?, NOW())`,
    [libelle, periode, idAdmin]
  );
  return result.insertId;
};

/**
 * Met à jour une année
 */
const update = async (idAnnee, data) => {
  const allowedFields = ['libelle', 'periode'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return false;

  values.push(idAnnee);
  const [result] = await pool.query(
    `UPDATE AnneeAcademique SET ${updates.join(', ')} WHERE idAnnee = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Supprime une année
 */
const remove = async (idAnnee) => {
  const [result] = await pool.query('DELETE FROM AnneeAcademique WHERE idAnnee = ?', [idAnnee]);
  return result.affectedRows > 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
