const pool = require('../config/db');

/**
 * Récupère tous les emplois de temps
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT e.*, c.libelle AS classeLibelle, crs.libelle AS coursLibelle
    FROM EmploiDuTemps e
    LEFT JOIN Classe c ON e.idClasse = c.idClasse
    LEFT JOIN Cours crs ON e.idCours = crs.idCours
    WHERE 1=1
  `;
  const params = [];

  if (filters.idClasse !== undefined) query += ' AND e.idClasse = ?', params.push(filters.idClasse);
  if (filters.jour !== undefined) query += ' AND e.jour = ?', params.push(filters.jour);
  if (filters.idAdmin !== undefined) query += ' AND e.idAdmin = ?', params.push(filters.idAdmin);

  query += ' ORDER BY e.jour ASC, e.heure ASC';
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère un emploi de temps par son ID
 */
const findById = async (idTemps) => {
  const [rows] = await pool.query(
    `SELECT e.*, c.libelle AS classeLibelle, crs.libelle AS coursLibelle
     FROM EmploiDuTemps e
     LEFT JOIN Classe c ON e.idClasse = c.idClasse
     LEFT JOIN Cours crs ON e.idCours = crs.idCours
     WHERE e.idTemps = ? LIMIT 1`,
    [idTemps]
  );
  return rows[0] || null;
};

/**
 * Crée un nouvel emploi de temps
 */
const create = async (data) => {
  const { jour, heure, idClasse, idCours, idAdmin } = data;
  const [result] = await pool.query(
    `INSERT INTO EmploiDuTemps (jour, heure, idClasse, idCours, idAdmin)
     VALUES (?, ?, ?, ?, ?)`,
    [jour, heure, idClasse, idCours, idAdmin]
  );
  return result.insertId;
};

/**
 * Met à jour un emploi de temps
 */
const update = async (idTemps, data) => {
  const allowedFields = ['jour', 'heure', 'idClasse', 'idCours'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return false;

  values.push(idTemps);
  const [result] = await pool.query(
    `UPDATE EmploiDuTemps SET ${updates.join(', ')} WHERE idTemps = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Supprime un emploi de temps
 */
const remove = async (idTemps) => {
  const [result] = await pool.query('DELETE FROM EmploiDuTemps WHERE idTemps = ?', [idTemps]);
  return result.affectedRows > 0;
};

/**
 * Récupère l'emploi de temps d'une classe
 */
const findByClasse = async (idClasse) => {
  const [rows] = await pool.query(
    `SELECT e.* FROM EmploiDuTemps e WHERE e.idClasse = ? ORDER BY e.jour ASC, e.heure ASC`,
    [idClasse]
  );
  return rows;
};

/**
 * Récupère l'emploi de temps pour un jour donné
 */
const findByJour = async (jour) => {
  const [rows] = await pool.query(
    `SELECT e.*, c.libelle AS classeLibelle, crs.libelle AS coursLibelle
     FROM EmploiDuTemps e
     LEFT JOIN Classe c ON e.idClasse = c.idClasse
     LEFT JOIN Cours crs ON e.idCours = crs.idCours
     WHERE e.jour = ? ORDER BY e.heure ASC`,
    [jour]
  );
  return rows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findByClasse,
  findByJour,
};
