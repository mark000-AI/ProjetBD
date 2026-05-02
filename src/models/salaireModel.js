const pool = require('../config/db');

/**
 * Récupère tous les salaires
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT s.*, p.nom, p.prenom, p.mobile, a.libelle AS anneeLibelle
    FROM Salaire s
    LEFT JOIN Personne p ON s.idPers = p.idPers
    LEFT JOIN AnneeAcademique a ON s.idAca = a.idAnnee
    WHERE 1=1
  `;
  const params = [];

  if (filters.idPers !== undefined) query += ' AND s.idPers = ?', params.push(filters.idPers);
  if (filters.idAca !== undefined) query += ' AND s.idAca = ?', params.push(filters.idAca);
  if (filters.mois !== undefined) query += ' AND s.mois = ?', params.push(filters.mois);

  query += ' ORDER BY p.nom ASC, s.mois DESC';
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère un salaire par son ID
 */
const findById = async (idSalaire) => {
  const [rows] = await pool.query(
    `SELECT s.*, p.nom, p.prenom, p.mobile, a.libelle AS anneeLibelle
     FROM Salaire s
     LEFT JOIN Personne p ON s.idPers = p.idPers
     LEFT JOIN AnneeAcademique a ON s.idAca = a.idAnnee
     WHERE s.idSalaire = ? LIMIT 1`,
    [idSalaire]
  );
  return rows[0] || null;
};

/**
 * Crée un nouveau salaire
 */
const create = async (data) => {
  const { montant, mois, idPers, idAca, idAdmin } = data;
  const [result] = await pool.query(
    `INSERT INTO Salaire (montant, mois, idPers, idAca, idAdmin)
     VALUES (?, ?, ?, ?, ?)`,
    [montant, mois || new Date().getMonth() + 1, idPers, idAca, idAdmin]
  );
  return result.insertId;
};

/**
 * Met à jour un salaire
 */
const update = async (idSalaire, data) => {
  const allowedFields = ['montant', 'mois'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return false;

  values.push(idSalaire);
  const [result] = await pool.query(
    `UPDATE Salaire SET ${updates.join(', ')} WHERE idSalaire = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Supprime un salaire
 */
const remove = async (idSalaire) => {
  const [result] = await pool.query('UPDATE Salaire SET isDelete = 1 WHERE idSalaire = ?', [idSalaire]);
  return result.affectedRows > 0;
};

/**
 * Récupère les salaires d'une personne pour une année
 */
const findByPersonneAnnee = async (idPers, idAca) => {
  const [rows] = await pool.query(
    `SELECT s.* FROM Salaire s WHERE s.idPers = ? AND s.idAca = ? ORDER BY s.mois DESC`,
    [idPers, idAca]
  );
  return rows;
};

/**
 * Récupère le total des salaires versés pour une personne et une année
 */
const getTotalAnnuel = async (idPers, idAca) => {
  const [rows] = await pool.query(
    `SELECT SUM(montant) as total FROM Salaire WHERE idPers = ? AND idAca = ?`,
    [idPers, idAca]
  );
  return rows[0]?.total || 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findByPersonneAnnee,
  getTotalAnnuel,
};
