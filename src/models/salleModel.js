const pool = require('../config/db');

/**
 * Récupère toutes les salles
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT s.*, c.libelle AS classeLibelle
    FROM Salle s
    LEFT JOIN Classe c ON s.idClasse = c.idClasse
    WHERE 1=1
  `;
  const params = [];

  if (filters.actif !== undefined) query += ' AND s.actif = ?', params.push(filters.actif);
  if (filters.idClasse !== undefined) query += ' AND s.idClasse = ?', params.push(filters.idClasse);
  if (filters.idAdmin !== undefined) query += ' AND s.idAdmin = ?', params.push(filters.idAdmin);

  query += ' ORDER BY s.libelle ASC';
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère une salle par son ID
 */
const findById = async (idSalle) => {
  const [rows] = await pool.query(
    `SELECT s.*, c.libelle AS classeLibelle, t.idPers, p.nom, p.prenom
     FROM Salle s
     LEFT JOIN Classe c ON s.idClasse = c.idClasse
     LEFT JOIN Titulaire t ON s.idSalle = t.idSalle AND t.actif = 1
     LEFT JOIN Personne p ON t.idPers = p.idPers
     WHERE s.idSalle = ? LIMIT 1`,
    [idSalle]
  );
  return rows[0] || null;
};

/**
 * Crée une nouvelle salle
 */
const create = async (data) => {
  const { libelle, position, surface, idClasse, idAdmin } = data;
  const [result] = await pool.query(
    `INSERT INTO Salle (libelle, position, surface, idClasse, actif, idAdmin)
     VALUES (?, ?, ?, ?, 1, ?)`,
    [libelle, position || 'NON DEFINI', surface || '', idClasse, idAdmin]
  );
  return result.insertId;
};

/**
 * Met à jour une salle
 */
const update = async (idSalle, data) => {
  const allowedFields = ['libelle', 'position', 'surface', 'idClasse', 'actif'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return false;

  values.push(idSalle);
  const [result] = await pool.query(
    `UPDATE Salle SET ${updates.join(', ')} WHERE idSalle = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Supprime une salle
 */
const remove = async (idSalle) => {
  const [result] = await pool.query('DELETE FROM Salle WHERE idSalle = ?', [idSalle]);
  return result.affectedRows > 0;
};

/**
 * Récupère les salles d'une classe
 */
const findByClasse = async (idClasse) => {
  const [rows] = await pool.query(
    `SELECT s.* FROM Salle s WHERE s.idClasse = ? AND s.actif = 1 ORDER BY s.libelle ASC`,
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
