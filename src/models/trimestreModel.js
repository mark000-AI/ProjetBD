const pool = require('../config/db');

/**
 * Récupère tous les trimestres
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT t.*, a.libelle AS anneeLibelle
    FROM Trimestre t
    LEFT JOIN AnneeAcademique a ON t.idAca = a.idAnnee
    WHERE 1=1
  `;
  const params = [];

  if (filters.idAca !== undefined) query += ' AND t.idAca = ?', params.push(filters.idAca);
  if (filters.idAdmin !== undefined) query += ' AND t.idAdmin = ?', params.push(filters.idAdmin);

  query += ' ORDER BY t.libelle ASC';
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère un trimestre par son ID
 */
const findById = async (idTrimes) => {
  const [rows] = await pool.query(
    `SELECT t.*, a.libelle AS anneeLibelle
     FROM Trimestre t
     LEFT JOIN AnneeAcademique a ON t.idAca = a.idAnnee
     WHERE t.idTrimes = ? LIMIT 1`,
    [idTrimes]
  );
  return rows[0] || null;
};

/**
 * Crée un nouveau trimestre
 */
const create = async (data) => {
  const { libelle, periode, idAca, idAdmin } = data;
  const [result] = await pool.query(
    `INSERT INTO Trimestre (libelle, periode, idAca, idAdmin)
     VALUES (?, ?, ?, ?)`,
    [libelle, periode, idAca, idAdmin]
  );
  return result.insertId;
};

/**
 * Met à jour un trimestre
 */
const update = async (idTrimes, data) => {
  const allowedFields = ['libelle', 'periode', 'idAca'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return false;

  values.push(idTrimes);
  const [result] = await pool.query(
    `UPDATE Trimestre SET ${updates.join(', ')} WHERE idTrimes = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Supprime un trimestre
 */
const remove = async (idTrimes) => {
  const [result] = await pool.query('DELETE FROM Trimestre WHERE idTrimes = ?', [idTrimes]);
  return result.affectedRows > 0;
};

/**
 * Récupère les trimestres d'une année
 */
const findByAnnee = async (idAca) => {
  const [rows] = await pool.query(
    `SELECT t.* FROM Trimestre t WHERE t.idAca = ? ORDER BY t.libelle ASC`,
    [idAca]
  );
  return rows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findByAnnee,
};
