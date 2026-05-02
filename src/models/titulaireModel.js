const pool = require('../config/db');

/**
 * Récupère tous les titulaires
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT t.*, p.nom, p.prenom, p.mobile, s.libelle AS salleLibelle
    FROM Titulaire t
    LEFT JOIN Personne p ON t.idPers = p.idPers
    LEFT JOIN Salle s ON t.idSalle = s.idSalle
    WHERE t.isDelete = 0 AND 1=1
  `;
  const params = [];

  if (filters.actif !== undefined) query += ' AND t.actif = ?', params.push(filters.actif);
  if (filters.idSalle !== undefined) query += ' AND t.idSalle = ?', params.push(filters.idSalle);
  if (filters.idAdmin !== undefined) query += ' AND t.idAdmin = ?', params.push(filters.idAdmin);

  query += ' ORDER BY p.nom ASC, p.prenom ASC';
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère un titulaire par son ID
 */
const findById = async (idTitulaire) => {
  const [rows] = await pool.query(
    `SELECT t.*, p.nom, p.prenom, p.mobile, p.phone, s.libelle AS salleLibelle, c.libelle AS classeLibelle
     FROM Titulaire t
     LEFT JOIN Personne p ON t.idPers = p.idPers
     LEFT JOIN Salle s ON t.idSalle = s.idSalle
     LEFT JOIN Classe c ON s.idClasse = c.idClasse
     WHERE t.isDelete = 0 AND t.idTitulaire = ? LIMIT 1`,
    [idTitulaire]
  );
  return rows[0] || null;
};

/**
 * Crée un nouveau titulaire
 */
const create = async (data) => {
  const { idPers, idSalle, idAdmin } = data;
  
  // Vérifier qu'on n'a qu'un seul titulaire actif par salle
  const [existing] = await pool.query(
    'SELECT idTitulaire FROM Titulaire WHERE idSalle = ? AND actif = 1',
    [idSalle]
  );
  
  if (existing.length > 0) {
    throw new Error('Cette salle a déjà un titulaire actif');
  }

  const [result] = await pool.query(
    `INSERT INTO Titulaire (idPers, idSalle, actif, idAdmin)
     VALUES (?, ?, 1, ?)`,
    [idPers, idSalle, idAdmin]
  );
  return result.insertId;
};

/**
 * Met à jour un titulaire
 */
const update = async (idTitulaire, data) => {
  const allowedFields = ['idPers', 'idSalle', 'actif'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return false;

  values.push(idTitulaire);
  const [result] = await pool.query(
    `UPDATE Titulaire SET ${updates.join(', ')} WHERE isDelete = 0 AND idTitulaire = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Supprime un titulaire
 */
const remove = async (idTitulaire) => {
  const [result] = await pool.query('UPDATE Titulaire SET isDelete = 1 WHERE idTitulaire = ?', [idTitulaire]);
  return result.affectedRows > 0;
};

/**
 * Récupère le titulaire d'une salle
 */
const findBySalle = async (idSalle) => {
  const [rows] = await pool.query(
    `SELECT t.*, p.nom, p.prenom, p.mobile
     FROM Titulaire t
     LEFT JOIN Personne p ON t.idPers = p.idPers
     WHERE t.isDelete = 0 AND t.idSalle = ? AND t.actif = 1 LIMIT 1`,
    [idSalle]
  );
  return rows[0] || null;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  findBySalle,
};
