const pool = require('../config/db');

/**
 * Récupère toutes les notifications
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT m.*, p.nom AS expediteurNom, p.prenom AS expediteurPrenom
    FROM Messages m
    LEFT JOIN Personne p ON m.idExp_Pers = p.idPers
    WHERE m.isDelete = 0 AND 1=1
  `;
  const params = [];

  if (filters.idParent !== undefined) query += ' AND m.idParent = ?', params.push(filters.idParent);
  if (filters.type_message !== undefined) query += ' AND m.type_message = ?', params.push(filters.type_message);
  if (filters.valider !== undefined) query += ' AND m.valider = ?', params.push(filters.valider);

  query += ' ORDER BY m.created_at DESC';
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère une notification par son ID
 */
const findById = async (idMessages) => {
  const [rows] = await pool.query(
    `SELECT m.*, p.nom AS expediteurNom, p.prenom AS expediteurPrenom
     FROM Messages m
     LEFT JOIN Personne p ON m.idExp_Pers = p.idPers
     WHERE m.isDelete = 0 AND m.idMessages = ? LIMIT 1`,
    [idMessages]
  );
  return rows[0] || null;
};

/**
 * Crée une nouvelle notification
 */
const create = async (data) => {
  const { objet, information, type_message, idExp_Pers, idParent, AnneeAcade } = data;
  const [result] = await pool.query(
    `INSERT INTO Messages (objet, information, type_message, idExp_Pers, idParent, AnneeAcade, valider)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
    [objet, information, type_message || 0, idExp_Pers, idParent || NULL, AnneeAcade || '']
  );
  return result.insertId;
};

/**
 * Met à jour une notification
 */
const update = async (idMessages, data) => {
  const allowedFields = ['objet', 'information', 'valider'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return false;

  values.push(idMessages);
  const [result] = await pool.query(
    `UPDATE Messages SET ${updates.join(', ')} WHERE idMessages = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Supprime une notification
 */
const remove = async (idMessages) => {
  const [result] = await pool.query('UPDATE Messages SET isDelete = 1 WHERE idMessages = ?', [idMessages]);
  return result.affectedRows > 0;
};

/**
 * Marque une notification comme validée
 */
const markAsValidated = async (idMessages) => {
  const [result] = await pool.query(
    'UPDATE Messages SET valider = 1 WHERE idMessages = ?',
    [idMessages]
  );
  return result.affectedRows > 0;
};

/**
 * Récupère les notifications d'un parent
 */
const findByParent = async (idParent) => {
  const [rows] = await pool.query(
    `SELECT m.*, p.nom AS expediteurNom, p.prenom AS expediteurPrenom
     FROM Messages m
     LEFT JOIN Personne p ON m.idExp_Pers = p.idPers
     WHERE m.isDelete = 0 AND m.idParent = ? ORDER BY m.created_at DESC`,
    [idParent]
  );
  return rows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  markAsValidated,
  findByParent,
};
