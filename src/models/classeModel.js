const pool = require('../config/db');

/**
 * Récupère toutes les classes avec le nom du cycle
 */
const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT c.idClasse, c.libelle, c.idCycle, c.idAdmin, c.created_at, cy.libelle as cycle
     FROM Classe c
     LEFT JOIN Cycle cy ON c.idCycle = cy.idCycle
     ORDER BY cy.libelle ASC, c.libelle ASC`
  );
  return rows;
};

/**
 * Récupère une classe par son ID
 * @param {number} idClasse
 */
const findById = async (idClasse) => {
  const [rows] = await pool.query(
    `SELECT c.idClasse, c.libelle, c.idCycle, c.idAdmin, c.created_at, cy.libelle as cycle
     FROM Classe c
     LEFT JOIN Cycle cy ON c.idCycle = cy.idCycle
     WHERE c.isDelete = 0 AND c.idClasse = ? LIMIT 1`,
    [idClasse]
  );
  return rows[0] || null;
};

/**
 * Crée une nouvelle classe
 * @param {object} classeData
 */
const create = async (classeData) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [maxRows] = await conn.query('SELECT MAX(idClasse) as maxId FROM Classe');
    const newId = (maxRows[0].maxId || 0) + 1;

    await conn.query(
      `INSERT INTO Classe (idClasse, libelle, idCycle, idAdmin, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [newId, classeData.libelle, classeData.idCycle, classeData.idAdmin]
    );
    await conn.commit();
    return newId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Met à jour une classe
 * @param {number} idClasse
 * @param {object} data
 */
const update = async (idClasse, data) => {
  const fields = [];
  const params = [];

  const allowed = ['libelle', 'idCycle'];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }

  if (fields.length === 0) return 0;
  params.push(idClasse);

  const [result] = await pool.query(
    `UPDATE Classe SET ${fields.join(', ')} WHERE Classe.isDelete = 0 AND idClasse = ?`,
    params
  );
  return result.affectedRows;
};

/**
 * Supprime une classe
 * @param {number} idClasse
 */
const remove = async (idClasse) => {
  const [result] = await pool.query(
    `UPDATE Classe SET isDelete = 1 WHERE idClasse = ?`,
    [idClasse]
  );
  return result.affectedRows;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
