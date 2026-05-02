const pool = require('../config/db');

/**
 * Récupère tous les cours avec leurs détails
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT c.*, cl.libelle AS classeLibelle, e.nom AS enseignantNom, e.prenom AS enseignantPrenom
    FROM Cours c
    LEFT JOIN Classe cl ON c.idClasse = cl.idClasse
    LEFT JOIN Enseignant en ON c.idCours = en.idCours
    LEFT JOIN Personne e ON en.idPers = e.idPers
    WHERE c.isDelete = 0 AND 1=1
  `;
  const params = [];

  if (filters.actif !== undefined) query += ' AND c.actif = ?', params.push(filters.actif);
  if (filters.idClasse !== undefined) query += ' AND c.idClasse = ?', params.push(filters.idClasse);
  if (filters.idAdmin !== undefined) query += ' AND c.idAdmin = ?', params.push(filters.idAdmin);

  query += ' ORDER BY c.libelle ASC';
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère un cours par son ID
 */
const findById = async (idCours) => {
  const [rows] = await pool.query(
    `SELECT c.*, cl.libelle AS classeLibelle
     FROM Cours c
     LEFT JOIN Classe cl ON c.idClasse = cl.idClasse
     WHERE c.isDelete = 0 AND c.idCours = ? LIMIT 1`,
    [idCours]
  );
  return rows[0] || null;
};

/**
 * Crée un nouveau cours
 */
const create = async (data) => {
  const { libelle, note, coefficient, description, idClasse, idAdmin } = data;
  const [result] = await pool.query(
    `INSERT INTO Cours (libelle, note, coefficient, description, idClasse, actif, idAdmin, created_at)
     VALUES (?, ?, ?, ?, ?, 1, ?, NOW())`,
    [libelle, note || 0, coefficient || 1, description || '', idClasse, idAdmin]
  );
  return result.insertId;
};

/**
 * Met à jour un cours
 */
const update = async (idCours, data) => {
  const allowedFields = ['libelle', 'note', 'coefficient', 'description', 'idClasse', 'actif'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return false;

  values.push(idCours);
  const [result] = await pool.query(
    `UPDATE Cours SET ${updates.join(', ')} WHERE idCours = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Supprime un cours
 */
const remove = async (idCours) => {
  const [result] = await pool.query('UPDATE Cours SET isDelete = 1 WHERE idCours = ?', [idCours]);
  return result.affectedRows > 0;
};

/**
 * Récupère les cours d'une classe
 */
const findByClasse = async (idClasse) => {
  const [rows] = await pool.query(
    `SELECT c.* FROM Cours c WHERE c.isDelete = 0 AND c.idClasse = ? AND c.actif = 1 ORDER BY c.libelle ASC`,
    [idClasse]
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
};
