const pool = require('../config/db');

/**
 * Récupère toutes les scolarités
 */
const findAll = async (filters = {}) => {
  let query = `
    SELECT s.*, cy.libelle AS cycleLibelle
    FROM Scolarite s
    LEFT JOIN Cycle cy ON s.idCycle = cy.idCycle
    WHERE 1=1
  `;
  const params = [];

  if (filters.idCycle !== undefined) query += ' AND s.idCycle = ?', params.push(filters.idCycle);

  query += ' ORDER BY s.idScolarite DESC';
  const [rows] = await pool.query(query, params);
  return rows;
};

/**
 * Récupère une scolarité par son ID
 */
const findById = async (idScolarite) => {
  const [rows] = await pool.query(
    `SELECT s.*, cy.libelle AS cycleLibelle
     FROM Scolarite s
     LEFT JOIN Cycle cy ON s.idCycle = cy.idCycle
     WHERE s.idScolarite = ? LIMIT 1`,
    [idScolarite]
  );
  return rows[0] || null;
};

/**
 * Récupère la scolarité d'un cycle
 */
const findByCycle = async (idCycle) => {
  const [rows] = await pool.query(
    `SELECT s.* FROM Scolarite s WHERE s.idCycle = ? LIMIT 1`,
    [idCycle]
  );
  return rows[0] || null;
};

/**
 * Crée une nouvelle scolarité
 */
const create = async (data) => {
  const { inscription, pension, nbreTranche, description, idCycle, idFondateur } = data;
  const [result] = await pool.query(
    `INSERT INTO Scolarite (inscription, pension, nbreTranche, description, idCycle, idFondateur)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [inscription, pension, nbreTranche || 3, description || '', idCycle, idFondateur]
  );
  return result.insertId;
};

/**
 * Met à jour une scolarité
 */
const update = async (idScolarite, data) => {
  const allowedFields = ['inscription', 'pension', 'nbreTranche', 'description'];
  const updates = [];
  const values = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (updates.length === 0) return false;

  values.push(idScolarite);
  const [result] = await pool.query(
    `UPDATE Scolarite SET ${updates.join(', ')} WHERE idScolarite = ?`,
    values
  );
  return result.affectedRows > 0;
};

/**
 * Supprime une scolarité
 */
const remove = async (idScolarite) => {
  const [result] = await pool.query('DELETE FROM Scolarite WHERE idScolarite = ?', [idScolarite]);
  return result.affectedRows > 0;
};

module.exports = {
  findAll,
  findById,
  findByCycle,
  create,
  update,
  remove,
};
